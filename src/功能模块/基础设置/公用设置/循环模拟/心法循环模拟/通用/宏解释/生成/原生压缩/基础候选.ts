import { 原生动作, 原生规则, 原生候选, 条件连接, 空位图 } from './类型'
import { 原生样本 } from './样本'
import { 规范规则, 更短叶子 } from './条件'

export const 复制规则 = (规则: readonly 原生规则[]): 原生规则[] =>
  规则.map((行) => ({
    action: 行.action,
    atoms: [...行.atoms],
    ...(行.ops ? { ops: [...行.ops] } : 行.any_atoms ? { any_atoms: [...行.any_atoms] } : {}),
  }))

export const 复杂条件 = (规则: 原生规则) => !!规则.any_atoms?.length || !!规则.ops?.includes('|')
const 数字排序 = (值: Iterable<number>) => [...值].sort((左, 右) => 左 - 右)
const 相同规则 = (左: 原生规则 | undefined, 右: 原生规则 | undefined) =>
  左 === 右 || JSON.stringify(左) === JSON.stringify(右)

export function 删除链原子(规则: 原生规则, 索引: number): 原生规则 {
  const [结果] = 复制规则([规则])
  结果.atoms.splice(索引, 1)
  if (结果.ops) {
    if (结果.ops.length) 结果.ops.splice(Math.min(索引, 结果.ops.length - 1), 1)
    if (!结果.ops.includes('|')) delete 结果.ops
  }
  return 结果
}

export type 批次修改 = readonly [number, 原生规则 | null]

class 批次计划 {
  readonly 原始: 原生规则[]
  当前: Map<number, 原生规则>
  单位: number

  constructor(
    规则: 原生规则[],
    readonly 样本: 原生样本,
  ) {
    this.原始 = 复制规则(规则)
    this.当前 = new Map(复制规则(规则).map((行, 索引) => [索引, 行]))
    this.单位 = 规则.reduce((和, 行) => 和 + 样本.规则成本(行) + 1, 0)
  }

  条目() {
    return [...this.当前.entries()].sort(([左], [右]) => 左 - 右)
  }
  规则() {
    return this.条目().map(([, 行]) => 行)
  }

  修改(修改: readonly 批次修改[]) {
    this.样本.check()
    const 当前 = new Map(this.当前)
    let 单位 = this.单位
    for (const [索引, 替换] of 修改) {
      const 旧行 = 当前.get(索引)
      if (旧行) {
        单位 -= this.样本.规则成本(旧行) + 1
        当前.delete(索引)
      }
      if (替换 !== null) {
        当前.set(索引, 替换)
        单位 += this.样本.规则成本(替换) + 1
      }
    }
    if (
      单位 >= this.单位 ||
      !this.样本.兼容([...当前.entries()].sort(([左], [右]) => 左 - 右).map(([, 行]) => 行))
    )
      return false
    this.当前 = 当前
    this.单位 = 单位
    return true
  }

  修改列表(): 批次修改[] {
    return this.原始.flatMap((行, 索引) =>
      相同规则(行, this.当前.get(索引)) ? [] : [[索引, this.当前.get(索引) ?? null] as 批次修改],
    )
  }

  分组() {
    const 组 = new Map<number, number[]>()
    for (const [索引, 行] of this.条目()) {
      if (!组.has(行.action)) 组.set(行.action, [])
      组.get(行.action)!.push(索引)
    }
    return [...组.values()]
  }
}

function* 分块(索引: number[]) {
  if (索引.length < 2) return
  yield 索引
  for (const 宽度 of [8, 4, 2]) {
    if (宽度 >= 索引.length) continue
    for (let 开始 = 0; 开始 < 索引.length; 开始 += 宽度) {
      const 组 = 索引.slice(开始, 开始 + 宽度)
      if (组.length > 1) yield 组
    }
  }
}

