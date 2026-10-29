import type { 原生条件, 原生规则, 原生候选, 位图 } from './类型'
import { 空位图 } from './类型'
import type { 原生样本 } from './样本'
import { 复制规则 } from './基础候选'
export { 复制规则 } from './基础候选'

export type 排序值 = number | string | boolean | bigint | readonly 排序值[]
export const 比较排序值 = (左: 排序值, 右: 排序值): number => {
  if (Array.isArray(左) && Array.isArray(右)) {
    for (let i = 0; i < Math.min(左.length, 右.length); i++) {
      const 差 = 比较排序值(左[i], 右[i])
      if (差) return 差
    }
    return 左.length - 右.length
  }
  if (typeof 左 === 'number' && typeof 右 === 'number') return 左 - 右
  if (typeof 左 === 'boolean' && typeof 右 === 'boolean') return Number(左) - Number(右)
  if (typeof 左 === 'bigint' && typeof 右 === 'bigint') return 左 < 右 ? -1 : 左 > 右 ? 1 : 0
  if (typeof 左 === 'string' && typeof 右 === 'string') return 左 < 右 ? -1 : 左 > 右 ? 1 : 0
  throw new Error('候选排序键类型不一致')
}

export const 规则排序键 = (行: 原生规则): 排序值[] => [
  行.action,
  行.atoms,
  行.any_atoms ?? [],
  行.ops ?? [],
  行.ops !== undefined,
]
export const 程序排序键 = (规则: readonly 原生规则[]): 排序值[] => 规则.map(规则排序键)
export const 程序标识 = (规则: readonly 原生规则[]) => JSON.stringify(程序排序键(规则))

export interface 窗口查询 {
  action: number
  reachable: 位图
  negatives: 位图
  windows: 位图[]
  events: number[]
  path_id: string
}
export type 条件查找 = (正例: 位图, 负例: 位图, 样本: 原生样本) => Iterable<原生条件>
export type 窗口查找 = (查询: 窗口查询, 样本: 原生样本) => Iterable<原生条件>
export interface 调度上下文 {
  可移除: (规则: readonly 原生规则[]) => 位图
  兼容: (规则: readonly 原生规则[]) => boolean
}

export const 事件查询 = (
  样本: 原生样本,
  动作: number,
  正例: 位图,
  可达: 位图,
  保留: readonly 原生规则[],
): 窗口查询 => {
  let 已覆盖 = 空位图
  let 剩余 = 样本.all
  for (const 行 of 保留) {
    const 选中 = 剩余 & 样本.命中(行)
    已覆盖 |= 选中 & 样本.allowed[行.action]
    剩余 &= ~选中
  }
  const 窗口: 位图[] = []
  const 事件: number[] = []
  for (const [序号, 集合] of 样本.witness_groups) {
    if (!(集合 & 正例) || 集合 & 已覆盖) continue
    窗口.push(集合 & 可达 & 样本.allowed[动作] & 样本.executable[动作])
    事件.push(序号)
  }
  return {
    action: 动作,
    reachable: 可达,
    negatives: 可达 & 样本.executable[动作] & 样本.rejected[动作],
    windows: 窗口,
    events: 事件,
    path_id: 样本.path_id,
  }
}

