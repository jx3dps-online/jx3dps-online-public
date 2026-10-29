import type { 宏条件, 心法说明 } from '../类型'
import { 解析宏 } from '../核心/解析'
import { 描述条件能力 } from '../核心/条件能力'

export const 生成协议版本 = 'macro-search-v2'
export const 生成语义版本 = 'macro-native-v5-burst5-10ms'

export const 序列化 = (值: unknown, 固定键序 = false) =>
  JSON.stringify(值, (_, 项) => {
    if (typeof 项 === 'number' && !Number.isFinite(项)) return { __macroNumber: String(项) }
    if (固定键序 && 项 && typeof 项 === 'object' && !Array.isArray(项))
      return Object.fromEntries(
        Object.keys(项)
          .sort()
          .map((键) => [键, 项[键]]),
      )
    return 项
  })

export const 文本指纹 = async (文本: string) => {
  const 摘要 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(文本))
  return Array.from(new Uint8Array(摘要), (项) => 项.toString(16).padStart(2, '0')).join('')
}

// 文件名按确定的 UTF-16 顺序排列，避免机器语言环境改变同一份源码的身份。
export const 源码指纹 = (源码: Record<string, string>) =>
  文本指纹(
    JSON.stringify(
      Object.keys(源码)
        .sort()
        .map((名称) => [名称, 源码[名称]]),
    ),
  )

export const 程序指纹 = (文本: string, 说明: 心法说明) => {
  const 配置 = 解析宏(文本, 说明)
  const 条件身份 = (条件?: 宏条件) => (条件 ? 描述条件能力(条件, '').atom_id : null)
  return 文本指纹(
    序列化(
      配置.页.map((页) => ({
        体态: 页.体态 ?? null,
        语句: 页.语句.map((行) => ({
          命令: 行.命令,
          目标: 行.命令 === 'mcast' ? 行.宏 : 行.技能,
          条件: 条件身份(行.条件),
        })),
      })),
      true,
    ),
  )
}

export interface 生成合同 {
  protocol_version: typeof 生成协议版本
  task_id: string
  input_hash: string
  target_hash: string
  horizon: number
  time_tolerance_seconds: number
  random_seed: number
  semantic_version: string
  algorithm_version: string
  adapter_version: string
  build_sha: string
  dependencies: Record<string, string>
}
