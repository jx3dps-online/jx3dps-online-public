import { 属性类型 } from '@/@types/属性'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取最高武伤附魔 } from '@/数据/附魔/查询'

/** 容量分数的放大系数：以附魔为 1 个容量单位，放大便于阅读 */
export const 分数放大系数 = 1000

/** 将部分内功/外功属性归并为全属性口径（与装备速查保持一致） */
export const 装备和附魔属性转换 = (属性?: string): 属性类型 => {
  if (!属性) return '' as 属性类型
  if (属性.includes('AttackPowerBase')) {
    return 属性类型.全基础攻击
  } else if (属性.includes('Overcome')) {
    return 属性类型.全破防等级
  } else if (属性.includes('CriticalStrike')) {
    return 属性类型.全会心等级
  } else if (属性.includes('CriticalDamagePowerBase')) {
    return 属性类型.全会心效果等级
  }
  return 属性 as 属性类型
}

/**
 * 附魔基准容量系数表：属性类型 -> 当前心法可用附魔的最高值。
 * - 附魔列表已按功法 / 主属性过滤（`数据/附魔/查询.ts`）。
 * - 全能沿用装备速查约定：与无双同基准。
 * - 武器伤害按最高武伤附魔基准折算。
 */
export const 获取容量系数表 = (): Record<string, number> => {
  const { 附魔 } = 获取当前数据()
  const 系数表: Record<string, number> = {}
  ;(附魔 || []).forEach((item) => {
    const 属性 = item?.增益集合?.[0]?.属性
    const 值 = item?.增益集合?.[0]?.值 || 0
    if (!属性 || !值) return
    if (!系数表[属性] || 系数表[属性] < 值) 系数表[属性] = 值
  })

  if (系数表[属性类型.无双等级]) {
    系数表[属性类型.全能等级] = Math.floor(系数表[属性类型.无双等级])
  }

  const 武伤最大附魔 = 获取最高武伤附魔()
  const 武伤基准 = 武伤最大附魔?.增益集合?.[0]?.值 || 0
  if (武伤基准) 系数表[属性类型.武器伤害] = 武伤基准

  delete 系数表[属性类型.额外气血上限]
  return 系数表
}
