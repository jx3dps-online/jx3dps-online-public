import type { 生成进度 } from './类型'
import type { 运行结束 } from '../类型'

export const 宏生成容差上限 = 0.125

interface 分歧动作 {
  name: string
  time: number
  channel_ticks: number | null
  channel_duration: number | null
}

export interface 回放比较 {
  reproduced: boolean
  completed_full_replay: boolean
  target_count: number
  actual_count: number
  acceptance_prefix: number
  time_tolerance_seconds: number
  max_time_error_on_order_prefix: number
  first_difference?: { index: number; expected: 分歧动作 | null; actual: 分歧动作 | null } | null
}

export interface 回放结束 {
  reason:
    | 'normal_end'
    | 'single_cast'
    | 'observation_stop'
    | 'action_limit'
    | 'step_limit'
    | 'cancelled'
    | 'native_error'
    | 'event_stall'
  start_time: number
  horizon: number
  last_decision_time: number
  final_time: number
  decision_interval_ended: boolean
  tail_settled: boolean
  committed_actions: number
  error?: { name: string; message: string; stage: string }
}

export interface 回放信封 {
  protocol_version: string
  contract_id: string
  candidate_hash: string
  status: string
  end?: 回放结束 | null
  comparison: 回放比较
  truncated: boolean
  probe_failure?: unknown
  error?: unknown
  actual_fingerprint: string
  actual?: unknown[]
  target?: unknown[]
  contract?: import('./身份').生成合同
  canonical_program_hash?: string | null
}

export const 提取认证信封 = (信封: 回放信封): 回放信封 => ({
  protocol_version: 信封.protocol_version,
  contract_id: 信封.contract_id,
  candidate_hash: 信封.candidate_hash,
  canonical_program_hash: 信封.canonical_program_hash,
  contract: 信封.contract,
  status: 信封.status,
  end: 信封.end,
  comparison: 信封.comparison,
  truncated: 信封.truncated,
  probe_failure: 信封.probe_failure,
  error: 信封.error,
  actual_fingerprint: 信封.actual_fingerprint,
  actual: 信封.actual,
  target: 信封.target,
})

export interface 回放校验期望 {
  contract_id: string
  candidate_hash: string
  horizon?: number
  time_tolerance_seconds?: number
}

export const 转换回放结束 = (结束: 运行结束, 每秒帧: number): 回放结束 => ({
  reason: (
    {
      正常终点: 'normal_end',
      单次完成: 'single_cast',
      观察停止: 'observation_stop',
      动作上限: 'action_limit',
      执行步数上限: 'step_limit',
      原生错误: 'native_error',
      事件不推进: 'event_stall',
    } as const
  )[结束.原因],
  start_time: 结束.起始帧 / 每秒帧,
  horizon: 结束.目标截止帧 / 每秒帧,
  last_decision_time: 结束.最后决策帧 / 每秒帧,
  final_time: 结束.原生最终帧 / 每秒帧,
  decision_interval_ended: 结束.决策区间已结束,
  tail_settled: 结束.尾部已结算,
  committed_actions: 结束.已提交动作数,
  error: 结束.原始错误
    ? { name: 结束.原始错误.名称, message: 结束.原始错误.信息, stage: 结束.原始错误.阶段 }
    : undefined,
})

const 时间符合边界 = (容差?: number, 偏差?: number) =>
  Number.isFinite(容差) &&
  容差! >= 0 &&
  容差! <= 宏生成容差上限 &&
  Number.isFinite(偏差) &&
  偏差! >= 0 &&
  偏差! <= 容差! + 1e-7

export const 回放通过校验 = (信封: 回放信封 | undefined, 期望: 回放校验期望): boolean => {
  if (
    !信封 ||
    信封.protocol_version !== 'macro-search-v2' ||
    信封.status !== 'ok' ||
    !期望.contract_id ||
    !期望.candidate_hash ||
    信封.contract_id !== 期望.contract_id ||
    信封.candidate_hash !== 期望.candidate_hash ||
    信封.probe_failure != null ||
    信封.error != null ||
    信封.truncated !== false ||
    !信封.end ||
    !信封.comparison ||
    !/^[a-f0-9]{64}$/.test(信封.actual_fingerprint)
  )
    return false
  const 结束 = 信封.end
  const 比较 = 信封.comparison
  if (
    结束.reason !== 'normal_end' ||
    结束.decision_interval_ended !== true ||
    结束.tail_settled !== true ||
    结束.error != null ||
    ![结束.start_time, 结束.horizon, 结束.last_decision_time, 结束.final_time].every(
      Number.isFinite,
    ) ||
    结束.horizon <= 结束.start_time ||
    结束.final_time < 结束.horizon - 1e-7 ||
    结束.last_decision_time < 结束.start_time ||
    结束.last_decision_time > 结束.horizon + 1e-7 ||
    ![比较.target_count, 比较.actual_count, 比较.acceptance_prefix, 结束.committed_actions].every(
      (项) => Number.isSafeInteger(项) && 项 >= 0,
    )
  )
    return false
  return (
    比较.reproduced === true &&
    比较.completed_full_replay === true &&
    比较.actual_count === 比较.target_count &&
    比较.acceptance_prefix === 比较.target_count &&
    结束.committed_actions === 比较.actual_count &&
    !比较.first_difference &&
    (!信封.actual || 信封.actual.length === 比较.actual_count) &&
    (!信封.target || 信封.target.length === 比较.target_count) &&
    (期望.horizon === undefined || Math.abs(期望.horizon - 结束.horizon) <= 1e-7) &&
    (期望.time_tolerance_seconds === undefined ||
      期望.time_tolerance_seconds === 比较.time_tolerance_seconds) &&
    时间符合边界(比较.time_tolerance_seconds, 比较.max_time_error_on_order_prefix)
  )
}

export const 生成结果可应用 = (进度: 生成进度) =>
  !!进度.已认证 &&
  !!进度.宏 &&
  进度.认证?.宏 === 进度.宏 &&
  回放通过校验(进度.认证.信封, 进度.认证.期望) &&
  进度.匹配数 === 进度.目标数 &&
  !进度.首次分歧 &&
  时间符合边界(进度.容差, 进度.最大偏差)
