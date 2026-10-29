import type { 宏任务, 宏任务回复 } from '../类型'
import { 创建生成预言机 } from './预言机'
import type { 器灵运行环境 } from './运行时'
import type { 生成进度, 生成请求, 生成起点 } from './类型'
import { 回放通过校验, 提取认证信封, type 回放比较, type 回放信封 } from './结果校验'
import { 文本指纹 } from './身份'
import type { 候选交接 } from './任务协议'
import { 获取认证冲突 } from './任务协议'
import { 原生生成任务 } from './原生生成/任务'
import { 搜索存储 } from './原生生成/搜索存储'

type 成功回复 = Extract<宏任务回复, { 成功: true }>

const 获取分歧说明 = (比较?: 回放比较) => {
  const 分歧 = 比较?.first_difference
  if (!分歧) return undefined
  const { expected: 目标, actual: 实际 } = 分歧
  const 内容 = [
    `第 ${分歧.index + 1} 次：目标 ${目标 ? `${目标.name} @ ${目标.time.toFixed(4)}s` : '循环结束'}，实际 ${实际 ? `${实际.name} @ ${实际.time.toFixed(4)}s` : '未释放'}`,
  ]
  if (目标 && 实际) {
    const 偏差 = Math.abs(目标.time - 实际.time)
    内容.push(
      `时间偏差 ${(偏差 * 1000).toFixed(1)}ms${偏差 > 比较!.time_tolerance_seconds + 1e-7 ? '，超过容差' : ''}`,
    )
    if (目标.channel_ticks !== 实际.channel_ticks)
      内容.push(`引导跳数：目标 ${目标.channel_ticks ?? '无'}，实际 ${实际.channel_ticks ?? '无'}`)
    if (
      Math.abs((目标.channel_duration ?? 0) - (实际.channel_duration ?? 0)) >
      比较!.time_tolerance_seconds + 1e-7
    )
      内容.push(
        `引导时长：目标 ${((目标.channel_duration ?? 0) * 1000).toFixed(1)}ms，实际 ${((实际.channel_duration ?? 0) * 1000).toFixed(1)}ms，超过容差`,
      )
  }
  return 内容.join('；')
}

