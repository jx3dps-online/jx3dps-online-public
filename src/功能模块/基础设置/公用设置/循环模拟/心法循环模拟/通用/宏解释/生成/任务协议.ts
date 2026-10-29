import type { 生成任务, 生成日志, 生成进度 } from './类型'
import type { 回放信封 } from './结果校验'

// 只有同一合同与原文的正常完整回放，才足以否定已有证书。
export const 获取认证冲突 = (原证据: 回放信封, 新证据?: 回放信封) => {
  if (
    !新证据 ||
    新证据.protocol_version !== 原证据.protocol_version ||
    新证据.contract_id !== 原证据.contract_id ||
    新证据.candidate_hash !== 原证据.candidate_hash ||
    !['ok', 'semantic_mismatch'].includes(新证据.status) ||
    新证据.truncated !== false ||
    新证据.error != null ||
    新证据.end?.reason !== 'normal_end' ||
    新证据.end.error != null ||
    新证据.end.decision_interval_ended !== true ||
    新证据.end.tail_settled !== true ||
    新证据.comparison?.completed_full_replay !== true ||
    !Number.isFinite(新证据.end.final_time) ||
    新证据.end.horizon !== 原证据.end?.horizon ||
    新证据.end.final_time < 新证据.end.horizon - 1e-7
  )
    return undefined
  if (新证据.comparison.reproduced === false) {
    const 分歧 = 新证据.probe_failure as { kind?: string } | null | undefined
    if (
      分歧 == null ||
      (typeof 分歧.kind === 'string' &&
        [
          'wrong_action',
          'early_release',
          'late_release',
          'missed_release_window',
          'channel_ticks_mismatch',
        ].includes(分歧.kind))
    )
      return 'semantic_mismatch' as const
  }
  if (
    新证据.comparison.reproduced === true &&
    新证据.probe_failure == null &&
    /^[a-f0-9]{64}$/.test(新证据.actual_fingerprint) &&
    新证据.actual_fingerprint !== 原证据.actual_fingerprint
  )
    return 'fingerprint_mismatch' as const
  return undefined
}

export interface 任务错误信息 {
  类型: 'candidate_rejected' | 'fatal_error' | 'resource_exhausted' | 'cancelled'
  消息: string
  原始错误?: unknown
}

export const 序列化任务错误 = (错误: unknown): 任务错误信息 => {
  const 值 = 错误 as { 类型?: 任务错误信息['类型']; 原始错误?: unknown }
  const 类型 = 值?.类型
  return {
    类型:
      类型 &&
      ['candidate_rejected', 'fatal_error', 'resource_exhausted', 'cancelled'].includes(类型)
        ? 类型
        : 'fatal_error',
    消息: 错误 instanceof Error ? 错误.message : String(错误),
    原始错误:
      值?.原始错误 ??
      (错误 instanceof Error
        ? { 名称: 错误.name, 消息: 错误.message, 栈: 错误.stack }
        : String(错误)),
  }
}

export interface 候选记录 {
  id: string
  文本: string
  上下文?: string
  父候选?: string
  来源?: string
  轮数?: number
  UTF8字节: number
  UTF16字符: number
  行数: number
}

export interface 候选交接 {
  类型:
    | 'candidate_started'
    | 'candidate_finished'
    | 'candidate_certified'
    | 'candidate_accepted'
    | 'candidate_revoked'
  候选: 候选记录
  证据?: unknown
  错误?: string
  进度?: 生成进度
  冲突?: { 原证据: 回放信封; 新证据: 回放信封; 原因: 'semantic_mismatch' | 'fingerprint_mismatch' }
}

export interface 生成任务诊断 {
  格式: 'macro-task-evidence-v2'
  任务id: string
  构建: string
  请求: 生成任务
  候选: Record<
    string,
    { 记录: 候选记录; 证据?: unknown; 错误?: string; 认证?: { 记录: 候选记录; 证据: unknown } }
  >
  正在执行?: string
  历史最佳?: string
  最近回放?: string
  最后失败?: string
  最后认证?: string
  已采纳?: string[]
  认证冲突?: { 候选: 候选记录; 原证据: 回放信封; 新证据: 回放信封; 原因: string }[]
  结束原因?: 'completed' | 'cancelled' | 'fatal_error' | 'resource_exhausted' | 'incomplete'
  结束事实?: 生成进度['结束事实']
  原始错误?: string
  错误详情?: 任务错误信息
  交接完整: boolean
}

export interface 生成任务快照 {
  完成: boolean
  进度?: 生成进度
  错误?: string
  暂停状态: '运行' | '等待暂停边界' | '已暂停'
  诊断: 生成任务诊断
}

export type 生成线程输入 =
  | { 类型: '开始'; 任务id: string; 任务: 生成任务 }
  | { 类型: '控制'; 任务id: string; 控制: '暂停' | '继续' }
  | { 类型: '交接确认'; 任务id: string; 请求id: number; 错误?: string }

export type 生成线程输出 =
  | { 类型: '候选交接'; 任务id: string; 请求id: number; 事件: 候选交接 }
  | { 类型: '暂停状态'; 任务id: string; 已暂停: boolean }
  | {
      类型: '进度'
      任务id: string
      完成: boolean
      进度?: 生成进度
      错误?: 任务错误信息
      日志?: 生成日志[]
    }

export const 候选文本哈希 = async (文本: string) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(文本))),
    (值) => 值.toString(16).padStart(2, '0'),
  ).join('')
