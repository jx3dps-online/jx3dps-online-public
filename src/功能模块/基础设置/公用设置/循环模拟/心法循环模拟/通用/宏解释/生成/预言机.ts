import type { 宏任务, 宏任务回复, 心法说明, 宏状态, 宏条件 } from '../类型'
import { 解析条件, 宏解析错误 } from '../核心/解析'
import { 创建名称导出 } from '../核心/名称'
import { 创建增益能力目录, 描述条件能力 } from '../核心/条件能力'
import { 判定条件 } from '../核心/判定'
import { 更新等待条件 } from './回放'
import { 创建条件目录, 校验生成条件 } from './条件目录'
import type { 生成请求, 生成动作, 教师结果, 目标动作, 观察记录, 生成起点 } from './类型'
import { 宏生成容差上限, 转换回放结束 } from './结果校验'
import { 解析续算宏 } from './续算'
import { 序列化, 文本指纹, 程序指纹, 生成协议版本, 生成语义版本, type 生成合同 } from './身份'
export { 序列化 } from './身份'

type 成功回复 = Extract<宏任务回复, { 成功: true }>
interface 器灵请求 {
  candidate?: string
  atoms?: string[]
  horizon: number
  time_tolerance_seconds?: number
  stop_on_divergence?: boolean
  observation?: 'none' | 'path' | 'windows'
  release_windows?: boolean
  screening?: boolean
}