export function 基础批次(规则: 原生规则[], 样本: 原生样本, 动作: readonly 原生动作[]) {
  const 计划 = new 批次计划(规则, 样本)
  const [选择] = 样本.选择(规则)
  计划.修改(选择.flatMap((位图, 索引) => (位图 ? [] : [[索引, null] as 批次修改])))
  for (const 索引 of 计划.当前.keys()) {
    const 行 = 计划.当前.get(索引)!
    if (!动作[行.action].fcast) continue
    const 普通 = 动作.findIndex((项) => !项.fcast && 项.name === 动作[行.action].name)
    if (普通 >= 0) 计划.修改([[索引, { ...复制规则([行])[0], action: 普通 }]])
  }
  for (const 索引 of [...计划.当前.keys()].sort(
    (左, 右) => 样本.规则成本(计划.当前.get(右)!) - 样本.规则成本(计划.当前.get(左)!),
  )) {
    计划.修改([[索引, null]])
  }
  for (const 索引 of [...计划.当前.keys()]) {
    if (计划.当前.get(索引)!.ops?.includes('|')) continue
    const 原子 = [...计划.当前.get(索引)!.atoms].sort(
      (左, 右) => 样本.atom_costs[右] - 样本.atom_costs[左],
    )
    for (const 原子索引 of 原子) {
      const [替换] = 复制规则([计划.当前.get(索引)!])
      替换.atoms = 替换.atoms.filter((值) => 值 !== 原子索引)
      delete 替换.ops
      计划.修改([[索引, 替换]])
    }
  }
  for (const 索引组 of 计划.分组())
    for (const 组 of 分块(索引组)) {
      const 存活 = 组.filter((索引) => 计划.当前.has(索引))
      if (存活.length < 2 || 存活.some((索引) => 复杂条件(计划.当前.get(索引)!))) continue
      const 共同 = 计划.当前
        .get(存活[0])!
        .atoms.filter((原子) =>
          存活.slice(1).every((索引) => 计划.当前.get(索引)!.atoms.includes(原子)),
        )
      计划.修改([
        ...存活.slice(1).map((索引) => [索引, null] as 批次修改),
        [存活[0], { action: 计划.当前.get(存活[0])!.action, atoms: 数字排序(new Set(共同)) }],
      ])
    }
  return 计划.修改列表()
}

export function 特征批次(规则: 原生规则[], 样本: 原生样本) {
  const 计划 = new 批次计划(规则, 样本)
  for (const 索引组 of 计划.分组())
    for (const 组 of 分块(索引组)) {
      const 存活 = 组.filter((索引) => 计划.当前.has(索引))
      if (存活.length < 2 || 存活.some((索引) => 复杂条件(计划.当前.get(索引)!))) continue
      const 键 = 计划.条目().map(([索引]) => 索引)
      const [位图] = 样本.选择(计划.规则())
      const 选择 = new Map(键.map((索引, 位置) => [索引, 位图[位置]]))
      const 正例 = 存活.reduce((和, 索引) => 和 | 选择.get(索引)!, 空位图)
      const 动作 = 计划.当前.get(存活[0])!.action
      for (const 位置 of [存活[0], 存活[存活.length - 1]]) {
        let 先前 = 空位图
        for (const [索引, 命中] of 选择) if (索引 < 位置) 先前 |= 命中
        const 负例 = 样本.all & ~先前 & 样本.executable[动作] & 样本.rejected[动作]
        for (const 条件 of 样本.覆盖条件(正例, 负例)) {
          if (
            计划.修改([
              ...存活.filter((索引) => 索引 !== 位置).map((索引) => [索引, null] as 批次修改),
              [位置, { action: 动作, atoms: 条件 }],
            ])
          )
            break
        }
        if (存活.filter((索引) => 计划.当前.has(索引)).length < 存活.length) break
      }
    }
  for (const 索引 of 数字排序(计划.当前.keys())) {
    if (复杂条件(计划.当前.get(索引)!)) continue
    const 键 = 计划.条目().map(([键]) => 键)
    const [选择] = 样本.选择(计划.规则())
    let 先前 = 空位图
    键.forEach((键, 位置) => {
      if (键 < 索引) 先前 |= 选择[位置]
    })
    const 动作 = 计划.当前.get(索引)!.action
    const 负例 = 样本.all & ~先前 & 样本.executable[动作] & 样本.rejected[动作]
    for (const 条件 of 样本.覆盖条件(选择[键.indexOf(索引)], 负例)) {
      if (计划.修改([[索引, { action: 动作, atoms: 条件 }]])) break
    }
  }
  return 计划.修改列表()
}

