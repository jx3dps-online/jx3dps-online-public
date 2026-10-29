import { 空位图, 一位图 } from './类型'
import type { 原生规则, 原生观察行, 原生动作, 原生条件目录, 样本来源, 决策见证 } from './类型'
import { 条件位图, 条件键, 条件字数, 规范规则, 位数统计, 最低位索引 } from './条件'

const 字到位图 = (字: Uint32Array) => {
  if (!字.length) return 空位图
  const 部分 = Array<string>(字.length)
  for (let 位置 = 字.length - 1; 位置 >= 0; 位置--)
    部分[字.length - 1 - 位置] = 字[位置].toString(16).padStart(8, '0')
  return BigInt('0x' + 部分.join(''))
}

let 路径序号 = 0

export class 原生样本 {
  readonly all: bigint
  readonly truth: bigint[]
  readonly executable: bigint[]
  readonly allowed: bigint[]
  readonly rejected: bigint[]
  readonly unknown: bigint[]
  required = 空位图
  wait_unknown = 空位图
  wait_forbidden = 空位图
  readonly groups = new Map<number, bigint>()
  readonly event_rows = new Map<number, bigint>()
  readonly witness_groups = new Map<number, bigint>()
  readonly atom_costs: number[]
  readonly action_costs: number[]
  readonly hit_cache = new Map<string, bigint>()
  readonly guards = new Map<string, number[][]>()
  readonly path_id: string
  short_features: number[] | null = null
  source_rules?: 原生规则[]
  window_search_status: unknown = null
  readonly catalog: 原生条件目录

  constructor(
    readonly rows: readonly 原生观察行[],
    readonly atoms: readonly string[],
    readonly actions: readonly 原生动作[],
    readonly check: () => void = () => {},
    readonly provenance: 样本来源 = {},
    catalog?: 原生条件目录,
  ) {
    this.catalog = catalog || { atoms, actions, clock: new Set() }
    this.path_id = String(++路径序号)
    this.all = (一位图 << BigInt(rows.length)) - 一位图
    const 字数 = Math.ceil(rows.length / 32)
    const 真值 = atoms.map(() => new Uint32Array(字数))
    const 可执行 = actions.map(() => new Uint32Array(字数))
    const 允许 = actions.map(() => new Uint32Array(字数))
    const 拒绝 = actions.map(() => new Uint32Array(字数))
    const 未知 = actions.map(() => new Uint32Array(字数))
    const 必须 = new Uint32Array(字数),
      等待未知 = new Uint32Array(字数),
      等待拒绝 = new Uint32Array(字数)
    const 事件 = new Map<number, Uint32Array>(),
      分组 = new Map<number, Uint32Array>(),
      见证 = new Map<number, Uint32Array>()
    const 放入组 = (目标: Map<number, Uint32Array>, 游标: number, 字: number, 位: number) => {
      let 列 = 目标.get(游标)
      if (!列) {
        列 = new Uint32Array(字数)
        目标.set(游标, 列)
      }
      列[字] |= 位
    }
    for (let 行号 = 0; 行号 < rows.length; 行号++) {
      check()
      const 行 = rows[行号]
      if (行.truth.length !== atoms.length || 行.executable.length !== actions.length)
        throw new Error('观察矩阵不是当前目录的矩形')
      if (!['allowed', 'forbidden', 'unknown'].includes(行.wait_status))
        throw new Error('观察缺少明确的三态等待状态')
      const 字 = 行号 >>> 5,
        位 = 1 << (行号 & 31),
        游标 = 行.cursor ?? 行号
      放入组(事件, 游标, 字, 位)
      for (let 条件 = 0; 条件 < atoms.length; 条件++) if (行.truth[条件]) 真值[条件][字] |= 位
      const 好 = new Set(行.allowed || []),
        坏 = new Set(行.rejected_actions || []),
        不确定 = new Set(行.unknown_actions || [])
      for (const 动作 of [...好, ...坏, ...不确定])
        if (!Number.isInteger(动作) || 动作 < 0 || 动作 >= actions.length)
          throw new Error('动作允许性引用了目录之外的动作')
      if (
        [...好].some((动作) => 坏.has(动作) || 不确定.has(动作)) ||
        [...坏].some((动作) => 不确定.has(动作))
      )
        throw new Error('同一动作具有相互矛盾的允许性')
      for (let 动作 = 0; 动作 < actions.length; 动作++) {
        if (行.executable[动作]) 可执行[动作][字] |= 位
        if (好.has(动作)) 允许[动作][字] |= 位
        else if (坏.has(动作)) 拒绝[动作][字] |= 位
        else if (行.executable[动作]) 未知[动作][字] |= 位
      }
      if (好.size) {
        放入组(见证, 游标, 字, 位)
        if (行.projection_parent == null) 放入组(分组, 游标, 字, 位)
      }
      if (行.wait_status === 'forbidden') {
        必须[字] |= 位
        等待拒绝[字] |= 位
      } else if (行.wait_status === 'unknown') 等待未知[字] |= 位
    }
    this.truth = 真值.map(字到位图)
    this.executable = 可执行.map(字到位图)
    this.allowed = 允许.map(字到位图)
    this.rejected = 拒绝.map(字到位图)
    this.unknown = 未知.map(字到位图)
    this.required = 字到位图(必须)
    this.wait_unknown = 字到位图(等待未知)
    this.wait_forbidden = 字到位图(等待拒绝)
    for (const [游标, 位图] of 事件) this.event_rows.set(游标, 字到位图(位图))
    for (const [游标, 位图] of 分组) this.groups.set(游标, 字到位图(位图))
    for (const [游标, 位图] of 见证) this.witness_groups.set(游标, 字到位图(位图))
    this.atom_costs = atoms.map((原子) => 原子.length)
    this.action_costs = actions.map(
      (动作) => ('/' + (动作.fcast ? 'fcast' : 'cast') + ' ' + 动作.name).length,
    )
  }

