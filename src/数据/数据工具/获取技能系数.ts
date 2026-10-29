import { INT } from '@/工具函数/help'
import { 内功常数, 外功常数, DOT常数, 每秒郭氏帧 } from '../常量'

const 获取DOT实际系数 = (
  系数: number,
  dot跳数: number,
  dot间隔: number,
  基础系数: number,
  系数增伤 = 1,
) => {
  const 系数判断 = Math.max(系数, 每秒郭氏帧)
  // DOT 总时长换算先取整且最低为 16，再均摊到每跳。
  const DOT时长系数 = Math.max(INT((dot跳数 * dot间隔) / DOT常数), 每秒郭氏帧)

  return (INT(系数判断 * 系数增伤) * DOT时长系数) / dot跳数 / 每秒郭氏帧 / 基础系数
}

// 获取实际系数
export const 获取实际系数 = (
  系数: number,
  参数: 获取实际系数入参类型 = {},
  功法?: '内功' | '外功' | '天罗诡道',
  系数增伤 = 1,
) => {
  const { dot跳数, dot间隔 } = 参数

  const 实际功法 = 功法 || '外功'

  const 基础系数 = (实际功法 === '外功' ? 外功常数 : 内功常数) * 每秒郭氏帧

  if (dot跳数 && dot间隔) {
    return 获取DOT实际系数(系数, dot跳数, dot间隔, 基础系数, 系数增伤)
  }

  return Math.floor(系数 * 系数增伤) / 基础系数
}

export const 获取内功实际系数 = (系数: number, 参数: 获取实际系数入参类型 = {}) => {
  return 获取实际系数(系数, 参数, '内功')
}

export const 获取全局伤害因子 = (系数) => {
  return ((INT(系数) + (系数 < 0 ? 1 : 0)) / 1024 + 1024) / 1024
}

interface 获取实际系数入参类型 {
  dot跳数?: number
  dot间隔?: number
}
