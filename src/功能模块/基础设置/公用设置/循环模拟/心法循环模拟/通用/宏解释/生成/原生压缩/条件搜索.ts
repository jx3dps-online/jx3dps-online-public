import { 条件位图, 条件字数, 位数统计 } from './条件'
import type { 条件样本 } from './条件'
import type { 原生条件, 条件连接 } from './类型'
import { 条件前沿 } from './条件前沿'
import type { 条件链, 条件分支, 条件分支项 } from './条件前沿'

export interface 条件搜索选项 {
  maxTerms?: number
  maxCandidates?: number
  branchLimit?: number
  maxStates?: number
  maxAtoms?: number
  preferredAtoms?: readonly number[]
  frontier?: boolean
}

function 数组比较(左: readonly number[], 右: readonly number[]): number {
  for (let 位置 = 0; 位置 < Math.min(左.length, 右.length); 位置++)
    if (左[位置] !== 右[位置]) return 左[位置] - 右[位置]
  return 左.length - 右.length
}

const 链键 = ([原子, 操作]: 条件链) => 原子.join(',') + ':' + 操作.join('')
const 位图排序 = (左: bigint, 右: bigint) => (左 < 右 ? -1 : 左 > 右 ? 1 : 0)
const 位图组 = (值: readonly bigint[]) => Array.from(new Set(值)).sort(位图排序)
const 位图组键 = (值: readonly bigint[]) => 值.map((项) => 项.toString(16)).join(',')
const 链规则 = ([原子, 操作]: 条件链): 原生条件 => ({ atoms: 原子.slice(), ops: 操作.slice() })
type 条件条目 = { chain: 条件链; cost: number; mask: bigint; wake: number[] }
const 条目比较 = (左: 条件条目, 右: 条件条目) =>
  左.cost - 右.cost ||
  数组比较(左.chain[0], 右.chain[0]) ||
  (左.chain[1].join('') < 右.chain[1].join('')
    ? -1
    : 左.chain[1].join('') > 右.chain[1].join('')
      ? 1
      : 0)

type 搜索缓存 = {
  pool: number[]
  clock: ReadonlySet<number>
  queries: Map<string, 条件链[]>
  frontiers: Map<string, 条件前沿>
}
const 短缓存 = new WeakMap<条件样本, 搜索缓存>()
const 窗口缓存 = new WeakMap<条件样本, 搜索缓存>()

function 取得缓存(样本: 条件样本, 窗口: boolean): 搜索缓存 {
  const 缓存表 = 窗口 ? 窗口缓存 : 短缓存
  const 缓存 = 缓存表.get(样本)
  if (缓存) return 缓存
  const 时钟 = 样本.catalog?.clock || new Set<number>()
  const 签名 = new Map<bigint, number[]>()
  样本.truth.forEach((真值, 位置) => {
    if (!(位置 % 64)) 样本.check()
    const 位图 = 真值 & 样本.all
    const 同组 = 签名.get(位图) || []
    同组.push(位置)
    签名.set(位图, 同组)
  })
  const 池: number[] = []
  for (const 索引 of 签名.values()) {
    样本.check()
    索引.sort((左, 右) => 样本.atom_costs[左] - 样本.atom_costs[右] || 左 - 右)
    池.push(
      ...索引.filter((位置) => !时钟.has(位置)).slice(0, 1),
      ...索引.filter((位置) => 时钟.has(位置)).slice(0, 窗口 ? undefined : 2),
    )
  }
  const 结果: 搜索缓存 = { pool: 池, clock: 时钟, queries: new Map(), frontiers: new Map() }
  缓存表.set(样本, 结果)
  return 结果
}

function 保存查询(缓存: 搜索缓存, 键: string, 链: 条件链[]) {
  if (缓存.queries.size >= 256) 缓存.queries.delete(缓存.queries.keys().next().value!)
  缓存.queries.set(键, 链)
}

