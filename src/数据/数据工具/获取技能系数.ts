// import { INT } from '@/工具函数/help'

import { INT } from '@/工具函数/help'
import { 属性系数 } from '../常量'

const 每秒帧数 = 16
const 外功系数 = 10
const 内功系数 = 12

const dot系数 = 12

// 获取实际系数
export const 获取实际系数 = (
  系数: number,
  参数: 获取实际系数入参类型 = {},
  功法?: '内功' | '外功' | '天罗诡道',
  系数增伤 = 1,
) => {
  const { dot跳数, dot间隔 } = 参数 as any

  const 实际功法 = 功法 || '外功'

  const 基础系数 = (实际功法 === '外功' ? 外功系数 : 内功系数) * 每秒帧数

  if (dot跳数 && dot间隔) {
    const 系数判断 = 系数 < 16 ? 16 : 系数
    let 间隔 = dot间隔
    if ((dot跳数 * dot间隔) / dot系数 < 每秒帧数) {
      间隔 = (每秒帧数 * dot系数) / dot跳数
    }
    return (INT(系数判断 * 系数增伤) * 间隔) / 每秒帧数 / dot系数 / 基础系数
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

export const 破招全局系数 = 属性系数.破招
