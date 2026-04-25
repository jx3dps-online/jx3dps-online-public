import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { DotDTO, 循环基础技能数据类型 } from './type'
import { 基础GCD帧 } from '../constant'

export const 根据奇穴修改buff数据 = (奇穴: string[]) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    let 苍棘缚地最大持续时间 = 每秒郭氏帧 * 8 + 每秒郭氏帧 * 2 + 8
    switch (key) {
      case '苍棘缚地':
        //  if (判断奇穴('连茹')) {
        //    苍棘缚地最大持续时间 += 每秒郭氏帧 * 4
        //  }
        if (判断奇穴('灵荆')) {
          苍棘缚地最大持续时间 += 每秒郭氏帧 * 4
        }
        obj.最大持续时间 = 苍棘缚地最大持续时间
        break
      case '逆乱':
        if (判断奇穴('疾根')) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 9
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 18
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 8
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 16
        }
        break
      default:
        break
    }
    res[key] = obj
  })

  return res
}

export const 根据奇穴秘籍修改技能数据 = (奇穴: string[]): 循环基础技能数据类型[] => {
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  const res: 循环基础技能数据类型[] = 循环模拟技能基础数据.map((技能) => {
    if (技能?.技能名称 === '紫叶沉疴') {
      let 技能原始CD = 技能.技能CD || 0
      let 技能GCD组 = 技能.技能GCD组 || '公共'
      if (判断奇穴('紫伏')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 4
      }
      //if (判断奇穴('渌波')) {
      //技能GCD组 = '自身'
      //}
      return {
        ...技能,
        技能CD: 技能原始CD,
        技能GCD组: 技能GCD组,
      }
    } else if (技能?.技能名称 === '银光照雪') {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('逆势')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 4
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (技能?.技能名称 === '川乌射罔') {
      let 最大充能层数 = 技能.最大充能层数 || 1
      let 技能原始CD = 技能.技能CD || 0

      if (判断奇穴('凄骨')) {
        最大充能层数 = 2
        技能原始CD = 每秒郭氏帧 * 8
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
        最大充能层数: 最大充能层数,
      }
    } else {
      return 技能
    }
  })

  return res
}

export const ERROR_ACTION = {
  充能不足: {
    信息: '当前技能没有可释放层数',
  },
  BUFF错误: {
    信息: '当前没有对应的BUFF',
  },
}

export const 转化buff和增益名称 = (增益名称, buff列表) => {
  return buff列表?.[增益名称]
}
