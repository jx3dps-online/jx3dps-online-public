import type { 高级算子表 } from './调度'
import type { 原生规则, 原生候选, 原生条件目录 } from './类型'
import { 空位图, 一位图 } from './类型'
import { 原生样本, 时钟上下文, 窗口上下文, 投影观察行 } from './样本'
import { 规范规则 } from './条件'
import { 短条件搜索, 窗口条件搜索, 窗口前沿诊断 } from './条件搜索'
import { 优先级候选, 程序标识, type 条件查找 } from './优先级候选'
import { 同动作重建 } from './同动作重建'
import { 分歧修复, 计时别名 } from './分歧修复'

const 简短搜索: 条件查找 = (正例, 负例, 样本) =>
  短条件搜索(正例, 负例, 样本, { maxTerms: 6, maxCandidates: 4, branchLimit: 12, maxStates: 192 })

function* 窗口候选(规则: 原生规则[], 样本: 原生样本): Generator<原生候选> {
  const 优先 = [...new Set(规则.flatMap((行) => 规范规则(行).atoms))]
  for (const [类型, 提案] of 优先级候选(规则, 样本, {
    condition_search: (正例, 负例, 引导) => {
      const 窗口 = [...引导.groups.values()].filter((位) => !!(位 & 正例)).map((位) => 位 & 正例)
      return 窗口条件搜索(窗口, 负例, 引导, {
        maxTerms: 6,
        maxCandidates: 4,
        branchLimit: 16,
        maxStates: 256,
        preferredAtoms: 优先,
      })
    },
  }))
    yield [类型.replace('native_guard_rebuild', 'window_guard_rebuild'), 提案]
}

function* 事件窗口候选(规则: 原生规则[], 样本: 原生样本): Generator<原生候选> {
  const 优先 = [...new Set(规则.flatMap((行) => 规范规则(行).atoms))],
    [选择] = 样本.选择(规则)
  const 源命中 = 选择.reduce((位, 列) => 位 | 列, 空位图)
  let 扩展事件 = 空位图
  for (const 组 of 样本.groups.values()) if (组 & ~源命中) 扩展事件 |= 组
  const 提供者 = new Set(选择.flatMap((位, i) => (位 & 扩展事件 ? [i] : [])))
  if (!提供者.size) return
  for (const [类型, 提案] of 优先级候选(规则, 样本, {
    window_search: (查询, 引导) =>
      窗口条件搜索(查询.windows, 查询.negatives, 引导, {
        maxTerms: 6,
        maxCandidates: 4,
        branchLimit: 16,
        maxStates: 256,
        preferredAtoms: 优先,
      }),
    group_filter: (组) => 组.some((i) => 提供者.has(i)),
  }))
    yield [类型.replace('window_guard_rebuild', 'window_event_rebuild'), 提案]
}

function* 调度候选(规则: 原生规则[], 样本: 原生样本): Generator<原生候选> {
  const 上下文 = new 时钟上下文(样本)
  if (!上下文.groups.size) return
  yield* 优先级候选(规则, 样本, {
    condition_search: (正例, 负例, 引导) =>
      短条件搜索(正例, 负例, 引导, {
        maxTerms: 6,
        maxCandidates: 8,
        branchLimit: 24,
        maxStates: 512,
      }),
    clock_context: 上下文,
  })
}

export function* 投影窗口候选(
  规则: 原生规则[],
  样本: 原生样本,
  前沿 = false,
  诊断?: (信息: Record<string, unknown>) => void,
): Generator<原生候选> {
  const [观察, 个数] = 投影观察行(样本)
  if (!个数) return
  const 引导 = new 原生样本(
    观察,
    样本.atoms,
    样本.actions,
    样本.check,
    { kind: 'alternative_wait_witnesses', parent: 样本.path_id },
    样本.catalog,
  )
  const 上下文 = new 窗口上下文(引导)
  const 实际 = 观察.reduce(
    (位, 行, i) => (行.projection_parent == null ? 位 | (一位图 << BigInt(i)) : 位),
    空位图,
  )
  const 已见 = new Set<string>()
  for (let 轮 = 0; 轮 < (前沿 ? 8 : 1); 轮++) {
    for (const [类型, 提案] of 优先级候选(规则, 引导, {
      window_search: (查询, 路径) =>
        窗口条件搜索(查询.windows, 查询.negatives, 路径, {
          maxTerms: 6,
          maxCandidates: 8,
          branchLimit: 24,
          maxStates: 前沿 ? 128 : 1024,
          maxAtoms: 512,
          frontier: 前沿,
        }),
      clock_context: 上下文,
      source_mask: 实际,
      group_filter: 前沿 ? (组) => 组.length > 1 : undefined,
    })) {
      const 键 = 程序标识(提案)
      if (!已见.has(键)) {
        已见.add(键)
        yield ['projected_' + 类型, 提案]
      }
    }
    if (!前沿) break
    const 统计 = 窗口前沿诊断(引导),
      待处理 = 统计.reduce((和, 项) => 和 + 项.pending, 0)
    诊断?.({
      kind: 'window_frontier_batch',
      turn: 轮 + 1,
      queries: 统计.length,
      states: 统计.reduce((和, 项) => 和 + 项.states, 0),
      pending: 待处理,
      status: 待处理 ? 'pending' : 'scope_exhausted',
      source_path: 样本.path_id,
    })
    if (!待处理) break
  }
}

export const 创建高级算子 = (
  目录: 原生条件目录,
  诊断?: (信息: Record<string, unknown>) => void,
  选项: { windowFrontier?: boolean } = {},
): Omit<高级算子表, 'local_sat'> => ({
  family: (规则, 样本) => 同动作重建(规则, 样本, 简短搜索, 诊断),
  native_priority: (规则, 样本) => 优先级候选(规则, 样本, { condition_search: 简短搜索 }),
  priority: (规则, 样本) => 优先级候选(规则, 样本),
  window: 窗口候选,
  schedule: 调度候选,
  timing: (规则, 样本, 回放) => 计时别名(规则, 样本, 回放),
  event_window: 事件窗口候选,
  projected_window: (规则, 样本) => 投影窗口候选(规则, 样本, 选项.windowFrontier ?? false, 诊断),
  repair: (规则, 原子, 回放, 检查) => 分歧修复(规则, 原子, 回放, 目录, 检查),
})
