import { 事件总线 } from './事件总线'

/**
 * 业务事件集中登记（单一事实来源）
 * 后续其它模块需要在 事件名 + 事件载荷映射 中追加
 */
export const 事件名 = {
  计算完成: '计算完成',
  计算报错: '计算报错',
  未选循环: '未选循环',
  打开配装器: '打开配装器',
  没开增益就计算: '没开增益就计算',
} as const

export type 事件名类型 = (typeof 事件名)[keyof typeof 事件名]

export interface 事件载荷映射 {
  计算完成: { dps: number }
  计算报错: { 错误信息: string }
  未选循环: undefined
  打开配装器: undefined
  没开增益就计算: undefined
}

/**
 * 全局事件单例，供全应用共享
 */
export const 全局事件 = new 事件总线<事件载荷映射>()
