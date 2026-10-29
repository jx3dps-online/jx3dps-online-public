import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import type { Buff枚举, BuffDTO, DotDTO, 技能GCD组, 循环基础技能数据类型 } from './type'
import type { 起手Buff配置 } from '../../通用/通用框架/类型定义/Buff'
import type { 选中秘籍信息 } from '@/@types/秘籍'

export const 获取内力消耗 = (
  技能: 循环基础技能数据类型,
  自身Buff: Buff枚举,
  秘籍: 选中秘籍信息,
) => {
  if (技能.技能名称 === '龙跃于渊' && 秘籍['龙跃于渊']?.includes('无消耗内力')) return 0
  if (技能.技能名称 === '亢龙有悔' && 自身Buff.暴龙震江) return 0
  return (技能.内力消耗 || 0) * (自身Buff.越渊 ? 0.75 : 1)
}

export const 根据奇穴修改buff数据 = (奇穴: string[]): Buff枚举 => ({
  ...原始Buff数据,
  触类: { ...原始Buff数据.触类, 最大层数: 奇穴.includes('酩酊') ? 2 : 1 },
  逍遥: {
    ...原始Buff数据.逍遥,
    最大持续时间: (30 + (奇穴.includes('敏行') ? 15 : 0) - (奇穴.includes('棒挑') ? 10 : 0)) * 16,
  },
  灼烧: {
    ...原始Buff数据.灼烧,
    最大作用次数: 奇穴.includes('雨龙') ? 11 : 5,
    最大持续时间: (原始Buff数据.灼烧 as DotDTO).伤害频率 * (奇穴.includes('雨龙') ? 11 : 5),
  },
})

export const 根据奇穴修改技能数据 = (奇穴: string[]) =>
  循环模拟技能基础数据.map((技能) => {
    if (技能.技能名称 === '龙跃于渊' && 奇穴.includes('御龙')) return { ...技能, 技能CD: 128 }
    if (技能.技能名称 === '恶狗拦路' && 奇穴.includes('反截')) return { ...技能, 技能CD: 240 }
    if (技能.技能名称 === '笑醉狂' && 奇穴.includes('酣饮'))
      return { ...技能, 技能CD: 1200, 读条时间: 160 }
    return { ...技能 }
  })

export const 获取本次GCD组集 = (技能: 循环基础技能数据类型, 是否逍遥: boolean) => {
  const 公共组 = 技能.技能GCD组 === '自身' ? 技能.技能名称 : 技能.技能GCD组
  let 触发GCD组 = 技能.触发GCD组 || (公共组 ? [公共组] : [])
  let 检测GCD组 = 技能.检测GCD组 || 触发GCD组
  if (是否逍遥 && !技能.逍遥不替换GCD) {
    if (公共组 === '公共' || 公共组 === '江湖') {
      触发GCD组 = 触发GCD组.map((组) => (组 === 公共组 ? '逍遥' : 组))
      检测GCD组 = 检测GCD组.map((组) => (组 === 公共组 ? '逍遥' : 组))
      // 秘籍只替换 PublicCoolDown，时乘六龙单独的 CheckCoolDown(16) 仍然生效。
      if (技能.技能名称 === '时乘六龙') 检测GCD组 = [...检测GCD组, '江湖']
    } else if (技能.技能名称 === '笑醉狂') {
      触发GCD组 = ['逍遥']
      检测GCD组 = ['逍遥']
    }
  }
  return { 触发GCD组, 检测GCD组 }
}

export const 转换起手Buff配置 = (配置: 起手Buff配置 = {}) => {
  if (!配置.醉影) return 配置
  const 新配置: 起手Buff配置 = { ...配置, 触类: 配置.触类 || { ...配置.醉影, 名称: '触类' } }
  delete 新配置.醉影
  return 新配置
}

export const 获取实际GCD = (
  技能: 循环基础技能数据类型,
  GCD组: 技能GCD组,
  逍遥: BuffDTO | undefined,
  当前时间: number,
) => {
  const 剩余逍遥时间 = 逍遥 ? (逍遥.刷新时间 || 0) + 逍遥.最大持续时间! - 当前时间 : 0
  const { 检测GCD组 } = 获取本次GCD组集(技能, 剩余逍遥时间 > 0)
  let GCD = Math.max(0, ...检测GCD组.map((组) => GCD组[组] || 0))
  if (剩余逍遥时间 > 0 && GCD >= 剩余逍遥时间) {
    const 常态组集 = 获取本次GCD组集(技能, false)
    GCD = Math.max(剩余逍遥时间, ...常态组集.检测GCD组.map((组) => GCD组[组] || 0))
  }
  return GCD
}
