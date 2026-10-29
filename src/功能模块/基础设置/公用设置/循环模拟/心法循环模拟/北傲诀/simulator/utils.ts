import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 属性类型 } from '@/@types/属性'
import 通用增益 from '@/心法模块/心法/北傲诀/技能增益/通用增益/通用增益'
import type { 选中秘籍信息 } from '@/@types/秘籍'
import { 判断秘籍减冷却 } from '../../通用/通用函数'
import type { 循环基础技能数据类型 } from './type'

export const 根据奇穴修改buff数据 = (_奇穴: string[], _加速值: number) => {
  const res = {}
  Object.keys(原始Buff数据).forEach((key) => {
    res[key] = { ...原始Buff数据[key] }
  })
  return res
}

export const 根据奇穴秘籍修改技能数据 = (
  奇穴: string[],
  秘籍: 选中秘籍信息,
): 循环基础技能数据类型[] => {
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  const res: 循环基础技能数据类型[] = 循环模拟技能基础数据.map((技能) => {
    const 秘籍减冷却 = 判断秘籍减冷却(技能.技能名称, 秘籍)
    const 技能原始CD = Math.max(0, (技能.技能CD || 0) - 秘籍减冷却)
    if (技能.技能名称 === '刀啸风吟') {
      return {
        ...技能,
        技能CD: 判断奇穴('绝期') ? 技能原始CD : 0,
        消耗数量: 判断奇穴('荡岳') ? 0 : 秘籍.刀啸风吟?.includes('回气劲') ? 3.5 : 技能.消耗数量,
      }
    } else if (技能.技能名称 === '醉斩白蛇') {
      return { ...技能, 技能CD: Math.max(0, 技能原始CD - (判断奇穴('荡岳') ? 160 : 0)) }
    } else if (技能.技能名称 === '楚河汉界') {
      return { ...技能, 技能CD: 技能原始CD, 创建循环不可选: 判断奇穴('烽河') }
    } else {
      return { ...技能, 技能CD: 技能原始CD }
    }
  })

  return res
}

// 沿用焚影与 JCL 的属性口径；破防、易伤、无视防御按每跳实时结算。
export const DOT快照Buff列表 = 通用增益
  .filter(
    (增益) =>
      增益.增益类型 === '部分启用' &&
      增益.增益计算位置 !== '目标' &&
      增益.增益集合?.length &&
      增益.增益集合.every(({ 属性 }) =>
        [
          属性类型.郭氏外功基础攻击,
          属性类型.郭氏全基础攻击,
          属性类型.无双等级,
          属性类型.郭氏无双,
          属性类型.通用增伤,
          属性类型.最终增伤,
        ].includes(属性),
      ),
  )
  .map((增益) => 增益.增益名称)

export const ERROR_ACTION = {
  体态错误: { 信息: '当前体态不能施展该技能' },
  资源不足: { 信息: '当前资源不足' },
  BUFF错误: { 信息: '缺少技能所需增益' },
}
