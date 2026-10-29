import { 原生候选, 原生规则, 原生动作, 原生观察行, 原生条件目录 } from './类型'
import { 原生样本 } from './样本'
import { 创建行内归并 } from './行内归并'
import { 短条件替换 } from './短条件枚举'
import { 联合优先级 } from './联合优先级'
import {
  复制规则,
  基础批次,
  特征批次,
  单项修改,
  特征修改,
  链叶修改,
  链叶桥接,
  或项合并,
  相邻同技能合并,
  批次修改,
} from './基础候选'

export interface 原生压缩回放 {
  status?: string
  rows?: readonly 原生观察行[]
  comparison?: {
    first_difference?: {
      expected?: { name?: string; skill_id?: string | number; time?: number }
      actual?: { name?: string; skill_id?: string | number; time?: number }
    }
    acceptance_prefix?: number
    target_count?: number
    [字段: string]: unknown
  }
  probe_failure?: unknown
  actual_fingerprint?: string
  candidate_hash?: string
  _online_certified?: boolean
  [字段: string]: unknown
}

export interface 压缩概要 {
  status: string
  initial_chars: number
  best_chars: number
  saved_chars: number
  trial_count: number
  accepted_count: number
  batch_trials: number
  max_batch_rules: number
  family_trials: number
  schedule_trials: number
  projected_window_trials: number
  repair_trials: number
  repair_expansions: number
  window_trials: number
  timing_trials: number
  candidate_ms: number
  sample_ms: number
  verify_wall_ms: number
  feedback_wall_ms: number
  method?: string
  route?: string
  last_batch_rules?: number
  strategy_ms: Record<string, number>
  release_window_observations: boolean
  [字段: string]: unknown
}

export type 候选流 = Iterable<原生候选> | AsyncIterable<原生候选>
type 搜索算子 = (规则: 原生规则[], 样本: 原生样本, 回放: 原生压缩回放) => 候选流

export interface 高级算子表 {
  family: 搜索算子
  native_priority: 搜索算子
  priority: 搜索算子
  window: 搜索算子
  schedule: 搜索算子
  local_sat: 搜索算子
  timing: 搜索算子
  event_window: 搜索算子
  projected_window: 搜索算子
  repair: (
    规则: 原生规则[],
    原子: readonly string[],
    回放: 原生压缩回放,
    检查: () => void,
  ) => 候选流
}

export interface 原生压缩选项 {
  规则: 原生规则[]
  原子: readonly string[]
  动作: readonly 原生动作[]
  目录?: 原生条件目录
  基线: 原生压缩回放
  渲染: (规则: readonly 原生规则[]) => string
  认证: (文本: string, 轮数: number, 方法: string, 规则: 原生规则[]) => Promise<原生压缩回放>
  观察: (回放: 原生压缩回放, 规则: 原生规则[], 类型: string) => Promise<原生压缩回放>
  反馈?: (
    文本: string,
    回放: 原生压缩回放,
    轮数: number,
    方法: string,
  ) => Promise<原生压缩回放 | null>
  检查: () => void
  控制?: () => Promise<void>
  预算?: () => boolean
  接受: (文本: string, 回放: 原生压缩回放, 概要: 压缩概要) => Promise<void>
  进度: (概要: 压缩概要) => void
  诊断: (信息: Record<string, unknown>) => void
  算子: 高级算子表
}

interface 修复种子 {
  前缀: number
  重复: number
  漂移: number
  字数: number
  文本: string
  规则: 原生规则[]
  回放: 原生压缩回放
  深度: number
  轮数: number
  方法: string
}