  命中(规则: 原生规则): bigint {
    const 键 = 规则.action + ':' + 条件键(规则)
    const 已有 = this.hit_cache.get(键)
    if (已有 !== undefined) return 已有
    const 命中 = this.executable[规则.action] & 条件位图(规则, this.truth, this.all)
    if (this.hit_cache.size >= 1024) this.hit_cache.delete(this.hit_cache.keys().next().value!)
    this.hit_cache.set(键, 命中)
    return 命中
  }

  规则成本(规则: 原生规则): number {
    return this.action_costs[规则.action] + 条件字数(规则, this.atom_costs)
  }

  选择(规则: readonly 原生规则[]): [bigint[], bigint] {
    let 剩余 = this.all
    const 已选 = 规则.map((行) => {
      const 命中 = 剩余 & this.命中(行)
      剩余 &= ~命中
      return 命中
    })
    return [已选, 剩余]
  }

  判定(规则: readonly 原生规则[]): 'contradicted' | 'proposal_unknown' | 'sample_compatible' {
    const [已选, 剩余] = this.选择(规则)
    let 不确定 = !!(剩余 & this.wait_unknown)
    for (let 位置 = 0; 位置 < 规则.length; 位置++) {
      if (已选[位置] & this.rejected[规则[位置].action]) return 'contradicted'
      不确定 ||= !!(已选[位置] & this.unknown[规则[位置].action])
    }
    if (剩余 & this.required) return 'contradicted'
    if (!不确定)
      for (const 组 of this.groups.values())
        if (!(组 & ~剩余)) {
          不确定 = true
          break
        }
    return 不确定 || this.provenance.conditional_guide ? 'proposal_unknown' : 'sample_compatible'
  }

  兼容(规则: readonly 原生规则[]): boolean {
    return this.判定(规则) !== 'contradicted'
  }
  窗口兼容(规则: readonly 原生规则[]): boolean {
    return 窗口兼容(this, 规则, this.all)
  }
  覆盖条件(正例: bigint, 负例: bigint): number[][] {
    return this.覆盖(正例, 负例)
  }