export const 精确生成 = async (
  请求: 生成请求,
  回放: (任务: 宏任务) => Promise<成功回复>,
  发布: (进度: 生成进度) => void,
  环境: 器灵运行环境 | Promise<器灵运行环境>,
  控制: () => Promise<number> = async () => 0,
  记录?: (消息: Record<string, unknown>) => void,
  已停止: () => boolean = () => false,
  起点?: 生成起点,
  交接?: (事件: 候选交接) => Promise<void>,
  存储?: 搜索存储,
): Promise<生成进度> => {
  const 历史轮数 = 起点?.轮数 ?? 0
  记录?.({ phase: 'initializing' })
  发布({
    状态: '准备',
    轮数: 历史轮数,
    目标数: 请求.当前循环.length,
    匹配数: 0,
    宏: '',
    说明: '准备生成',
  })
  const 初始化开始 = performance.now()
  const 运行环境 = await 环境
  const 预言机 = await 创建生成预言机(请求, 回放, 起点, 记录, 运行环境.版本)
  记录?.({
    phase: 'initialized',
    target_count: 预言机.教师.动作.length,
    skipped_skills: 预言机.教师.跳过技能,
    initialization_ms: performance.now() - 初始化开始,
  })
  let 进度: 生成进度 = {
    状态: '准备',
    轮数: 历史轮数,
    目标数: 预言机.教师.动作.length,
    匹配数: 0,
    宏: '',
    说明: '读取循环',
    容差: 预言机.合同.time_tolerance_seconds,
  }
  const 阶段: Record<string, string> = {
    preparing: '读取循环',
    prepared: '循环已就绪',
    solving: '搜索宏条件',
    constructing: '生成宏规则',
    candidate: '准备验证',
    replaying: '验证宏',
    replayed: '验证完成',
    best: '已更新最佳结果',
    expanding: '补充宏条件',
    branching: '调整宏规则',
    paused: '已暂停',
    resumed: '继续生成',
    compressing: '正在搜索更短的条件组合，搜索期间轮数暂不增加',
  }
  const 压缩活动说明: Record<string, string> = {
    candidate_search: 阶段.compressing,
    path_observation: '正在采集压缩所需数据，采集期间轮数暂不增加',
  }
  let 上次推送 = -Infinity
  let 上次压缩阶段 = ''
  let 本轮候选 = ''
  const 认证结果 = new Map<string, NonNullable<生成进度['认证']>>()
  const 完整回放证据 = new Map<string, 回放信封>()
  const 已否定候选 = new Set<string>()
  const 交接候选 = async (
    消息: {
      candidate: string
      parent_hash?: string
      source?: string
      iteration?: number
      result?: 回放信封
      accepted?: boolean
    },
    认证: boolean,
  ) => {
    const 宏 = 消息.candidate
    const id = await 文本指纹(宏)
    const 期望 = {
      contract_id: 预言机.合同身份,
      candidate_hash: id,
      horizon: 预言机.合同.horizon,
      time_tolerance_seconds: 预言机.合同.time_tolerance_seconds,
    }
    const 信封 = 消息.result
    const 候选 = {
      id,
      文本: 宏,
      上下文: 预言机.合同身份,
      父候选: 消息.parent_hash,
      来源: 消息.source,
      轮数: 历史轮数 + (消息.iteration ?? 0),
      UTF8字节: new TextEncoder().encode(宏).byteLength,
      UTF16字符: 宏.length,
      行数: 宏.split(/\r\n|\n|\r/).length,
    }
    const 原证据 = 认证结果.get(宏)?.信封 ?? 完整回放证据.get(宏)
    const 冲突 = 原证据 && 获取认证冲突(原证据, 信封)
    if (冲突) {
      认证结果.delete(宏)
      完整回放证据.delete(宏)
      已否定候选.add(宏)
      if (进度.宏 === 宏) 进度 = { ...进度, 已认证: false, 认证: undefined }
      await 交接?.({
        类型: 'candidate_revoked',
        候选,
        证据: 信封 && 提取认证信封(信封),
        冲突: { 原证据: 原证据!, 新证据: 提取认证信封(信封!), 原因: 冲突 },
      })
    }
    if (!已否定候选.has(宏) && 回放通过校验(信封, 期望)) 完整回放证据.set(宏, 提取认证信封(信封!))
    if (认证) {
      if (已否定候选.has(宏)) throw new Error('同一候选的完整认证证据相互矛盾')
      if (!回放通过校验(信封, 期望)) throw new Error('认证候选与完整回放证据不一致')
      认证结果.set(宏, { 宏, 信封: 提取认证信封(信封!), 期望 })
      if (消息.accepted)
        进度 = {
          ...进度,
          宏,
          已认证: true,
          认证: 认证结果.get(宏),
          匹配数: 信封!.comparison.acceptance_prefix,
          最大偏差: 信封!.comparison.max_time_error_on_order_prefix,
          首次分歧: undefined,
          说明: '完整回放已认证',
        }
    }
    本轮候选 = 宏
    await 交接?.({
      类型: 认证
        ? 消息.accepted
          ? 'candidate_accepted'
          : 'candidate_certified'
        : 信封
          ? 'candidate_finished'
          : 'candidate_started',
      候选,
      证据: 信封 && 提取认证信封(信封),
      错误:
        信封 && (信封.status === 'fatal_error' || 信封.status === 'candidate_rejected')
          ? JSON.stringify(信封.error ?? 信封.probe_failure)
          : undefined,
      进度: 认证 && 消息.accepted ? 进度 : undefined,
    })
  }
  const 处理消息 = (消息: Record<string, any>) => {
    记录?.({ ...消息, ...(消息.macro ? { 可读宏: 消息.macro } : {}) })
    if (消息.phase === 'compression_activity') {
      进度 = {
        ...进度,
        状态: '压缩',
        说明: 消息.event === 'start' ? 压缩活动说明[消息.activity] || 进度.说明 : 进度.说明,
        压缩诊断: [
          ...(进度.压缩诊断 ?? []).slice(-11),
          {
            阶段: 消息.activity,
            状态: 消息.event === 'start' ? '开始' : '结束',
            时间: new Date().toISOString(),
            耗时毫秒: 消息.elapsed_ms,
          },
        ],
      }
      // 新阶段立即发布；连续快速取候选合并推送，避免增加界面和保存开销。
      const 时刻 = performance.now()
      if (
        (消息.event === 'start' && (上次压缩阶段 !== 消息.activity || 时刻 - 上次推送 >= 50)) ||
        消息.elapsed_ms >= 50
      ) {
        发布(进度)
        上次推送 = 时刻
        上次压缩阶段 = 消息.event === 'start' ? 消息.activity : ''
      }
      return
    }
    if (消息.phase?.endsWith('_profile')) return
    上次压缩阶段 = ''
    const 比较 = 消息.comparison
    const 压缩 = 消息.compression
    if (消息.macro) 本轮候选 = 消息.macro
    进度 = {
      ...进度,
      轮数: 消息.iteration === undefined ? 进度.轮数 : 历史轮数 + 消息.iteration,
      状态: 消息.phase === 'replaying' ? '回放' : '生成',
      宏: 消息.phase === 'best' ? 消息.macro : 进度.宏,
      匹配数: 消息.phase === 'best' ? 比较.acceptance_prefix : 进度.匹配数,
      最大偏差: 消息.phase === 'best' ? 比较.max_time_error_on_order_prefix : 进度.最大偏差,
      首次分歧: 消息.phase === 'best' ? 获取分歧说明(比较) : 进度.首次分歧,
      容差: 消息.time_tolerance_seconds ?? 比较?.time_tolerance_seconds ?? 进度.容差,
      说明:
        消息.phase === 'replayed' && (消息.stage === 'compression' || 进度.压缩)
          ? 阶段.compressing
          : 阶段[消息.phase] || 进度.说明,
      已认证: 消息.phase === 'best' ? 认证结果.has(消息.macro) : 进度.已认证,
      认证: 消息.phase === 'best' ? 认证结果.get(消息.macro) : 进度.认证,
      起点已复核: 进度.起点已复核 || (!!起点 && 消息.phase === 'best' && !!比较),
      最近回放: 比较
        ? {
            轮数: 消息.iteration === undefined ? 进度.轮数 : 历史轮数 + 消息.iteration,
            宏: 本轮候选,
            比较,
          }
        : 进度.最近回放,
      压缩: 压缩
        ? {
            初始字符: 压缩.initial_chars,
            最佳字符: 压缩.best_chars,
            试算次数: 压缩.trial_count || 0,
            接受次数: 压缩.accepted_count || 0,
          }
        : 进度.压缩,
    }
    if (消息.stage === 'compression' || 进度.压缩) 进度.状态 = '压缩'
    const 时刻 = performance.now()
    if (
      消息.phase === 'best' ||
      消息.phase === 'compressing' ||
      (消息.phase === 'replayed' && 进度.状态 === '压缩') ||
      时刻 - 上次推送 >= 50
    ) {
      发布(进度)
      上次推送 = 时刻
    }
  }
  const 检查 = () => {
    if (已停止()) throw Object.assign(new Error('生成已停止'), { cancelled: true })
  }
  const 生成 = new 原生生成任务(
    预言机,
    async () => {
      await 控制()
      检查()
    },
    检查,
    (消息) => 交接候选(消息, false),
    (消息) => 交接候选(消息, true),
    运行环境.求解,
    处理消息,
    存储,
  )
  const 结果 = await 生成.run(预言机.起点规则)
  const 最终宏 = 结果.macro || ''
  const 最终信封 = 结果.report.status === 'exact' ? 认证结果.get(最终宏)?.信封 : undefined
  let 比较 = 最终信封?.comparison ?? 结果.report.comparison
  const 期望 = {
    contract_id: 预言机.合同身份,
    candidate_hash: await 文本指纹(最终宏),
    horizon: 预言机.合同.horizon,
    time_tolerance_seconds: 预言机.合同.time_tolerance_seconds,
  }
  if (结果.report.status !== 'exact' && 结果.report.candidate_hash !== 期望.candidate_hash)
    比较 = undefined
  const 已认证 = 结果.report.status === 'exact' && 回放通过校验(最终信封, 期望)
  记录?.({
    phase: 'finished',
    report: {
      ...结果.report,
      status: 结果.report.status === 'exact' && !已认证 ? 'validation_failed' : 结果.report.status,
      comparison: 比较,
    },
    可读宏: 结果.macro || '',
  })
  return {
    ...进度,
    宏: 最终宏,
    匹配数: 比较?.acceptance_prefix ?? 0,
    最大偏差: 比较?.max_time_error_on_order_prefix,
    首次分歧: 获取分歧说明(比较),
    容差: 比较?.time_tolerance_seconds ?? 进度.容差,
    状态: 已认证 ? '成功' : '未完成',
    已认证,
    结束事实: {
      状态: 结果.report.status,
      压缩停止: 结果.report.compression_stop ?? undefined,
      原因: 最终信封?.error
        ? typeof 最终信封.error === 'string'
          ? 最终信封.error
          : JSON.stringify(最终信封.error)
        : 结果.report.reason,
      最终校验: 最终信封?.status,
    },
    认证: 已认证 ? { 宏: 最终宏, 信封: 提取认证信封(最终信封!), 期望 } : undefined,
    最近回放:
      最终信封 && 比较
        ? { 轮数: 进度.轮数, 宏: 最终宏, 比较 }
        : (进度.最近回放 ??
          (比较 &&
          Number.isInteger(结果.report.candidate_iteration) &&
          结果.report.candidate_iteration >= 0
            ? { 轮数: 历史轮数 + 结果.report.candidate_iteration, 宏: 最终宏, 比较 }
            : undefined)),
    说明:
      结果.report.status === 'exact' && !已认证
        ? '缺少当前宏的有效认证记录，无法应用此宏'
        : 已认证
          ? 结果.report.compression_stop === 'cancelled'
            ? '压缩已停止，保留已验证宏'
            : 结果.report.compression_stop === 'error' ||
                结果.report.compression_stop === 'resource_exhausted' ||
                结果.report.compression_stop === 'budget_exhausted'
              ? '压缩未完成，保留已验证宏：' + (结果.report.reason || 结果.report.compression_stop)
              : '生成完成，已保留当前最短已验证宏'
          : 结果.report.reason ||
            (结果.report.status === 'semantic_mismatch'
              ? '宏无法复现当前循环'
              : '尚未找到可复现的宏'),
  }
}