export function* 优先级候选(
  规则: readonly 原生规则[],
  样本: 原生样本,
  选项: {
    limit?: number
    condition_search?: 条件查找
    window_search?: 窗口查找
    group_filter?: (组: readonly number[], 动作: number) => boolean
    clock_context?: 调度上下文
    source_mask?: 位图
  } = {},
): Generator<原生候选> {
  样本.check()
  const 上限 = 选项.limit ?? 24
  if (上限 <= 0 || !规则.length) return
  const 原规则 = 复制规则(规则)
  const 原成本 = 原规则.reduce((总, 行) => 总 + 样本.规则成本(行) + 1, 0)
  const 选择: 位图[] = []
  let 剩余 = (选项.source_mask ?? 样本.all) & 样本.all
  const 同动作 = new Map<number, number[]>()
  原规则.forEach((行, 序号) => {
    样本.check()
    const 命中 = 剩余 & 样本.命中(行)
    选择.push(命中)
    剩余 &= ~命中
    const 组 = 同动作.get(行.action) ?? []
    组.push(序号)
    同动作.set(行.action, 组)
  })
  const 分组: [number[], number][] = []
  for (const [动作, 位置] of 同动作) {
    for (let i = 0; i < 位置.length; i++) {
      分组.push([[位置[i]], 动作])
      for (let j = i + 1; j < 位置.length; j++) 分组.push([[位置[i], 位置[j]], 动作])
    }
    if (位置.length > 2) 分组.push([位置, 动作])
  }
  for (let 动作 = 0; 动作 < 样本.allowed.length; 动作++) {
    const 适用 = 选择.flatMap((位, i) =>
      位 && !(位 & ~(样本.allowed[动作] & 样本.executable[动作])) ? [i] : [],
    )
    for (let i = 0; i < 适用.length; i++) {
      if (原规则[适用[i]].action !== 动作) 分组.push([[适用[i]], 动作])
      for (let j = i + 1; j < 适用.length; j++)
        if (原规则[适用[i]].action !== 原规则[适用[j]].action) 分组.push([[适用[i], 适用[j]], 动作])
    }
    if (适用.length > 2 && 适用.some((i) => 原规则[i].action !== 动作)) 分组.push([适用, 动作])
  }
  const 已见分组 = new Set<string>()
  const 已见 = new Set([程序标识(原规则)])
  const 候选: { 成本: number; 键: 排序值[]; 类型: string; 规则: 原生规则[] }[] = []
  for (const [组, 动作] of 分组) {
    样本.check()
    const 组键 = JSON.stringify([组, 动作])
    if (已见分组.has(组键) || (选项.group_filter && !选项.group_filter(组, 动作))) continue
    已见分组.add(组键)
    const 删除 = new Set(组)
    const 保留: 原生规则[] = []
    const 原间隙 = new Map<number, number>()
    let 正例 = 空位图
    let 保留成本 = 0
    原规则.forEach((行, i) => {
      if (删除.has(i)) {
        正例 |= 选择[i]
        原间隙.set(i, 保留.length)
      } else {
        保留.push(行)
        保留成本 += 样本.规则成本(行) + 1
      }
    })
    if (保留成本 + 样本.规则成本({ action: 动作, atoms: [] }) + 1 >= 原成本) continue
    const 已知间隙 = new Set([原间隙.get(组[0]), 原间隙.get(组[组.length - 1])])
    let 前缀剩余 = 样本.all
    for (let 位置 = 0; 位置 <= 保留.length; 位置++) {
      样本.check()
      if (选项.condition_search || 选项.window_search || !已知间隙.has(位置)) {
        const 放宽 = 选项.clock_context?.可移除(保留) ?? 空位图
        const 负例 = 前缀剩余 & 样本.executable[动作] & 样本.rejected[动作] & ~放宽
        const 替换: 原生规则[] = 样本.覆盖条件(正例, 负例).map((atoms) => ({ action: 动作, atoms }))
        if (选项.condition_search)
          for (const 条件 of 选项.condition_search(正例 & 前缀剩余, 负例, 样本))
            替换.push({ ...条件, action: 动作 })
        if (选项.window_search) {
          const 查询 = 事件查询(样本, 动作, 正例, 前缀剩余, 保留)
          查询.negatives &= ~放宽
          if (查询.windows.every((位) => !!位))
            for (const 条件 of 选项.window_search(查询, 样本)) 替换.push({ ...条件, action: 动作 })
        }
        替换.push(...复制规则(组.map((i) => 原规则[i])).map((行) => ({ ...行, action: 动作 })))
        for (const 行 of 替换) {
          样本.check()
          const 成本 = 保留成本 + 样本.规则成本(行) + 1
          if (成本 >= 原成本) continue
          const 提案 = 复制规则([...保留.slice(0, 位置), 行, ...保留.slice(位置)])
          const 标识 = 程序标识(提案)
          if (已见.has(标识)) continue
          已见.add(标识)
          const 兼容 = 选项.clock_context
            ? 选项.clock_context.兼容(提案)
            : 选项.window_search
              ? 样本.窗口兼容(提案)
              : 样本.兼容(提案)
          if (!兼容) continue
          const 形状 = 组.length === 1 ? 'single' : 组.length === 2 ? 'pair' : 'family'
          const 前缀 = 选项.window_search
            ? 'window_guard_rebuild_'
            : 选项.condition_search
              ? 'native_guard_rebuild_'
              : 'priority_rebuild_'
          候选.push({
            成本,
            键: 程序排序键(提案),
            类型: (选项.clock_context ? 'schedule_' : '') + 前缀 + 形状,
            规则: 提案,
          })
        }
      }
      if (位置 < 保留.length) 前缀剩余 &= ~样本.命中(保留[位置])
    }
  }
  候选.sort((a, b) => a.成本 - b.成本 || 比较排序值(a.键, b.键))
  for (const 项 of 候选.slice(0, 上限)) {
    样本.check()
    yield [项.类型, 项.规则]
  }
}