  覆盖(正例: bigint, 负例: bigint): number[][] {
    const 键 = 正例.toString(16) + ':' + 负例.toString(16)
    const 缓存 = this.guards.get(键)
    if (缓存) return 缓存
    if (!正例) return []
    if (!负例) return [[]]
    const 列: [number, bigint][] = []
    for (let 条件 = 0; 条件 < this.truth.length; 条件++) {
      if (!(条件 % 64)) this.check()
      const 排除 = 负例 & ~this.truth[条件]
      if (!(正例 & ~this.truth[条件]) && 排除) 列.push([条件, 排除])
    }
    const 候选 = 列.filter(([, 排除]) => 排除 === 负例).map(([条件]) => [条件])
    列.sort(
      (左, 右) =>
        this.atom_costs[左[0]] - this.atom_costs[右[0]] ||
        位数统计(右[1]) - 位数统计(左[1]) ||
        左[0] - 右[0],
    )
    for (const 首项 of [null, ...列.slice(0, 8).map(([条件]) => 条件)]) {
      let 待处理 = 负例
      const 条件组: number[] = []
      if (首项 !== null) {
        条件组.push(首项)
        待处理 &= this.truth[首项]
      }
      while (待处理) {
        this.check()
        const 可用 = 列
          .map(([条件, 位图]) => [条件, 位图 & 待处理] as const)
          .filter(([条件, 位图]) => 位图 && !条件组.includes(条件))
        if (!可用.length) break
        可用.sort(
          (左, 右) =>
            (this.atom_costs[左[0]] + 1) / 位数统计(左[1]) -
              (this.atom_costs[右[0]] + 1) / 位数统计(右[1]) || 左[0] - 右[0],
        )
        const [条件, 排除] = 可用[0]
        条件组.push(条件)
        待处理 &= ~排除
      }
      if (!待处理) {
        for (const 条件 of 条件组.slice()) {
          let 已覆盖 = 空位图
          for (const 其他 of 条件组) if (其他 !== 条件) 已覆盖 |= 负例 & ~this.truth[其他]
          if (已覆盖 === 负例) 条件组.splice(条件组.indexOf(条件), 1)
        }
        候选.push(条件组.sort((左, 右) => 左 - 右))
      }
    }
    const 唯一 = Array.from(new Map(候选.map((条件) => [条件.join(','), 条件])).values())
    const 成本 = (条件: number[]) =>
      条件.reduce((总数, 位置) => 总数 + this.atom_costs[位置] + 1, 0)
    唯一.sort((左, 右) => 成本(左) - 成本(右) || 数组比较(左, 右))
    const 结果 = 唯一.slice(0, 4)
    if (this.guards.size >= 256) this.guards.delete(this.guards.keys().next().value!)
    this.guards.set(键, 结果)
    return 结果
  }
}

export function 数组比较(左: readonly number[], 右: readonly number[]): number {
  for (let 位置 = 0; 位置 < Math.min(左.length, 右.length); 位置++)
    if (左[位置] !== 右[位置]) return 左[位置] - 右[位置]
  return 左.length - 右.length
}

export function 窗口兼容(样本: 原生样本, 规则: readonly 原生规则[], 保留: bigint): boolean {
  let 剩余 = 保留,
    错误 = 空位图,
    未知 = 空位图
  for (const 行 of 规则) {
    const 命中 = 剩余 & 样本.命中(行)
    错误 |= 命中 & 样本.rejected[行.action]
    未知 |= 命中 & 样本.unknown[行.action]
    剩余 &= ~命中
  }
  const 已选 = 保留 & ~剩余
  for (const 组 of 样本.event_rows.values()) {
    样本.check()
    const 选择 = 已选 & 组
    if (!选择) {
      if (组 & 保留 & 样本.required) return false
      continue
    }
    const 首个 = 选择 & -选择
    if (首个 & 错误 || (首个 - 一位图) & 组 & 保留 & 样本.required) return false
    const 行 = 样本.rows[最低位索引(首个)]
    if (首个 & 未知 || 行.projection_parent != null) return true
  }
  return true
}

export class 时钟上下文 {
  readonly groups = new Map<string, { support: ReadonlySet<number>; rows: bigint }>()
  constructor(readonly samples: 原生样本) {
    let 上一行: 原生观察行 | undefined
    for (let 位置 = 0; 位置 < samples.rows.length; 位置++) {
      samples.check()
      const 行 = samples.rows[位置]
      if (行.projection_parent != null) continue
      const 支持 = 上一行?.wait_clock_atoms
      if (
        上一行 &&
        支持?.length &&
        上一行.cursor === 行.cursor &&
        上一行.wait_next_time === 行.time &&
        上一行.time < 行.time &&
        行.wait_status === 'allowed' &&
        !行.allowed?.length &&
        !行.rejected_actions?.length &&
        支持.every((条件) => samples.catalog.clock.has(条件))
      ) {
        const 键 = Array.from(new Set(支持))
          .sort((左, 右) => 左 - 右)
          .join(',')
        const 原组 = this.groups.get(键)
        this.groups.set(键, {
          support: 原组?.support || new Set(支持),
          rows: (原组?.rows || 空位图) | (一位图 << BigInt(位置)),
        })
      }
      上一行 = 行
    }
  }
  时钟(规则: readonly 原生规则[]): Set<number> {
    return new Set(
      规则
        .flatMap((行) => 规范规则(行).atoms)
        .filter((条件) => this.samples.catalog.clock.has(条件)),
    )
  }
  可移除(规则: readonly 原生规则[]): bigint {
    const 时钟 = this.时钟(规则)
    let 移除 = 空位图
    for (const { support: 支持, rows: 行 } of this.groups.values()) {
      this.samples.check()
      if (!Array.from(支持).some((条件) => 时钟.has(条件))) 移除 |= 行
    }
    return 移除
  }
  兼容(规则: readonly 原生规则[]): boolean {
    let 剩余 = this.samples.all & ~this.可移除(规则)
    for (const 行 of 规则) {
      const 命中 = 剩余 & this.samples.命中(行)
      if (命中 & this.samples.rejected[行.action]) return false
      剩余 &= ~命中
    }
    return !(剩余 & this.samples.required)
  }
}

