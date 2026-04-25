/* eslint-disable no-extra-semi */
// import { 每秒郭氏帧 } from '@/数据/常量'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型, DotDTO } from './type'

export const 根据奇穴修改buff数据 = (奇穴: string[]) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    switch (key) {
      case '振翅图南_0':
      case '振翅图南_1':
      case '振翅图南_2':
      case '振翅图南_3':
      case '振翅图南_4':
        if (判断奇穴('驰行')) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 20
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 10
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 12
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 6
        }
        break
      case '翼绝云天':
        if (判断奇穴('天行')) {
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 8
          ;(obj as DotDTO).伤害频率 = 每秒郭氏帧 * 2
        } else {
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 16
          ;(obj as DotDTO).伤害频率 = 每秒郭氏帧 * 4
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
    if (技能?.技能名称 === '振翅图南') {
      let 技能CD = 判断奇穴('驾鸾') ? 每秒郭氏帧 * 25 : 每秒郭氏帧 * 20
      const 技能充能层数 = 判断奇穴('驾鸾') ? 2 : 技能.最大充能层数 || 1
      if (判断奇穴('梦悠')) {
        技能CD = 技能CD - 每秒郭氏帧 * 4
      }
      return {
        ...技能,
        最大充能层数: 技能充能层数,
        技能CD: 技能CD,
      }
    } else if (技能?.技能名称 === '浮游天地') {
      let 技能CD = 技能.技能CD || 0
      let 最大充能层数 = 技能.最大充能层数 || 1
      if (判断奇穴('藏锋')) {
        技能CD = 每秒郭氏帧 * 20
        最大充能层数 = 2
      }
      return {
        ...技能,
        技能CD,
        最大充能层数,
      }
    } else if (技能?.技能名称 === '跃潮斩波') {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('潮音')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 3
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (技能?.技能名称 === '翼绝云天') {
      let 技能原始CD = 技能.技能CD || 0
      let 最大充能层数 = 技能.最大充能层数 || 0
      if (判断奇穴('天行')) {
        技能原始CD = 技能原始CD + 每秒郭氏帧 * 30
        最大充能层数 = 2
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
        最大充能层数,
      }
    } else if (技能?.技能名称 === '溟海御波') {
      const 技能原始CD = 技能.技能CD || 0
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else {
      return 技能
    }
  })

  return res
}

export const ERROR_ACTION = {
  体态错误: {
    信息: '当前体态错误',
  },
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