export function* 单项修改(
  规则: 原生规则[],
  动作: readonly 原生动作[],
  检查: () => void,
): Generator<原生候选> {
  for (let 索引 = 0; 索引 < 规则.length; 索引++) {
    检查()
    const 行 = 规则[索引]
    yield ['remove_rule', [...规则.slice(0, 索引), ...规则.slice(索引 + 1)]]
    if (动作[行.action].fcast) {
      const 普通 = 动作.findIndex((项) => !项.fcast && 项.name === 动作[行.action].name)
      if (普通 >= 0) {
        const 提案 = 复制规则(规则)
        提案[索引].action = 普通
        yield ['fcast_to_cast', 提案]
      }
    }
    for (let 原子 = 0; 原子 < 行.atoms.length; 原子++) {
      const 提案 = 复制规则(规则)
      提案[索引] = 删除链原子(行, 原子)
      yield ['remove_atom', 提案]
    }
    if ((行.any_atoms?.length ?? 0) > 1)
      for (let 原子 = 0; 原子 < 行.any_atoms!.length; 原子++) {
        检查()
        const 提案 = 复制规则(规则)
        提案[索引].any_atoms!.splice(原子, 1)
        if (提案[索引].any_atoms!.length === 1) {
          提案[索引].atoms.push(...提案[索引].any_atoms!)
          delete 提案[索引].any_atoms
        }
        yield ['remove_or_atom', 提案]
      }
    for (let 后 = 索引 + 1; 后 < 规则.length; 后++) {
      if (规则[后].action !== 行.action || 复杂条件(行) || 复杂条件(规则[后])) continue
      const 提案 = 复制规则(规则)
      提案[索引] = {
        action: 行.action,
        atoms: 数字排序(new Set(行.atoms.filter((原子) => 规则[后].atoms.includes(原子)))),
      }
      提案.splice(后, 1)
      yield ['merge_same_action', 提案]
    }
  }
}

export function* 特征修改(规则: 原生规则[], 样本: 原生样本): Generator<原生候选> {
  const [选择] = 样本.选择(规则)
  let 剩余 = 样本.all
  for (let 索引 = 0; 索引 < 规则.length; 索引++) {
    样本.check()
    const 行 = 规则[索引]
    const 负例 = 剩余 & 样本.executable[行.action] & 样本.rejected[行.action]
    if (!复杂条件(行))
      for (const 条件 of 样本.覆盖条件(选择[索引], 负例)) {
        const 提案 = 复制规则(规则)
        提案[索引] = { action: 行.action, atoms: 条件 }
        yield ['replace_guard', 提案]
      }
    剩余 &= ~选择[索引]
  }
  const 分组 = new Map<number, number[]>()
  规则.forEach((行, 索引) => {
    if (!分组.has(行.action)) 分组.set(行.action, [])
    分组.get(行.action)!.push(索引)
  })
  for (const [动作, 位置] of 分组) {
    if (位置.some((索引) => 复杂条件(规则[索引]))) continue
    for (let 左 = 0; 左 < 位置.length; 左++)
      for (const 右 of 位置.slice(左 + 1)) {
        const 索引 = 位置[左]
        样本.check()
        const 正例 = 选择[索引] | 选择[右]
        for (const 插入 of [索引, 右]) {
          const 先前 = 选择.slice(0, 插入).reduce((和, 位图) => 和 | 位图, 空位图)
          const 负例 = 样本.all & ~先前 & 样本.executable[动作] & 样本.rejected[动作]
          for (const 条件 of 样本.覆盖条件(正例, 负例)) {
            const 提案 = 复制规则(规则)
            提案[插入] = { action: 动作, atoms: 条件 }
            提案.splice(插入 === 索引 ? 右 : 索引, 1)
            yield ['group_replace_and_move', 提案]
          }
        }
      }
  }
}