export function 短条件搜索(
  正例: bigint,
  负例: bigint,
  样本: 条件样本,
  选项: 条件搜索选项 = {},
): 原生条件[] {
  const {
    maxTerms: 最大项 = 8,
    maxCandidates: 最大候选 = 8,
    branchLimit: 分支限额 = 24,
    maxStates: 状态限额 = 384,
    maxAtoms: 原子限额 = 256,
  } = 选项
  样本.check()
  正例 &= 样本.all
  负例 &= 样本.all
  if (!正例 || 正例 & 负例 || Math.min(最大项, 最大候选, 分支限额, 状态限额, 原子限额) <= 0)
    return []
  const { truth: 真值, atom_costs: 成本, all: 全部 } = 样本
  const 缓存 = 取得缓存(样本, false),
    时钟 = 缓存.clock
  const 查询 = [
    正例.toString(16),
    负例.toString(16),
    最大项,
    最大候选,
    分支限额,
    状态限额,
    原子限额,
  ].join(':')
  const 旧结果 = 缓存.queries.get(查询)
  if (旧结果) return 旧结果.map(链规则)
  let 池 = 缓存.pool.slice()
  const 成本序 = (左: number, 右: number) => 成本[左] - 成本[右] || 左 - 右
  if (池.length > 原子限额) {
    const 得分序 = (分: (位置: number) => number) => {
      const 得分 = new Map(池.map((位置) => [位置, 分(位置)]))
      return (左: number, 右: number) => 得分.get(左)! - 得分.get(右)! || 成本序(左, 右)
    }
    const 排名 = [
      池
        .slice()
        .sort(成本序)
        .slice(0, Math.max(1, Math.floor(原子限额 / 4))),
      池
        .slice()
        .sort(
          得分序(
            (位置) =>
              -(位数统计(正例 & 真值[位置]) + 位数统计(负例 & ~真值[位置])) / (成本[位置] + 1),
          ),
        ),
      池
        .filter((位置) => !(正例 & ~真值[位置]))
        .sort(得分序((位置) => -位数统计(负例 & ~真值[位置]) / (成本[位置] + 1))),
      池
        .filter((位置) => !(负例 & 真值[位置]))
        .sort(得分序((位置) => -位数统计(正例 & 真值[位置]) / (成本[位置] + 1))),
    ]
    const 已选 = new Set<number>()
    for (
      let 位置 = 0;
      位置 < Math.max(...排名.map((组) => 组.length)) && 已选.size < 原子限额;
      位置++
    ) {
      样本.check()
      for (const 组 of 排名) {
        if (位置 < 组.length) 已选.add(组[位置])
        if (已选.size >= 原子限额) break
      }
    }
    池 = Array.from(已选)
  }
  池.sort(成本序)
  const 条目缓存 = new Map<string, 条件条目>()
  const 剪枝 = (链组: 条件链[]): 条件链[] => {
    const 唯一 = new Map<string, 条件条目>()
    for (const 链 of 链组) {
      样本.check()
      const 键 = 链键(链)
      let 条目 = 条目缓存.get(键)
      if (!条目) {
        const 规则 = 链规则(链)
        条目 = {
          chain: 链,
          cost: 条件字数(规则, 成本),
          mask: 条件位图(规则, 真值, 全部),
          wake: Array.from(new Set(链[0].filter((位置) => 时钟.has(位置)))).sort(
            (左, 右) => 左 - 右,
          ),
        }
        条目缓存.set(键, 条目)
      }
      const 语义 = 条目.mask.toString(16) + ':' + 条目.wake.join(',')
      const 已有 = 唯一.get(语义)
      if (!已有 || 条目比较(条目, 已有) < 0) 唯一.set(语义, 条目)
    }
    const 排名 = Array.from(唯一.values()).sort(条目比较),
      已选 = 排名.slice(0, 最大候选)
    if (已选.length && 最大候选 > 1) {
      const 替代 = 排名.find(
        (项) => 项.mask === 已选[0].mask && 项.wake.join(',') !== 已选[0].wake.join(','),
      )
      if (替代 && !已选.includes(替代)) {
        已选[已选.length - 1] = 替代
        已选.sort(条目比较)
      }
    }
    return 已选.map((项) => 项.chain)
  }
  type 根项 = [number, number, number, bigint]
  type 分支 = [条件连接, 根项]
  const 根缓存 = new Map<string, [条件链[], 分支[]]>(),
    备忘 = new Map<string, 条件链[]>()
  let 状态数 = 0,
    超额数 = 0
  const 根 = (正: bigint, 负: bigint): [条件链[], 分支[]] => {
    样本.check()
    const 键 = 正.toString(16) + ':' + 负.toString(16),
      缓存值 = 根缓存.get(键)
    if (缓存值) return 缓存值
    const 叶: 条件链[] = 负 ? [] : [[[], []]],
      与根: 根项[] = [],
      或根: 根项[] = []
    for (const 索引 of 池) {
      样本.check()
      const 位图 = 真值[索引] & 全部,
        缺少 = 正 & ~位图,
        相交 = 负 & 位图
      if (!缺少 && !相交) 叶.push([[索引], []])
      if (!缺少 && 相交 !== 负)
        与根.push([-位数统计(负 & ~位图) / (成本[索引] + 1), 成本[索引], 索引, 相交])
      if (!相交 && 缺少 && 缺少 !== 正)
        或根.push([-位数统计(正 & 位图) / (成本[索引] + 1), 成本[索引], 索引, 缺少])
    }
    const 排序 = (左: 根项, 右: 根项) => 左[0] - 右[0] || 左[1] - 右[1] || 左[2] - 右[2]
    与根.sort(排序)
    或根.sort(排序)
    const 分支组: 分支[] = []
    for (
      let 偏移 = 0;
      偏移 < Math.max(与根.length, 或根.length) && 分支组.length < 分支限额;
      偏移++
    ) {
      for (const [操作, 项] of [
        ['&', 与根],
        ['|', 或根],
      ] as const) {
        if (偏移 < 项.length) 分支组.push([操作, 项[偏移]])
        if (分支组.length >= 分支限额) break
      }
    }
    const 结果: [条件链[], 分支[]] = [剪枝(叶), 分支组]
    根缓存.set(键, 结果)
    return 结果
  }
  const 搜索 = (正: bigint, 负: bigint, 深度: number, 上限: number): 条件链[] => {
    样本.check()
    const 键 = 正.toString(16) + ':' + 负.toString(16) + ':' + 深度,
      已有 = 备忘.get(键)
    if (已有) return 已有
    if (状态数 >= 上限) {
      超额数++
      return []
    }
    状态数++
    const 先前超额 = 超额数,
      [叶, 分支] = 根(正, 负),
      组 = 叶.slice()
    if (深度 > 1) {
      const 宽度 = Math.min(分支.length, Math.max(1, Math.floor((上限 - 状态数) / (深度 - 1))))
      if (宽度 < 分支.length) 超额数++
      const 活跃 = 分支.slice(0, 宽度)
      活跃.forEach(([操作, [, , 索引, 剩余]], 位置) => {
        样本.check()
        const 子上限 = Math.min(
          上限,
          状态数 + Math.max(1, Math.floor((上限 - 状态数) / (活跃.length - 位置))),
        )
        const 后缀 =
          操作 === '&' ? 搜索(正, 剩余, 深度 - 1, 子上限) : 搜索(剩余, 负, 深度 - 1, 子上限)
        for (const [原子, 操作组] of 后缀) {
          if (原子.includes(索引)) continue
          组.push(
            !原子.length
              ? 操作 === '&'
                ? [[索引], []]
                : [[], []]
              : [
                  [索引, ...原子],
                  [操作, ...操作组],
                ],
          )
        }
      })
    }
    const 结果 = 剪枝(组)
    if (先前超额 === 超额数) 备忘.set(键, 结果)
    return 结果
  }
  let 最佳: 条件链[] = []
  for (let 深度 = 1; 深度 <= 最大项 && 状态数 < 状态限额; 深度++) {
    样本.check()
    const 上限 = Math.min(
      状态限额,
      状态数 + Math.max(1, Math.floor((状态限额 - 状态数) / (最大项 - 深度 + 1))),
    )
    最佳 = 剪枝([...最佳, ...搜索(正例, 负例, 深度, 上限)])
  }
  const 结果 = 最佳.filter((链) => {
    const 位图 = 条件位图(链规则(链), 真值, 全部)
    return !(正例 & ~位图) && !(负例 & 位图)
  })
  保存查询(缓存, 查询, 结果)
  return 结果.map(链规则)
}

