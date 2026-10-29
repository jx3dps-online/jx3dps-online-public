import type { 循环数据 } from '@/@types/循环'
import type { 选中秘籍信息 } from '@/@types/秘籍'
import { 装备信息数据类型, 装备特效枚举 } from '@/@types/装备'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import type { 配装循环 } from '@/角色/类型'
import { 填充文案, 武器类型显示 } from '../文案'
import type { 登阶文案 } from '../文案'

export const 提取配装循环 = (数据: {
  当前计算循环名称?: string
  当前奇穴信息?: string[]
  当前秘籍信息?: 选中秘籍信息
}): 配装循环 | undefined =>
  数据.当前计算循环名称
    ? {
        名称: 数据.当前计算循环名称,
        奇穴: [...(数据.当前奇穴信息 || [])],
        秘籍: JSON.parse(JSON.stringify(数据.当前秘籍信息 || {})),
      }
    : undefined

export const 登阶武器类型 = (装备?: 装备信息数据类型) => {
  const 武器 = 装备?.装备列表?.find((项) => 项.装备部位 === '武器')
  const 数据 = 获取当前数据().装备数据?.['武器']?.find((项) => 项.id === 武器?.id)
  if (!数据) return '未装备'
  if (数据.装备特效 === 装备特效枚举.大橙武特效) return '橙武'
  if (数据.装备特效 === 装备特效枚举.门派特效武器) return '特效'
  return '紫武'
}

/** 沿用配装器的特效判定；小橙武、橙色腰坠均不能解锁大橙武循环。 */
export const 登阶循环限制 = (
  装备: 装备信息数据类型,
  循环: 循环数据 | undefined,
  文案: 登阶文案,
) => {
  if (!循环) return 文案['循环.错误.已不存在']
  if (['橙武', '特效'].includes(循环.标记 || '') && 登阶武器类型(装备) !== 循环.标记)
    return 填充文案(文案['循环.错误.未装备'], { 标记: 武器类型显示(文案, 循环.标记) })
  return undefined
}

export const 同一登阶循环 = (甲?: 配装循环, 乙?: 配装循环) =>
  甲?.名称 === 乙?.名称 &&
  JSON.stringify(甲?.奇穴 || []) === JSON.stringify(乙?.奇穴 || []) &&
  JSON.stringify(甲?.秘籍 || {}) === JSON.stringify(乙?.秘籍 || {})

/** 大橙武判定沿用武器槽的大橙武特效；小橙武、门派特效武器、橙色腰坠都不算。 */
export const 是大橙武 = (装备?: 装备信息数据类型) => 登阶武器类型(装备) === '橙武'

/** 有序拆解：先换目标配装，再在同一份目标配装上切换循环；这两项才可以相加。 */
export const 拆解登阶收益 = (
  当前?: number,
  目标沿用当前循环?: number,
  目标使用目标循环?: number,
) => {
  const 差 = (后?: number, 前?: number) =>
    后 !== undefined && 前 !== undefined && Number.isFinite(后) && Number.isFinite(前)
      ? 后 - 前
      : undefined
  return {
    装备提升: 差(目标沿用当前循环, 当前),
    循环提升: 差(目标使用目标循环, 目标沿用当前循环),
    总提升: 差(目标使用目标循环, 当前),
  }
}