export class 窗口上下文 extends 时钟上下文 {
  可移除(规则: readonly 原生规则[]): bigint {
    let 忽略 = super.可移除(规则)
    const 时钟 = this.时钟(规则)
    for (let 位置 = 0; 位置 < this.samples.rows.length; 位置++) {
      const 支持 = this.samples.rows[位置].projection_clock_atoms
      if (支持 !== undefined && !支持.some((条件) => 时钟.has(条件))) 忽略 |= 一位图 << BigInt(位置)
    }
    return 忽略
  }
  兼容(规则: readonly 原生规则[]): boolean {
    return 窗口兼容(this.samples, 规则, this.samples.all & ~this.可移除(规则))
  }
}

export function 未来见证(行: 原生观察行, 动作: number): 决策见证[] {
  return (行.decision_witnesses || []).filter(
    (点) =>
      (点.allowed === true || 点.allowed === 'allowed') &&
      点.action === 动作 &&
      点.time > 行.time &&
      (点.cursor ?? 行.cursor) === 行.cursor,
  )
}

export function 投影观察行(样本: 原生样本): [原生观察行[], number] {
  const 结果: 原生观察行[] = []
  let 数量 = 0
  for (let 位置 = 0; 位置 < 样本.rows.length; 位置++) {
    样本.check()
    const 行 = 样本.rows[位置]
    结果.push(行)
    if (行.wait_next_time != null || !行.allowed?.length) continue
    const 候选 = new Map<
      string,
      {
        time: number
        truth: ArrayLike<number | boolean>
        executable: ArrayLike<number | boolean>
        support: readonly number[]
        allowed: Set<number>
      }
    >()
    const 添加 = (
      点: {
        time: number
        truth?: ArrayLike<number | boolean>
        executable?: ArrayLike<number | boolean>
        clock_atoms?: readonly number[]
      },
      允许: readonly number[],
    ) => {
      if (!点.clock_atoms?.length || !点.truth || !点.executable) return
      const 键 =
        点.time +
        ':' +
        Array.from(点.truth, Number).join('') +
        ':' +
        Array.from(点.executable, Number).join('') +
        ':' +
        点.clock_atoms.join(',')
      let 已有 = 候选.get(键)
      if (!已有) {
        已有 = {
          time: 点.time,
          truth: 点.truth,
          executable: 点.executable,
          support: 点.clock_atoms,
          allowed: new Set(),
        }
        候选.set(键, 已有)
      }
      for (const 动作 of 允许) 已有.allowed.add(动作)
    }
    for (let 动作 = 0; 动作 < 样本.actions.length; 动作++)
      for (const 点 of 未来见证(行, 动作)) 添加(点, [动作])
    for (const 点 of 行.release_windows || []) {
      样本.check()
      if (
        点.time <= 行.time ||
        !点.allowed.length ||
        (行.decision_latest != null && 点.time > 行.decision_latest)
      )
        continue
      添加(点, 点.allowed)
    }
    const 排序 = Array.from(候选.values()).sort(
      (左, 右) =>
        左.time - 右.time ||
        数组比较(Array.from(左.truth, Number), Array.from(右.truth, Number)) ||
        数组比较(Array.from(左.executable, Number), Array.from(右.executable, Number)) ||
        数组比较(左.support, 右.support),
    )
    for (const 点 of 排序) {
      结果.push({
        time: 点.time,
        cursor: 行.cursor,
        truth: 点.truth,
        executable: 点.executable,
        allowed: Array.from(点.allowed).sort((左, 右) => 左 - 右),
        rejected_actions: [],
        unknown_actions: [],
        wait_status: 'unknown',
        projection_clock_atoms: 点.support,
        projection_parent: 位置,
      })
      数量++
    }
  }
  return [结果, 数量]
}