// 同一 Worker 内提供原生观察，搜索与模拟共享目录和观察引用。
export const 创建生成预言机 = async (
  请求: 生成请求,
  执行: (任务: 宏任务) => Promise<成功回复>,
  起点?: 生成起点,
  记录?: (消息: Record<string, unknown>) => void,
  版本?: { 算法: string; Python: string; Pyodide?: string; 求解器: string },
) => {
  const 准备开始 = performance.now()
  if (起点 && (!Number.isSafeInteger(起点.轮数) || 起点.轮数 < 0))
    throw new Error('保存的搜索轮数无效')
  const 固定容差 = 请求.容差 ?? 0.125
  if (!Number.isFinite(固定容差) || 固定容差 < 0 || 固定容差 > 宏生成容差上限)
    throw new Error('本次任务的校验容差必须在 0–125ms 内')
  const 随机种子 = 请求.随机种子 ?? 20261010
  if (!Number.isSafeInteger(随机种子)) throw new Error('随机种子必须是安全整数')
  const 允许数字IDBuff = 请求.允许数字IDBuff === true
  const 基础 = { ...请求, 允许数字IDBuff, 随机种子 }
  const 准备 = await 执行({ ...基础, 类型: '教师' })
  const 目标耗时 = performance.now() - 准备开始
  const 教师 = 准备.教师!
  const 说明 = 准备.说明
  const 名称导出 = 创建名称导出(说明)
  const 增益能力 = 创建增益能力目录(说明, 允许数字IDBuff)
  const 有引导 = 教师.动作.some((项) => 项.作用次数 !== undefined || 项.持续帧 !== undefined)
  const 连招主技能 = new Map(
    Object.entries(说明.连招).flatMap(([技能, 后续]) => 后续.map((项) => [项.技能, 技能] as const)),
  )
  const 动作: 生成动作[] = [...new Set(教师.动作.map((项) => 连招主技能.get(项.技能) ?? 项.技能))]
    .sort()
    .flatMap((技能) => [
      { 技能, 命令: 'cast' as const },
      ...(有引导 && 说明.支持打断 !== false ? [{ 技能, 命令: 'fcast' as const }] : []),
    ])
  const 观察基础 = { ...基础, 类型: '观察' as const, 观察目标: 教师, 观察动作: 动作 }
  const 起点规则 = 起点 ? 解析续算宏(起点.宏, 说明, 动作, 起点.阶段, 允许数字IDBuff) : undefined
  // 空规则用本心法的合法恒假条件，不改写候选原文或借用其他心法的语法。
  const 首个技能 = 名称导出.技能(动作[0].技能)
  const 恒假 = 'last_skill=' + 首个技能 + '&last_skill~=' + 首个技能
  const 初始文本 = 动作.map((项) => '/' + 项.命令 + ' ' + 名称导出.技能(项.技能)).join('\n')
  // 样本动作数限制新决策；最后动作 + 125ms 保留为释放容差与尾部事件结算范围。
  const 范围 = Math.max(0.1, 教师.动作[教师.动作.length - 1].时间 / 教师.每秒帧 + 0.125 + 1e-7)
  const 初始 = (
    await 执行({
      ...观察基础,
      文本: 初始文本,
      强制教师: true,
      观察截止: 范围 * 教师.每秒帧,
      时间容差: 固定容差,
    })
  ).观察!
  const 源状态 = 初始.轨迹.flatMap((项) => [项.决策前, 项.释放后])
  const 初始目录 = 创建条件目录(
    说明,
    源状态.map((状态) => ({ 状态 }) as 观察记录),
    动作,
    允许数字IDBuff,
  )
  const 目录 = 初始目录.map((项) => 项.文本)
  const 目录来源 = new Map(初始目录.map((项) => [项.文本, 'teacher-derived']))
  for (const 原子 of 起点规则?.flatMap((规则) => 规则.atoms) || [])
    if (!目录来源.has(原子)) {
      目录.push(原子)
      目录来源.set(原子, 'resume-seed')
    }
  记录?.({
    phase: 'target_profile',
    target_ms: 目标耗时,
    preparation_ms: performance.now() - 准备开始,
    worker_timings_ms: 准备.耗时,
    atoms: 目录.length,
  })
  const 条件缓存 = new Map<string, 宏条件>()
  let 目录缓存:
    | {
        原子: string[]
        树: 宏条件[]
        身份: string
        语义: ReturnType<typeof 描述条件能力>[]
      }
    | undefined
  const 准备目录 = async (原子: string[]) => {
    if (目录缓存?.原子 === 原子) return 目录缓存
    if (!原子.length) throw new Error('条件目录不能为空')
    const 树 = 原子.map((项) => {
      let 条件 = 条件缓存.get(项)
      if (!条件) {
        校验生成条件(项, 说明, 允许数字IDBuff)
        条件 = 解析条件(项, 说明)
        条件缓存.set(项, 条件)
      }
      return 条件
    })
    目录缓存 = {
      原子,
      树,
      身份: await 文本指纹(序列化(原子)),
      语义: 树.map((条件, 索引) =>
        描述条件能力(条件, 目录来源.get(原子[索引]) ?? 'threshold-expansion', 说明),
      ),
    }
    return 目录缓存
  }
  const 技能ID = (名称: string) =>
    Object.entries(说明.映射.技能).find(([, 值]) => 值 === 名称)?.[0] ?? 名称
  const 事件 = (项: 目标动作, 索引: number, 轨迹?: typeof 初始.轨迹) => ({
    name: 名称导出.技能(项.技能),
    skill_id: 技能ID(项.技能),
    time: 项.时间 / 教师.每秒帧,
    channel_ticks: 项.作用次数 ?? null,
    channel_duration: 项.持续帧 === undefined ? null : 项.持续帧 / 教师.每秒帧,
    macro_line: 轨迹?.[索引]?.行号,
    macro_page: 1,
    sequence_index: 索引,
  })
  const 目标 = 教师.动作.map((项, 索引) => 事件(项, 索引))
  const 合同: 生成合同 = {
    protocol_version: 生成协议版本,
    task_id: crypto.randomUUID(),
    input_hash: await 文本指纹(序列化(基础, true)),
    target_hash: await 文本指纹(序列化(目标, true)),
    horizon: 范围,
    time_tolerance_seconds: 固定容差,
    random_seed: 随机种子,
    semantic_version: 生成语义版本,
    algorithm_version: 版本?.算法 ?? 'unavailable',
    adapter_version: 'macro-adapter-v2',
    build_sha: process.env.REACT_APP_MACRO_BUILD_SHA || 'unknown',
    dependencies: {
      python: 版本?.Python ?? 'unknown',
      pyodide: 版本?.Pyodide ?? 'unknown',
      solver: 版本?.求解器 ?? 'unknown',
    },
  }
  const 合同身份 = await 文本指纹(序列化(合同, true))
  const 初始场景 = {
    version: 'online',
    mount: 请求.心法,
    simulation: 请求,
    horizon: 范围,
    time_tolerance_seconds: 固定容差,
    random_seed: 随机种子,
    contract: 合同,
    contract_id: 合同身份,
    empty_macro: '/cast ' + 恒假 + ' ' + 首个技能,
    resume_stage: 起点?.阶段 === '压缩' ? 'compression' : 'generation',
  }
  let 教师缓存 = { 容差: 固定容差, 范围, 观察: 初始 }
  const 运行原生 = async (输入: 器灵请求) => {
    const 开始 = performance.now()
    const 候选文本 = 输入.candidate
    const 强制教师 = 候选文本 === undefined
    const 观察级别 = 强制教师
      ? 'path'
      : (输入.observation ?? (输入.screening ? 'none' : 输入.release_windows ? 'windows' : 'path'))
    if (!['none', 'path', 'windows'].includes(观察级别)) throw new Error('未知的回放观察级别')
    const 候选身份 = 候选文本 === undefined ? null : await 文本指纹(候选文本)
    let 规范身份: string | null = null
    if (候选文本 !== undefined) {
      try {
        规范身份 = await 程序指纹(候选文本, 说明)
      } catch (错误) {
        if (!(错误 instanceof 宏解析错误)) throw 错误
        return {
          protocol_version: 生成协议版本,
          contract: 合同,
          contract_id: 合同身份,
          candidate_hash: 候选身份,
          canonical_program_hash: null,
          status: 'candidate_rejected',
          end: null,
          comparison: null,
          truncated: false,
          probe_failure: { kind: 'syntax_error' },
          error: { name: (错误 as Error).name, message: (错误 as Error).message },
          observation_level: 观察级别,
          decision_prefix_complete: false,
          rows: [],
        }
      }
    }
    const 原子 = 输入.atoms || 目录
    const 当前目录 = await 准备目录(原子)
    const 条件文本 = 原子
    const 树 = 当前目录.树
    const 编译结束 = performance.now()
    const 容差 = 输入.time_tolerance_seconds ?? 固定容差
    if (容差 !== 固定容差 || 输入.horizon !== 范围)
      throw new Error('候选改变了本次任务的固定容差或终点')
    // 强制目标执行不依赖条件目录；同一容差和终点只重算条件标签。
    // 候选宏仍必须独立执行，不能复用教师或其他候选的释放结果。
    let 线程耗时: 成功回复['耗时']
    const 回放 = async () => {
      const 回复 = await 执行({
        ...观察基础,
        文本: 输入.candidate ?? 初始文本,
        观察条件: 条件文本,
        时间容差: 容差,
        强制教师,
        分歧停止: !!输入.stop_on_divergence,
        观察截止: 输入.horizon * 教师.每秒帧,
        观察释放窗口: 观察级别 === 'windows',
        仅比较回放: 观察级别 === 'none',
      })
      线程耗时 = 回复.耗时
      return 回复.观察!
    }
    let 观察 =
      强制教师 && 容差 === 教师缓存.容差 && 输入.horizon === 教师缓存.范围
        ? 教师缓存.观察
        : await 回放()
    if (强制教师) {
      教师缓存 = { 容差, 范围: 输入.horizon, 观察 }
      观察 = {
        ...观察,
        记录: 观察.记录.map((行) => {
          if (行.下次等待 === undefined || 行.固有等待 === undefined) return 行
          const 新行 = { ...行 }
          更新等待条件(新行, 行.下次等待 * 教师.每秒帧, 行.固有等待, 树, 教师.每秒帧)
          新行.等待状态 = 'unknown'
          新行.等待依据 = '教师缓存仅重标条件，当前目录的等待分支尚未重新取证'
          新行.必须释放 = false
          新行.决策见证 = []
          新行.释放窗口 = undefined
          return 新行
        }),
      }
    }
    const 模拟结束 = performance.now()
    const 实际 = 观察.动作.map((项, 索引) => 事件(项, 索引, 观察.轨迹))
    let 顺序 = 0
    while (
      顺序 < Math.min(目标.length, 实际.length) &&
      目标[顺序].skill_id === 实际[顺序].skill_id &&
      目标[顺序].name === 实际[顺序].name
    )
      顺序++
    const 首次 = 观察.完整
      ? null
      : { index: 观察.匹配, expected: 目标[观察.匹配] ?? null, actual: 实际[观察.匹配] ?? null }
    const 比较 = {
      reproduced: 观察.完整,
      target_count: 目标.length,
      actual_count: 实际.length,
      order_prefix: 顺序,
      exact_prefix: 观察.匹配,
      acceptance_prefix: 观察.匹配,
      state_prefix: null,
      state_diagnostics: false,
      acceptance: 'skills_and_time',
      time_tolerance_seconds: 容差,
      max_time_error_on_order_prefix: 观察.最大偏差,
      completed_full_replay: 观察.完整回放,
      first_difference: 首次,
    }
    const 比较结束 = performance.now()
    const 指纹 = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(
        // 回滚恢复 Buff 后键的插入顺序可能不同；指纹仍比较全部字段与数组顺序。
        序列化(
          {
            动作: 实际,
            状态: 观察.轨迹.map((项) => ({ 决策前: 项.决策前, 释放后: 项.释放后 })),
            最终状态: 观察.最终状态,
            结束: 观察.结束,
          },
          true,
        ),
      ),
    )
    const 指纹结束 = performance.now()
    const 行记录 = 观察.记录.map((行) => {
      const 真值 = new Uint8Array(树.length)
      for (let i = 0; i < 树.length; i++) 真值[i] = Number(判定条件(树[i], 行.状态))
      const 可执行 = new Uint8Array(动作.length)
      for (const 索引 of 行.可执行) 可执行[索引] = 1
      return {
        time: 行.状态.时间 / 教师.每秒帧,
        cursor: 行.游标,
        decision_index: 行.决策序号,
        decision_action: 行.决策动作,
        decision_model: 行.决策模型,
        truth: 真值,
        executable: 可执行,
        allowed: 行.允许,
        wait_status: 行.等待状态,
        wait_evidence: { reason: 行.等待依据, scope: 行.等待作用域 },
        release_window: 行.释放范围 ?? null,
        action_predictions: 行.动作预测,
        decision_witnesses: 行.决策见证.map((项) => {
          // 当前点直接引用父行矩阵；只有未来隔离点需要携带独立真值。
          const { truth, executable, ...见证 } = 项
          return {
            ...见证,
            ...(项.time === 行.状态.时间 / 教师.每秒帧 ? {} : { truth, executable }),
            allowed:
              项.allowed === 'allowed' ? true : 项.allowed === 'forbidden' ? false : 'unknown',
          }
        }),
        unknown_actions: 行.未决动作,
        scheduling: 行.调度状态 && { GCD组: 行.调度状态.GCD组 },
        read_dependencies: 说明.调息依赖?.[教师.动作[行.游标]?.技能] ?? [],
        wake_sources: 行.唤醒来源,
        wait_next_time: 行.下次等待,
        wait_clock_atoms: 行.等待条件 ?? null,
        wake_atoms: 行.唤醒条件,
        rejected_actions: 行.拒绝动作,
        release_windows: (行.释放窗口 || []).map((项) => ({
          time: 项.时间,
          clock_atoms: 项.时钟条件,
          truth: 项.真值,
          executable: 项.可执行,
          allowed: 项.允许,
        })),
        state: 转换状态(行.状态, 增益能力),
      }
    })
    const 观察结束 = performance.now()
    const 耗时 = {
      condition_compile: 编译结束 - 开始,
      simulation: 模拟结束 - 编译结束,
      comparison: 比较结束 - 模拟结束,
      fingerprint: 指纹结束 - 比较结束,
      condition_observation: 观察结束 - 指纹结束,
      round_trip: 观察结束 - 开始,
      ...(线程耗时
        ? {
            worker_startup: 线程耗时.线程启动毫秒,
            native_initialization: 线程耗时.初始化毫秒,
            native_simulation: 线程耗时.模拟毫秒,
            native_transport_and_scheduling: 线程耗时.传输及调度毫秒,
          }
        : {}),
      ...(!强制教师 && 观察.观察耗时
        ? {
            observation_query: 观察.观察耗时.动作查询,
            observation_allowed_prediction: 观察.观察耗时.允许预测,
            observation_action_predictions: 观察.观察耗时.动作预测,
            observation_wait_conditions: 观察.观察耗时.等待条件,
            observation_wait_future_state: 观察.观察耗时.等待未来状态,
            observation_release_windows: 观察.观察耗时.释放窗口,
          }
        : {}),
    }
    const 结束 = 转换回放结束(观察.结束, 教师.每秒帧)
    const 回复 = {
      protocol_version: 生成协议版本,
      contract_id: 合同身份,
      candidate_hash: 候选身份,
      canonical_program_hash: 规范身份,
      contract: 合同,
      catalog_id: 当前目录.身份,
      atom_semantics: 当前目录.语义,
      atoms: 原子,
      actions: 动作.map((项) => ({
        name: 名称导出.技能(项.技能),
        fcast: 项.命令 === 'fcast',
      })),
      simulation: 请求,
      target: 目标,
      end: 结束,
      error: 结束.error ?? null,
      status: ['native_error', 'event_stall'].includes(结束.reason)
        ? 'fatal_error'
        : 观察.截断
          ? 'resource_exhausted'
          : 强制教师 && !观察.完整
            ? 'semantic_mismatch'
            : 'ok',
      actual: 实际,
      comparison: 比较,
      truncated: 观察.截断,
      actual_fingerprint: Array.from(new Uint8Array(指纹), (项) =>
        项.toString(16).padStart(2, '0'),
      ).join(''),
      probe_failure: 观察.失败 ?? null,
      timing_diagnostics: 观察.时序诊断,
      trace:
        观察级别 === 'none'
          ? []
          : 观察.轨迹.map((项) => ({
              index: 项.序号,
              macro_line: 项.行号,
              skill: 项.技能,
              time: 项.时间 / 教师.每秒帧,
              diagnostics: 项.诊断,
            })),
      timings_ms: 耗时,
      observation_level: 观察级别,
      decision_prefix_complete: !强制教师 && 观察级别 !== 'none',
      rows: 行记录,
    }
    记录?.({
      phase: 'oracle_profile',
      mode: 强制教师
        ? 'target'
        : 输入.stop_on_divergence
          ? 观察级别 === 'none'
            ? 'screening'
            : 'candidate'
          : 'certification',
      observation_level: 观察级别,
      atoms: 原子.length,
      rows: 行记录.length,
      timings_ms: { ...耗时, serialization: 0 },
    })
    return 回复
  }
  return {
    场景: 初始场景,
    教师,
    说明,
    合同,
    合同身份,
    起点规则: 起点规则?.map((规则) => ({
      action: 规则.action,
      atoms: 规则.atoms.map((原子) => 目录.indexOf(原子)),
      ops: 规则.ops as ('&' | '|')[],
    })),
    运行原生,
  }
}

const 转换状态 = (状态: 宏状态, 能力目录: ReturnType<typeof 创建增益能力目录>) => {
  const 增益 = (列表: 宏状态['自身增益'], 对象: '自身' | '目标') =>
    能力目录
      .filter((能力) => 能力.对象 === 对象 && 能力.实体.length === 1)
      .flatMap((能力) => {
        const 名称 = 能力.实体[0]
        const 项 = 列表[名称]
        return 项 && 项.层数 > 0
          ? [
              {
                name: 能力.名称,
                // 原修复模块直接读取 remaining；0 表示不提供可扩展的倒计时。
                remaining: 能力.永久 || 能力.无计时 ? 0 : 项.剩余帧 / 状态.每秒帧,
                stacks: 项.层数,
                entity: 名称,
                permanent: 能力.永久,
              },
            ]
          : []
      })
  return {
    time: 状态.时间 / 状态.每秒帧,
    buffs: 增益(状态.自身增益, '自身'),
    target_buffs: 增益(状态.目标增益, '目标'),
    values: 状态.数值,
  }
}
