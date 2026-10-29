import type { 配装原始数据 } from '@/功能模块/攻略/components/配装'
import type { 配装快照 } from '@/角色/类型'

export type 踏天路线 = '紫武' | '橙武'
export interface 踏天配置 {
  版本: string
  维护人: string
  校验时间: string
  开启进度阈值?: number
  门槛: { 配装: 配装原始数据; 循环名称: string }
  路线: Partial<Record<踏天路线, { 配装: 配装原始数据; 循环名称: string }>>
}
export interface 踏天认可 {
  当前签名: string
  参考签名: string
}
export interface 踏天状态 {
  路线: 踏天路线
  进入时间: number
  配置版本: string
  返回目标id?: string
  替代认可: Record<string, 踏天认可>
  主动完成?: {
    时间: number
    路线: 踏天路线
    配置版本: string
    参考签名: string
    配装: 配装快照
  }
}
export const 踏天目标id = (路线: 踏天路线) => '踏天境:' + 路线
export const 踏天开启进度阈值 = 0.1
export const 踏天主动完成比例 = 0.98
export const 踏天阶位 = [
  { 键: '问道', 阈值: 0 },
  { 键: '破妄', 阈值: 0.25 },
  { 键: '凌虚', 阈值: 0.5 },
  { 键: '叩天', 阈值: 0.75 },
] as const