function 轮流取<T>(项目: readonly T[], 分组键: (项: T) => string, 限额: number): T[] {
  const 分组 = new Map<string, T[]>()
  for (const 项 of 项目) {
    const 键 = 分组键(项),
      组 = 分组.get(键) || []
    组.push(项)
    分组.set(键, 组)
  }
  const 结果: T[] = []
  let 偏移 = 0,
    有变化 = true
  while (结果.length < 限额 && 有变化) {
    有变化 = false
    for (const 组 of 分组.values()) {
      if (偏移 < 组.length) {
        结果.push(组[偏移])
        有变化 = true
      }
      if (结果.length >= 限额) break
    }
    偏移++
  }
  return 结果
}

export function 窗口前沿诊断(样本: 条件样本) {
  return Array.from(窗口缓存.get(样本)?.frontiers.values() || [], (会话) => 会话.诊断())
}

export function 窗口条件搜索(
  窗口: readonly bigint[],
  负例: bigint,
  样本: 条件样本 & { window_search_status?: unknown },
  选项: 条件搜索选项 = {},
): 原生条件[] {
  const {
    maxTerms: 最大项 = 6,
    maxCandidates: 最大候选 = 8,
    branchLimit: 分支限额 = 24,
    maxStates: 状态限额 = 384,
    maxAtoms: 原子限额 = 256,
    preferredAtoms: 偏好输入 = [],
    frontier: 前沿 = false,
  } = 选项
  样本.check()
  if (Math.min(最大项, 最大候选, 分支限额, 状态限额, 原子限额) <= 0) return []
  const { truth: 真值, atom_costs: 成本, all: 全部 } = 样本
  const 禁止 = 负例 & 全部,
    原窗口 = 窗口.map((组) => 组 & 全部)
  if (!原窗口.length || 原窗口.some((组) => !组)) return []
  const 剩余 = 位图组(原窗口.map((组) => 组 & ~禁止))
  if (!剩余.length || !剩余[0]) return []
  const 偏好 = Array.from(
    new Set(偏好输入.filter((值) => Number.isInteger(值) && 值 >= 0 && 值 < 真值.length)),
  ).sort((左, 右) => 左 - 右)
  const 缓存 = 取得缓存(样本, true),
    时钟 = 缓存.clock
  const 查询 = [
    位图组键(剩余),
    禁止.toString(16),
    最大项,
    最大候选,
    分支限额,
    状态限额,
    原子限额,
    偏好.join(','),
    前沿,
  ].join(':')
  const 已缓存 = 缓存.queries.get(查询)
  if (!前沿 && 已缓存) return 已缓存.map(链规则)
  const 旧前沿 = 前沿 ? 缓存.frontiers.get(查询) : undefined
  if (旧前沿) {
    const 最佳 = 旧前沿.推进(状态限额)
    样本.window_search_status = 旧前沿.诊断()
    return 最佳.map(链规则).filter((规则) => {
      const 位图 = 条件位图(规则, 真值, 全部)
      return !(位图 & 禁止) && 原窗口.every((组) => !!(组 & 位图))
    })
  }
  const 偏好集 = new Set(偏好),
    位图列 = 真值.map((值) => 值 & 全部)
  const 成本序 = (左: number, 右: number) => 成本[左] - 成本[右] || 左 - 右
  let 池 = Array.from(new Set([...缓存.pool, ...偏好]))
  if (池.length > 原子限额) {
    const 覆盖缓存 = new Map<bigint, number>()
    const 排名 = 池
      .map((索引) => {
        const 位图 = 位图列[索引]
        let 覆盖 = 覆盖缓存.get(位图)
        if (覆盖 === undefined) {
          覆盖 = 剩余.reduce((和, 组) => 和 + Number(!!(位图 & 组)), 0) + 位数统计(禁止 & ~位图)
          覆盖缓存.set(位图, 覆盖)
        }
        return [-覆盖 / (成本[索引] + 1), 成本[索引], 索引] as const
      })
      .sort((左, 右) => 左[0] - 右[0] || 左[1] - 右[1] || 左[2] - 右[2])
    const 已选 = 偏好.slice().sort(成本序).slice(0, 原子限额),
      已选集 = new Set(已选)
    const 普通 = 排名.filter((项) => !时钟.has(项[2]) && !已选集.has(项[2])),
      计时 = 排名.filter((项) => 时钟.has(项[2]) && !已选集.has(项[2]))
    const 余量 = 原子限额 - 已选.length
    for (const [项目, 份额] of [
      [普通, Math.floor((余量 + 1) / 2)],
      [计时, Math.floor(余量 / 2)],
    ] as const) {
      if (份额 <= 0) continue
      const 廉价 = 项目.slice().sort((左, 右) => 左[1] - 右[1] || 左[2] - 右[2])
      const 优先 = 轮流取(
        [...项目.map((项) => [0, 项] as const), ...廉价.map((项) => [1, 项] as const)],
        (项) => String(项[0]),
        Math.min(项目.length * 2, 份额 * 2),
      )
      let 增加 = 0
      for (const [, 项] of 优先) {
        样本.check()
        if (!已选集.has(项[2])) {
          已选.push(项[2])
          已选集.add(项[2])
          增加++
        }
        if (增加 >= 份额) break
      }
    }
    for (const [, , 索引] of 排名) {
      if (已选.length >= 原子限额) break
      if (!已选集.has(索引)) {
        已选.push(索引)
        已选集.add(索引)
      }
    }
    池 = 已选
  }
  池.sort((左, 右) => Number(!偏好集.has(左)) - Number(!偏好集.has(右)) || 成本序(左, 右))
  const 签名 = Array.from(new Set(池.map((索引) => 位图列[索引]))),
    槽号 = new Map(签名.map((值, 位置) => [值, 位置]))
  const 特征 = 池.map((索引) => ({
    index: 索引,
    slot: 槽号.get(位图列[索引])!,
    cost: 成本[索引],
    denominator: 成本[索引] + 1,
    ordinary: !偏好集.has(索引),
    preferredClock: 偏好集.has(索引) && 时钟.has(索引),
  }))
  const 条目缓存 = new Map<string, 条件条目>()
  const 剪枝 = (链组: 条件链[]): 条件链[] => {
    const 唯一 = new Map<string, 条件条目>()
    for (const 链 of 链组) {
      样本.check()
      const 键 = 链键(链)
      let 条目 = 条目缓存.get(键)
      if (!条目) {
        const 规则 = 链规则(链)
        条目 = {
          chain: 链,
          cost: 条件字数(规则, 成本),
          mask: 条件位图(规则, 位图列, 全部),
          wake: Array.from(new Set(链[0].filter((索引) => 时钟.has(索引)))).sort(
            (左, 右) => 左 - 右,
          ),
        }
        条目缓存.set(键, 条目)
      }
      const 语义 = 条目.mask.toString(16) + ':' + 条目.wake.join(','),
        旧值 = 唯一.get(语义)
      if (!旧值 || 条目比较(条目, 旧值) < 0) 唯一.set(语义, 条目)
    }
    const 排名 = Array.from(唯一.values()).sort(条目比较)
    const 稳定 = 排名.filter((项) => !项.wake.length),
      计时 = 排名.filter((项) => 项.wake.length)
    const 已选 = [
      ...稳定.slice(0, Math.floor((最大候选 + 1) / 2)),
      ...轮流取(计时, (项) => 项.wake.join(','), Math.floor(最大候选 / 2)),
    ]
    const 已收录 = new Set(已选.map((项) => 链键(项.chain)))
    for (const 项 of 排名) {
      if (已选.length >= 最大候选) break
      if (!已收录.has(链键(项.chain))) {
        已选.push(项)
        已收录.add(链键(项.chain))
      }
    }
    return 已选.sort(条目比较).map((项) => 项.chain)
  }
  const 根缓存 = new Map<string, [条件链[], 条件分支[]]>(),
    备忘 = new Map<string, 条件链[]>()
  const 窗口特征 = new Map<
    string,
    { restricted: (bigint[] | undefined)[]; untouched: (bigint[] | undefined)[] }
  >()
  const 负例特征 = new Map<bigint, [bigint, number][]>()
  let 状态数 = 0,
    超额数 = 0
  const 根 = (当前: bigint[], 阻止: bigint): [条件链[], 条件分支[]] => {
    样本.check()
    const 窗口键 = 位图组键(当前),
      键 = 窗口键 + ':' + 阻止.toString(16),
      旧值 = 根缓存.get(键)
    if (旧值) return 旧值
    let 窗口数据 = 窗口特征.get(窗口键)
    if (!窗口数据) {
      窗口数据 = { restricted: [], untouched: [] }
      窗口特征.set(窗口键, 窗口数据)
    }
    let 负例数据 = 负例特征.get(阻止)
    if (!负例数据) {
      负例数据 = 签名.map((位图) => [阻止 & 位图, 位数统计(阻止 & ~位图)])
      负例特征.set(阻止, 负例数据)
    }
    const 叶: 条件链[] = 阻止 ? [] : [[[], []]],
      与根: 条件分支项[] = [],
      或根: 条件分支项[] = []
    for (const {
      index: 索引,
      slot: 槽,
      cost: 字数,
      denominator: 分母,
      ordinary: 普通,
      preferredClock: 偏好时钟,
    } of 特征) {
      样本.check()
      const 位图 = 签名[槽],
        [相交, 排除] = 负例数据[槽]
      let 限制 = 窗口数据.restricted[槽]
      if (!限制) {
        限制 = 位图组(当前.map((组) => 组 & 位图))
        窗口数据.restricted[槽] = 限制
      }
      if (限制[0]) {
        if (!相交) 叶.push([[索引], []])
        if (相交 !== 阻止 || 位图组键(限制) !== 窗口键 || 偏好时钟)
          与根.push([普通, -排除 / 分母, 字数, 索引, 限制, 相交])
      }
      if (!相交) {
        let 未触及 = 窗口数据.untouched[槽]
        if (!未触及) {
          未触及 = 当前.filter((组) => !(组 & 位图))
          窗口数据.untouched[槽] = 未触及
        }
        if (未触及.length && (未触及.length !== 当前.length || 偏好时钟))
          或根.push([普通, -(当前.length - 未触及.length) / 分母, 字数, 索引, 未触及, 阻止])
      }
    }
    const 排序 = (左: 条件分支项, 右: 条件分支项) =>
      Number(左[0]) - Number(右[0]) || 左[1] - 右[1] || 左[2] - 右[2] || 左[3] - 右[3]
    let 排序与 = 与根.sort(排序),
      排序或 = 或根.sort(排序)
    if (前沿) {
      const 键函数 = (项: 条件分支项) => 位图组键(项[4]) + ':' + 项[5].toString(16)
      排序与 = 轮流取(排序与, 键函数, 排序与.length)
      排序或 = 轮流取(排序或, 键函数, 排序或.length)
    }
    const 分支: 条件分支[] = []
    for (
      let 偏移 = 0;
      偏移 < Math.max(排序与.length, 排序或.length) && (前沿 || 分支.length < 分支限额);
      偏移++
    ) {
      for (const [操作, 项] of [
        ['&', 排序与],
        ['|', 排序或],
      ] as const) {
        if (偏移 < 项.length) 分支.push([操作, 项[偏移]])
        if (!前沿 && 分支.length >= 分支限额) break
      }
    }
    const 结果: [条件链[], 条件分支[]] = [剪枝(叶), 分支]
    根缓存.set(键, 结果)
    return 结果
  }
  const 搜索 = (当前: bigint[], 阻止: bigint, 深度: number, 上限: number): 条件链[] => {
    样本.check()
    const 键 = 位图组键(当前) + ':' + 阻止.toString(16) + ':' + 深度,
      旧值 = 备忘.get(键)
    if (旧值) return 旧值
    if (状态数 >= 上限) {
      超额数++
      return []
    }
    状态数++
    const 先前超额 = 超额数,
      [叶, 分支] = 根(当前, 阻止),
      条件 = 叶.slice()
    if (深度 > 1) {
      const 宽度 = Math.min(分支.length, Math.max(1, Math.floor((上限 - 状态数) / (深度 - 1))))
      if (宽度 < 分支.length) 超额数++
      const 活跃 = 分支.slice(0, 宽度)
      活跃.forEach(([操作, [, , , 索引, 子窗口, 子负例]], 位置) => {
        样本.check()
        const 子上限 = Math.min(
          上限,
          状态数 + Math.max(1, Math.floor((上限 - 状态数) / (活跃.length - 位置))),
        )
        for (const [原子, 连接] of 搜索(子窗口, 子负例, 深度 - 1, 子上限)) {
          if (原子.includes(索引)) continue
          条件.push(
            !原子.length
              ? 操作 === '&'
                ? [[索引], []]
                : [[], []]
              : [
                  [索引, ...原子],
                  [操作, ...连接],
                ],
          )
        }
      })
    }
    const 结果 = 剪枝(条件)
    if (先前超额 === 超额数) 备忘.set(键, 结果)
    return 结果
  }
  let 最佳: 条件链[] = []
  if (前沿) {
    if (缓存.frontiers.size >= 64) 缓存.frontiers.delete(缓存.frontiers.keys().next().value!)
    const 会话 = new 条件前沿(剩余, 禁止, 位图列, 池, 成本, 最大项, 根, 剪枝, 样本.check)
    缓存.frontiers.set(查询, 会话)
    最佳 = 会话.推进(状态限额)
    样本.window_search_status = 会话.诊断()
  } else {
    for (let 深度 = 1; 深度 <= 最大项 && 状态数 < 状态限额; 深度++) {
      样本.check()
      const 上限 = Math.min(
        状态限额,
        状态数 + Math.max(1, Math.floor((状态限额 - 状态数) / (最大项 - 深度 + 1))),
      )
      最佳 = 剪枝([...最佳, ...搜索(剩余, 禁止, 深度, 上限)])
    }
  }
  const 结果 = 最佳.filter((链) => {
    const 位图 = 条件位图(链规则(链), 真值, 全部)
    return !(位图 & 禁止) && 原窗口.every((组) => !!(组 & 位图))
  })
  if (!前沿) 保存查询(缓存, 查询, 结果)
  return 结果.map(链规则)
}