// 对应冻结器灵 compress 的已启用流程。完整观察始终归属于它自己的已认证或失败前缀，不能混合。
export async function 压缩宏(选项: 原生压缩选项) {
  const { 原子, 动作, 渲染, 检查, 算子 } = 选项
  const 行内归并 = 创建行内归并(原子, 检查, 选项.目录?.metadata)
  const 预算 = 选项.预算 ?? (() => true)
  if (选项.基线._online_certified !== true) throw new Error('原生压缩需要完整认证的基线')
  let 最优 = 复制规则(选项.规则),
    最优回放 = 选项.基线
  const 初始字数 = 渲染(最优).length
  const 已见 = new Set([渲染(最优)])
  const 修复队列: 修复种子[] = []
  const 已修复 = new Set<string>(),
    修复路径 = new Map<string, number>()
  const 概要: 压缩概要 = {
    status: 'running',
    initial_chars: 初始字数,
    best_chars: 初始字数,
    saved_chars: 0,
    trial_count: 0,
    accepted_count: 0,
    batch_trials: 0,
    max_batch_rules: 0,
    family_trials: 0,
    exchange_trials: 0,
    growing_bridges: 0,
    schedule_trials: 0,
    projected_window_trials: 0,
    joint_trials: 0,
    short_guard_trials: 0,
    joint_branches: 0,
    repair_trials: 0,
    repair_expansions: 0,
    window_trials: 0,
    timing_trials: 0,
    global_branches: 0,
    region_trials: 0,
    certified_alternatives: 0,
    candidate_ms: 0,
    sample_ms: 0,
    verify_wall_ms: 0,
    feedback_wall_ms: 0,
    pipeline_version: '20261016-compact-format-shared-observations-v1-native',
    window_frontier: true,
    release_window_observations: !!最优回放.rows?.some((行) => 行.release_windows?.length),
    exchange_search: false,
    region_search: false,
    learning_enabled: false,
    adaptive_enabled: false,
    deep_search: false,
    joint_search: true,
    short_guard_enumeration: true,
    strategy_ms: {},
  }
  const 快照 = (): 压缩概要 => ({ ...概要, strategy_ms: { ...概要.strategy_ms } })
  选项.进度(快照())

  async function 控制() {
    await 选项.控制?.()
    检查()
  }

  async function 取样(回放: 原生压缩回放, 规则: 原生规则[], 类型 = 'certified') {
    await 控制()
    const 观察开始 = performance.now()
    选项.诊断({ phase: 'compression_activity', activity: 'path_observation', event: 'start' })
    const 观察 = await 选项.观察(回放, 规则, 类型)
    const 开始 = performance.now()
    if (!观察.rows) throw new Error('原生压缩缺少该候选的观察')
    const 样本 = new 原生样本(
      观察.rows,
      原子,
      动作,
      检查,
      {
        kind: 类型,
        candidate_hash: 回放.candidate_hash,
        macro: 渲染(规则),
      },
      选项.目录,
    )
    样本.source_rules = 复制规则(规则)
    const 样本耗时 = performance.now() - 开始
    概要.sample_ms += 样本耗时
    选项.诊断({
      phase: 'sample_profile',
      candidate_hash: 回放.candidate_hash,
      macro_chars: 渲染(规则).length,
      rows: 样本.rows.length,
      atoms: 原子.length,
      observation_ms: 开始 - 观察开始,
      sample_ms: 样本耗时,
    })
    选项.诊断({
      phase: 'compression_activity',
      activity: 'path_observation',
      event: 'finish',
      elapsed_ms: performance.now() - 观察开始,
    })
    选项.进度(快照())
    return 样本
  }

  async function* 计时提案(流: 候选流): AsyncGenerator<原生候选> {
    const 异步 = (流 as AsyncIterable<原生候选>)[Symbol.asyncIterator]
    const 迭代器 = 异步 ? 异步.call(流) : (流 as Iterable<原生候选>)[Symbol.iterator]()
    let 耗时 = 0
    选项.诊断({ phase: 'compression_activity', activity: 'candidate_search', event: 'start' })
    try {
      while (true) {
        await 控制()
        const 开始 = performance.now()
        const 下个 = await 迭代器.next()
        const 增量 = performance.now() - 开始
        耗时 += 增量
        概要.candidate_ms += 增量
        if (下个.done) return
        yield 下个.value
      }
    } finally {
      await 迭代器.return?.()
      选项.诊断({
        phase: 'compression_activity',
        activity: 'candidate_search',
        event: 'finish',
        elapsed_ms: 耗时,
      })
    }
  }

  function 完整观察(回放: 原生压缩回放) {
    return !!回放.rows?.length && 回放.rows.every((行) => 行.truth.length === 原子.length)
  }

  async function 失败观察(种子: 修复种子) {
    if (完整观察(种子.回放)) return 种子.回放
    if (!选项.反馈) return null
    const 开始 = performance.now()
    const 结果 = await 选项.反馈(种子.文本, 种子.回放, 种子.轮数, 种子.方法)
    概要.feedback_wall_ms += performance.now() - 开始
    return 结果
  }

  async function 尝试(
    方法: string,
    规则: 原生规则[],
    配置: { 等长?: boolean; 批次数?: number; 修复深度?: number } = {},
  ) {
    await 控制()
    const 文本 = 渲染(规则),
      字数 = 文本.length
    if (已见.has(文本) || 字数 > 概要.best_chars || (字数 === 概要.best_chars && !配置.等长))
      return null
    // 流式枚举不累积全部候选；淘汰只可能增加重复认证，不改变接受条件。
    if (已见.size >= 4096) 已见.delete(已见.values().next().value!)
    已见.add(文本)
    if (!预算()) {
      概要.status = 'budget_exhausted'
      return null
    }
    概要.trial_count++
    if (方法.startsWith('schedule_')) 概要.schedule_trials++
    if (方法.startsWith('projected_')) 概要.projected_window_trials++
    if (方法.startsWith('family_')) 概要.family_trials++
    if (方法.startsWith('repair_')) 概要.repair_trials++
    if (方法.startsWith('window_')) 概要.window_trials++
    if (方法 === 'beam_timing_alias') 概要.timing_trials++
    if (方法 === 'joint_priority_guard') 概要.joint_trials = Number(概要.joint_trials) + 1
    if (方法 === 'short_guard_enumeration')
      概要.short_guard_trials = Number(概要.short_guard_trials) + 1
    概要.method = 方法
    概要.last_batch_rules = 配置.批次数 ?? 0
    if (配置.批次数) 概要.batch_trials++
    选项.进度(快照())
    const 开始 = performance.now()
    const 回放 = await 选项.认证(文本, 概要.trial_count, 方法, 规则)
    概要.verify_wall_ms += performance.now() - 开始
    const 通过 = 回放._online_certified === true
    const 比较 = 回放.comparison ?? {}
    const 预期 = 比较.first_difference?.expected ?? {},
      实际 = 比较.first_difference?.actual ?? {}
    const 前缀 = 比较.acceptance_prefix ?? 0
    const 同动作 =
      预期.name !== undefined || 实际.name !== undefined
        ? 预期.name !== undefined && 预期.name === 实际.name
        : 预期.skill_id !== undefined && 预期.skill_id === 实际.skill_id
    const 深度 = 配置.修复深度 ?? 0
    if (
      !通过 &&
      回放.probe_failure &&
      深度 < 12 &&
      字数 < 概要.best_chars &&
      (同动作 || 前缀 >= Math.max(8, Math.floor((比较.target_count ?? 0) / 3))) &&
      (完整观察(回放) || 选项.反馈)
    ) {
      const 指纹 = 回放.actual_fingerprint ?? 文本
      const 重复 = 修复路径.get(指纹) ?? 0
      修复路径.set(指纹, 重复 + 1)
      修复队列.push({
        前缀,
        重复,
        漂移: 同动作 ? Math.abs((实际.time ?? 0) - (预期.time ?? 0)) : Infinity,
        字数,
        文本,
        规则: 复制规则(规则),
        回放,
        深度,
        轮数: 概要.trial_count,
        方法,
      })
      修复队列.sort(
        (左, 右) =>
          右.前缀 - 左.前缀 ||
          左.重复 - 右.重复 ||
          (左.漂移 === 右.漂移 ? 0 : 左.漂移 - 右.漂移) ||
          左.字数 - 右.字数 ||
          (左.文本 < 右.文本 ? 1 : 左.文本 > 右.文本 ? -1 : 0),
      )
      修复队列.splice(12)
    }
    if (通过 && 字数 < 概要.best_chars) {
      最优 = 复制规则(规则)
      最优回放 = 回放
      概要.best_chars = 字数
      概要.saved_chars = 初始字数 - 字数
      概要.accepted_count++
      概要.max_batch_rules = Math.max(概要.max_batch_rules, 配置.批次数 ?? 0)
      await 选项.接受(文本, 回放, 快照())
      选项.进度(快照())
    }
    return 通过 ? 回放 : null
  }

  async function 修复阶段() {
    const 原字数 = 概要.best_chars,
      原轮数 = 概要.repair_trials
    let 展开 = 0
    while (修复队列.length && 展开 < 24 && 概要.repair_trials - 原轮数 < 96) {
      await 控制()
      const 种子 = 修复队列.shift()!
      if (已修复.has(种子.文本)) continue
      已修复.add(种子.文本)
      const 回放 = await 失败观察(种子)
      if (!回放) continue
      await 取样(回放, 种子.规则, 'aligned_repair_prefix')
      展开++
      概要.repair_expansions++
      选项.诊断({
        kind: 'first_divergence_repair',
        depth: 种子.深度,
        cursor: 回放.comparison?.acceptance_prefix ?? 0,
      })
      for await (const [方法, 规则] of 计时提案(算子.repair(种子.规则, 原子, 回放, 检查))) {
        await 尝试(方法, 规则, { 修复深度: 种子.深度 + 1 })
        if (概要.best_chars < 原字数) {
          修复队列.length = 0
          return
        }
        if (概要.repair_trials - 原轮数 >= 96) break
      }
    }
  }

  async function 排序(流: 候选流): Promise<原生候选[]> {
    const 唯一 = new Map<string, { 字数: number; 文本: string; 候选: 原生候选 }>()
    for await (const 候选 of 计时提案(流)) {
      const 文本 = 渲染(候选[1])
      if (!已见.has(文本) && 文本.length < 概要.best_chars && !唯一.has(文本)) {
        唯一.set(文本, { 字数: 文本.length, 文本, 候选 })
      }
    }
    return [...唯一.values()]
      .sort((左, 右) => 左.字数 - 右.字数 || (左.文本 < 右.文本 ? -1 : 左.文本 > 右.文本 ? 1 : 0))
      .map((项) => 项.候选)
  }

  async function 批次阶段(方法: string, 来源: 原生规则[], 样本: 原生样本, 修改: 批次修改[]) {
    if (修改.length < 2) return
    const 接纳 = new Map<number, 原生规则 | null>()
    let 失败 = 0
    async function 访问(部分: 批次修改[]): Promise<void> {
      await 控制()
      if (失败 >= 12 || !部分.length) return
      const 变更 = new Map([...接纳, ...部分])
      const 提案 = 来源.flatMap((行, 索引) => {
        const 结果 = 变更.has(索引) ? 变更.get(索引) : 行
        return 结果 ? [结果] : []
      })
      if (!样本.兼容(提案)) {
        if (部分.length > 1) {
          const 中间 = Math.floor(部分.length / 2)
          await 访问(部分.slice(0, 中间))
          await 访问(部分.slice(中间))
        }
        return
      }
      if (await 尝试(方法, 提案, { 批次数: 部分.length })) {
        for (const [索引, 行] of 部分) 接纳.set(索引, 行)
        return
      }
      失败++
      if (部分.length > 1) {
        const 中间 = Math.floor(部分.length / 2)
        await 访问(部分.slice(0, 中间))
        await 访问(部分.slice(中间))
      }
    }
    await 访问(修改)
  }

  async function 首次缩减(流: 候选流, 原字数: number, 样本?: 原生样本, 前缀 = '') {
    for await (const [方法, 规则] of 计时提案(流)) {
      if (!样本 || 样本.兼容(规则)) await 尝试(前缀 + 方法, 规则)
      if (概要.best_chars < 原字数) return true
    }
    return false
  }

  while (预算()) {
    await 控制()
    const 原字数 = 概要.best_chars
    if (await 首次缩减(行内归并(最优), 原字数)) continue
    if (await 首次缩减(相邻同技能合并(最优, 检查), 原字数)) continue
    let 样本 = await 取样(最优回放, 最优)
    await 批次阶段('batch_basic', 复制规则(最优), 样本, 基础批次(最优, 样本, 动作))
    if (概要.best_chars < 原字数) continue
    if (await 首次缩减(await 排序(单项修改(最优, 动作, 检查)), 原字数, 样本)) continue
    await 批次阶段('batch_features', 复制规则(最优), 样本, 特征批次(最优, 样本))
    if (概要.best_chars < 原字数) continue
    if (await 首次缩减(await 排序(特征修改(最优, 样本)), 原字数, 样本)) continue
    if (await 首次缩减(await 排序(或项合并(最优, 样本)), 原字数)) continue

    const 窗口优先 = 最优.length <= 2 * new Set(最优.map((行) => 行.action)).size
    概要.route = 窗口优先 ? 'compact_windows_first' : 'dense_families_first'
    const 阶段: (keyof Pick<
      高级算子表,
      'family' | 'native_priority' | 'priority' | 'window' | 'schedule'
    >)[] = 窗口优先
      ? ['window', 'family', 'native_priority', 'priority']
      : ['family', 'native_priority', 'priority', 'window']
    if (样本.rows.some((行) => 行.wait_clock_atoms?.length)) 阶段.unshift('schedule')
    for (const 名称 of 阶段) {
      const 开始 = performance.now()
      const 缩减 = await 首次缩减(算子[名称](最优, 样本, 最优回放), 原字数)
      概要.strategy_ms[名称] = (概要.strategy_ms[名称] ?? 0) + performance.now() - 开始
      if (缩减) break
    }
    if (概要.best_chars < 原字数) continue
    let 扩展缩减 = false
    for (const [名称, 构造] of [
      ['short_guard', 短条件替换],
      ['joint_priority', 联合优先级],
    ] as const) {
      const 开始 = performance.now()
      扩展缩减 = await 首次缩减(构造(最优, 样本, 控制), 原字数, 样本)
      概要.strategy_ms[名称] = (概要.strategy_ms[名称] ?? 0) + performance.now() - 开始
      if (扩展缩减) break
    }
    if (扩展缩减) continue
    await 修复阶段()
    if (概要.best_chars < 原字数) continue
    if (await 首次缩减(算子.local_sat(最优, 样本, 最优回放), 原字数)) continue

    样本 = await 取样(最优回放, 最优, 'certified_windows')
    概要.release_window_observations = 样本.rows.some((行) => !!行.release_windows?.length)
    for await (const [方法, 规则] of 计时提案(算子.timing(最优, 样本, 最优回放))) {
      const 替代 = await 尝试(方法, 规则, { 等长: true })
      if (概要.best_chars < 原字数) break
      if (!替代) continue
      const 引导 = await 取样(替代, 规则, 'certified_clock_alternative')
      if (await 首次缩减(算子.window(规则, 引导, 替代), 原字数)) break
    }
    if (概要.best_chars < 原字数) continue

    let 前沿: [原生规则[], 原生压缩回放][] = [[复制规则(最优), 最优回放]]
    for (let 深度 = 0; 深度 < 2; 深度++) {
      const 下层: [原生规则[], 原生压缩回放][] = []
      for (const [基础, 基础回放] of 前沿) {
        const 引导 = await 取样(基础回放, 基础, 'certified_priority_alternative')
        for (let 索引 = 0; 索引 < 基础.length - 1; 索引++) {
          await 控制()
          const 提案 = 复制规则(基础)
          ;[提案[索引], 提案[索引 + 1]] = [提案[索引 + 1], 提案[索引]]
          if (引导.兼容(提案)) {
            const 回放 = await 尝试('beam_priority_move', 提案, { 等长: true })
            if (回放) 下层.push([提案, 回放])
          }
          if (下层.length >= 4) break
        }
        if (下层.length >= 4) break
      }
      for (const [基础, 基础回放] of 下层) {
        const 引导 = await 取样(基础回放, 基础, 'certified_priority_alternative')
        const 提案 = [
          ...单项修改(基础, 动作, 检查),
          ...或项合并(基础, 引导),
          ...特征修改(基础, 引导),
        ]
        if (await 首次缩减(await 排序(提案), 原字数, 引导, 'beam_')) break
      }
      if (概要.best_chars < 原字数 || !下层.length) break
      前沿 = 下层
    }
    if (概要.best_chars === 原字数) await 首次缩减(算子.event_window(最优, 样本, 最优回放), 原字数)
    if (概要.best_chars === 原字数 && 样本.rows.some((行) => 行.release_windows?.length)) {
      await 首次缩减(算子.projected_window(最优, 样本, 最优回放), 原字数)
    }
    if (概要.best_chars < 原字数) continue

    // 与批次拆分一样，链内上下文缩减是例外：成功后更新自己的观察，继续链阶段。
    let 上下文 = 样本
    while (预算()) {
      const 上下文字数 = 概要.best_chars
      await 首次缩减(await 排序(链叶修改(最优, 上下文)), 上下文字数)
      if (概要.best_chars < 上下文字数) {
        上下文 = await 取样(最优回放, 最优, 'certified_context_shortening')
        continue
      }
      for await (const [方法, 规则] of 计时提案(链叶桥接(最优, 上下文))) {
        const 替代 = await 尝试(方法, 规则, { 等长: true })
        if (!替代) continue
        const 引导 = await 取样(替代, 规则, 'certified_leaf_alternative')
        const 后代 = [
          ...单项修改(规则, 动作, 检查),
          ...特征修改(规则, 引导),
          ...链叶修改(规则, 引导),
          ...或项合并(规则, 引导),
        ]
        if (await 首次缩减(await 排序(后代), 上下文字数, 引导, 'bridge_')) break
      }
      if (概要.best_chars === 上下文字数) break
      上下文 = await 取样(最优回放, 最优, 'certified_context_shortening')
    }
    if (概要.best_chars < 原字数) continue
    break
  }
  概要.status = 预算() ? 'scope_exhausted' : 'budget_exhausted'
  选项.进度(快照())
  return { 规则: 最优, 回放: 最优回放, 概要: 快照() }
}