export function* 链叶修改(规则: 原生规则[], 样本: 原生样本, 等长 = false): Generator<原生候选> {
  const [选择] = 样本.选择(规则)
  let 剩余 = 样本.all
  for (let 索引 = 0; 索引 < 规则.length; 索引++) {
    样本.check()
    const 行 = 规则[索引]
    const 负例 = 剩余 & 样本.executable[行.action] & 样本.rejected[行.action]
    if (复杂条件(行)) {
      for (const 条件 of 更短叶子(行, 选择[索引], 负例, 样本, { equalCost: 等长 })) {
        const 提案 = 复制规则(规则)
        提案[索引] = { ...条件, action: 行.action }
        if (样本.兼容(提案)) yield ['replace_chain_leaf', 提案]
      }
      if (!等长 && 选择[索引])
        for (const 原子 of 样本.覆盖条件(选择[索引], 负例)) {
          const 替换 = { action: 行.action, atoms: 原子 }
          if (样本.规则成本(替换) >= 样本.规则成本(行)) continue
          const 提案 = 复制规则(规则)
          提案[索引] = 替换
          if (样本.兼容(提案)) yield ['replace_chain_guard', 提案]
        }
    }
    剩余 &= ~选择[索引]
  }
}

export function* 链叶桥接(规则: 原生规则[], 样本: 原生样本, 上限 = 8): Generator<原生候选> {
  const 候选: { 排名: number[]; 提案: 原生规则[] }[] = []
  for (const [, 提案] of 链叶修改(规则, 样本, true))
    for (let 索引 = 0; 索引 < 规则.length; 索引++) {
      if (相同规则(规则[索引], 提案[索引])) continue
      const 前 = 规范规则(规则[索引]).atoms
      const 后 = 规范规则(提案[索引]).atoms
      const 位 = 前.findIndex((原子, 位) => 原子 !== 后[位])
      if (位 < 0) continue
      const 旧时钟 = 样本.atoms[前[位]].includes('bufftime:')
      const 新时钟 = 样本.atoms[后[位]].includes('bufftime:')
      候选.push({ 排名: [旧时钟 && !新时钟 ? 0 : 旧时钟 ? 1 : 2, 索引, 后[位], 前[位]], 提案 })
      break
    }
  候选.sort((左, 右) => {
    for (let 位 = 0; 位 < 左.排名.length; 位++)
      if (左.排名[位] !== 右.排名[位]) return 左.排名[位] - 右.排名[位]
    return 0
  })
  for (const { 提案 } of 候选.slice(0, 上限)) {
    样本.check()
    yield ['bridge_chain_leaf', 提案]
  }
}

export function* 或项合并(规则: 原生规则[], 样本: 原生样本, 配对上限 = 128): Generator<原生候选> {
  const 分组 = new Map<number, number[]>()
  规则.forEach((行, 索引) => {
    if (!分组.has(行.action)) 分组.set(行.action, [])
    分组.get(行.action)!.push(索引)
  })
  let 配对 = 0
  for (const [动作, 位置] of 分组)
    for (let 左位 = 0; 左位 < 位置.length; 左位++)
      for (const 右位 of 位置.slice(左位 + 1)) {
        样本.check()
        if (配对++ >= 配对上限) return
        const 左索引 = 位置[左位],
          左 = 规则[左索引],
          右 = 规则[右位]
        if (左.ops?.includes('|') || 右.ops?.includes('|')) continue
        const 左集 = new Set(左.atoms),
          右集 = new Set(右.atoms)
        let 前缀: number[], 左尾: number[], 右尾: number[]
        if (左.any_atoms?.length || 右.any_atoms?.length) {
          前缀 = 数字排序(左.any_atoms?.length ? 左集 : 右集)
          if (
            (左.any_atoms?.length &&
              (左集.size !== 前缀.length || 前缀.some((值) => !左集.has(值)))) ||
            (右.any_atoms?.length &&
              (右集.size !== 前缀.length || 前缀.some((值) => !右集.has(值))))
          )
            continue
          左尾 = 左.any_atoms?.length
            ? [...左.any_atoms]
            : 数字排序([...左集].filter((值) => !前缀.includes(值)))
          右尾 = 右.any_atoms?.length
            ? [...右.any_atoms]
            : 数字排序([...右集].filter((值) => !前缀.includes(值)))
          if (
            (!左.any_atoms?.length && (左尾.length !== 1 || 前缀.some((值) => !左集.has(值)))) ||
            (!右.any_atoms?.length && (右尾.length !== 1 || 前缀.some((值) => !右集.has(值))))
          )
            continue
        } else {
          前缀 = 数字排序([...左集].filter((值) => 右集.has(值)))
          左尾 = 数字排序([...左集].filter((值) => !右集.has(值)))
          右尾 = 数字排序([...右集].filter((值) => !左集.has(值)))
          if (左尾.length !== 1 || 右尾.length !== 1) continue
        }
        const 后缀 = 数字排序(new Set([...左尾, ...右尾]))
        if (后缀.length < 2) continue
        const 合并 = { action: 动作, atoms: 前缀, any_atoms: 后缀 }
        if (样本.规则成本(合并) + 1 >= 样本.规则成本(左) + 样本.规则成本(右) + 2) continue
        for (const 插入 of [左索引, 右位]) {
          样本.check()
          const 提案 = 复制规则(规则)
          提案[插入] = 复制规则([合并])[0]
          提案.splice(插入 === 左索引 ? 右位 : 左索引, 1)
          if (样本.兼容(提案)) yield ['merge_or_suffix', 提案]
        }
      }
}

