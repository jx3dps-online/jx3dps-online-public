/**
 * @name 获取逐云寒蕊装分计算数值
 * @description 根据装分和飘黄层数计算逐云寒蕊的基础伤害
 * @param 技能等级
 * @param 最终计算属性
 * @returns number
 */

import { 最终计算属性类型 } from '@/@types/计算'
import { INT } from '@/工具函数/help'

export const 获取逐云寒蕊真实伤害 = (技能等级: number, 最终计算属性: 最终计算属性类型): number => {
  const 装分 = 最终计算属性?.最终人物属性?.装分 || 0
  const 基础伤害 = Math.max(18, 装分 * 0.0020416667 - 22.9166667)
  const 最终计算层数 = Math.max(技能等级, 1)

  return INT(基础伤害 * 最终计算层数)
}
