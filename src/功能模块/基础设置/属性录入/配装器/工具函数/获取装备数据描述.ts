import {
  副本精简特效枚举,
  装备属性信息模型,
  装备特效枚举,
  装备类型枚举,
  试炼之地特效枚举,
} from '@/@types/装备'
import { 属性类型 } from '@/@types/属性'

export const 获取装备数据描述 = (data: 装备属性信息模型, 携带描述 = true, 携带增益 = true) => {
  const { 装备增益, 装备类型, 装备特效 } = data
  const strList: string[] = []
  if (携带描述) {
    if ([装备类型枚举.特效武器].includes(装备类型) || 装备特效 === '门派特效武器') {
      strList.push('特效')
    }
    if ([装备类型枚举.PVX].includes(装备类型)) {
      strList.push('PVX')
    }
    if (
      data?.装备特效 === 装备特效枚举.风特效腰坠 ||
      (装备特效 && 副本精简特效枚举?.[装备特效]) ||
      (装备特效 && 试炼之地特效枚举?.[装备特效])
    ) {
      strList.push('特效')
    } else if ([装备类型枚举.副本精简, 装备类型枚举.试炼精简].includes(装备类型)) {
      strList.push('精简')
    }
  }
  if (携带增益) {
    装备增益.forEach((item) => {
      switch (item.属性) {
        case 属性类型.全会心等级:
        case 属性类型.外功会心等级:
        case 属性类型.内功会心等级:
          strList.push('会心')
          break
        case 属性类型.全会心效果等级:
        case 属性类型.外功会心效果等级:
        case 属性类型.内功会心效果等级:
          strList.push('会效')
          break
        case 属性类型.全破防等级:
        case 属性类型.外功破防等级:
        case 属性类型.内功破防等级:
          strList.push('破防')
          break
        case 属性类型.无双等级:
          strList.push('无双')
          break
        case 属性类型.全能等级:
          strList.push('全能')
          break
        case 属性类型.加速等级:
          strList.push('加速')
          break
      }
    })
  }

  return strList
}