export function* 相邻同技能合并(规则: 原生规则[], 检查: () => void): Generator<原生候选> {
  type 完整条件 = { atoms: number[]; ops: 条件连接[] }
  function 合并条件(条件组: 完整条件[]): 完整条件 | undefined {
    let 或项: number[] = []
    const 尾项: 完整条件[] = []
    for (const { atoms, ops } of 条件组) {
      检查()
      if (!atoms.length) return { atoms: [], ops: [] }
      let 位 = 0
      while (位 < ops.length && ops[位] === '|') 或项.push(atoms[位++])
      if (位 === ops.length) 或项.push(atoms[atoms.length - 1])
      else 尾项.push({ atoms: atoms.slice(位), ops: ops.slice(位) })
    }
    或项 = [...new Set(或项)]
    let 尾部: 完整条件
    if (尾项.length > 1) {
      const 前缀长度 = 尾项.map((项) => {
        const 位 = 项.ops.indexOf('|')
        return 位 < 0 ? 项.atoms.length : 位
      })
      const 共同 = new Set(
        尾项[0].atoms
          .slice(0, 前缀长度[0])
          .filter((原子) => 尾项.every((项, 位) => 项.atoms.slice(0, 前缀长度[位]).includes(原子))),
      )
      if (!共同.size) return undefined
      const 前缀 = [
        ...new Set(尾项[0].atoms.slice(0, 前缀长度[0]).filter((原子) => 共同.has(原子))),
      ]
      const 剩余 = 尾项.map((项, 位): 完整条件 => {
        const 留下 = 项.atoms.slice(0, 前缀长度[位]).filter((原子) => !共同.has(原子))
        const 后缀 = 项.atoms.slice(前缀长度[位])
        return {
          atoms: [...留下, ...后缀],
          ops: [
            ...Array(后缀.length ? 留下.length : Math.max(0, 留下.length - 1)).fill('&'),
            ...项.ops.slice(前缀长度[位]),
          ],
        }
      })
      const 合并 = 合并条件(剩余)
      if (!合并) return undefined
      尾部 = {
        atoms: [...前缀, ...合并.atoms],
        ops: [...Array(合并.atoms.length ? 前缀.length : 前缀.length - 1).fill('&'), ...合并.ops],
      }
    } else if (尾项.length) 尾部 = 尾项[0]
    else return { atoms: 或项, ops: Array(Math.max(0, 或项.length - 1)).fill('|') }
    return { atoms: [...或项, ...尾部.atoms], ops: [...Array(或项.length).fill('|'), ...尾部.ops] }
  }
  const 提案: 原生规则[] = []
  let 开始 = 0,
    改变 = false
  while (开始 < 规则.length) {
    检查()
    let 结束 = 开始 + 1
    while (结束 < 规则.length && 规则[结束].action === 规则[开始].action) 结束++
    const 组 = 规则.slice(开始, 结束)
    const 条件组 = 组.map((行) => 规范规则(行) as 完整条件)
    const 合并 = 组.length > 1 ? 合并条件(条件组) : undefined
    const 原子 = new Set(条件组.flatMap((项) => 项.atoms))
    if (合并 && new Set(合并.atoms).size === 原子.size && 合并.atoms.every((值) => 原子.has(值))) {
      提案.push({ ...合并, action: 组[0].action })
      改变 = true
    } else 提案.push(...复制规则(组))
    开始 = 结束
  }
  if (改变) yield ['merge_adjacent_same_action', 提案]
}
