import type { 附魔数据类型 } from '@/@types/附魔'
import type { 对比结果条目 } from '@/@types/配装指导'
import { 属性类型 } from '@/@types/属性'

const 属性顺序 = [
  属性类型.力道,
  属性类型.身法,
  属性类型.元气,
  属性类型.根骨,
  属性类型.全基础攻击,
  属性类型.外功基础攻击,
  属性类型.内功基础攻击,
  属性类型.武器伤害,
  属性类型.全会心等级,
  属性类型.外功会心等级,
  属性类型.内功会心等级,
  属性类型.全会心效果等级,
  属性类型.外功会心效果等级,
  属性类型.内功会心效果等级,
  属性类型.全破防等级,
  属性类型.外功破防等级,
  属性类型.内功破防等级,
  属性类型.无双等级,
  属性类型.加速等级,
  属性类型.体质,
]
const 类型顺序 = { 精: 0, 挑: 1, 紫: 2, 蓝: 3 }

export const 排序附魔列表 = (
  列表: 附魔数据类型[],
  收益列表?: Pick<对比结果条目, 'id' | 'dpsUp' | '加速不匹配'>[],
): 附魔数据类型[] => {
  const 收益索引 = new Map(收益列表?.map((项) => [项.id, 项]))
  return 列表
    .map((附魔) => ({
      附魔,
      增益: [...附魔.增益集合].sort((a, b) => 属性顺序.indexOf(a.属性) - 属性顺序.indexOf(b.属性)),
    }))
    .sort((a, b) => {
      if (收益索引.size) {
        const a收益 = 收益索引.get(String(a.附魔.id))
        const b收益 = 收益索引.get(String(b.附魔.id))
        const a秒伤 = !a收益 || a收益.加速不匹配 ? -Infinity : a收益.dpsUp
        const b秒伤 = !b收益 || b收益.加速不匹配 ? -Infinity : b收益.dpsUp
        if (a秒伤 !== b秒伤) return b秒伤 - a秒伤
      }
      for (let i = 0; i < Math.min(a.增益.length, b.增益.length); i++) {
        const 属性差 = 属性顺序.indexOf(a.增益[i].属性) - 属性顺序.indexOf(b.增益[i].属性)
        if (属性差) return 属性差
      }
      if (a.增益.length !== b.增益.length) return a.增益.length - b.增益.length
      for (let i = 0; i < a.增益.length; i++) {
        const 数值差 = b.增益[i].值 - a.增益[i].值
        if (数值差) return 数值差
      }
      return 类型顺序[a.附魔.附魔类型] - 类型顺序[b.附魔.附魔类型] || a.附魔.id - b.附魔.id
    })
    .map(({ 附魔 }) => 附魔)
}
