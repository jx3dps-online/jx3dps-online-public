import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 起手Buff配置 } from '../../通用/通用框架/类型定义/Buff'
import { 破苍穹Buff名称 } from '../constant'
import { Buff枚举 } from './type'

export const 转换起手Buff配置 = (配置?: 起手Buff配置) => {
  if (!配置) return 配置
  let 结果 = 配置
  for (const [旧名, 新名] of [
    ['六合剑域', '八方剑域'],
    ['破苍穹', '破苍穹一'],
  ]) {
    const 条目 = 结果[新名] ?? 结果[旧名]
    if (!Object.prototype.hasOwnProperty.call(结果, 旧名) && 条目?.名称 !== 旧名) continue
    结果 = {
      ...结果,
      [新名]:
        条目 && typeof 条目 === 'object' && !Array.isArray(条目) ? { ...条目, 名称: 新名 } : 条目,
    }
    delete 结果[旧名]
  }
  return 结果
}
export const 根据奇穴修改buff数据 = (奇穴: string[]) => {
  const 数据 = Object.fromEntries(
    Object.entries(原始Buff数据).map(([名称, Buff]) => [名称, { ...Buff }]),
  )
  if (奇穴.includes('抱阳')) {
    破苍穹Buff名称.forEach((名称) => {
      数据[名称].最大持续时间 = 每秒郭氏帧 * 36
    })
  }
  return 数据
}
export const 根据奇穴秘籍修改技能数据 = (奇穴: string[], _秘籍) =>
  循环模拟技能基础数据.map((技能) => {
    const 数据 = { ...技能 }
    if (数据.技能名称 === '破苍穹') 数据.技能CD = 奇穴.includes('归元') ? 0 : 每秒郭氏帧 * 10
    if (数据.技能名称 === '五方行尽')
      数据.技能CD = 奇穴.includes('正气') ? 每秒郭氏帧 * 20 : 每秒郭氏帧 * 15
    if (数据.技能名称 === '紫气东来')
      数据.技能CD = 奇穴.includes('固本') ? 每秒郭氏帧 * 57 : 每秒郭氏帧 * 75
    return 数据
  })
export const 获取当前破苍穹 = (buff列表: Buff枚举) =>
  破苍穹Buff名称.map((名称) => buff列表[名称]).filter((Buff) => Buff?.当前层数)

export const 转化buff和增益名称 = (增益名称, buff列表) => {
  if (增益名称 === '破苍穹') return 获取当前破苍穹(buff列表)[0]
  return buff列表[增益名称 === '仙灵' ? '橙武' : 增益名称]
}
