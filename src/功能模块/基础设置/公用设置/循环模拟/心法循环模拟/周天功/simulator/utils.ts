import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型, DotDTO } from './type'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 判断秘籍减冷却 } from '../../通用/通用函数'

export const 根据奇穴修改buff数据 = (奇穴: string[]) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    switch (key) {
      case '贯穿':
        if (判断奇穴('桑柘')) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 5
          ;(obj as DotDTO).最大持续时间 = 40
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 4
          ;(obj as DotDTO).最大持续时间 = 32
        }
        break
      default:
        break
    }
    res[key] = obj
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
    if (技能?.技能名称 === '引窍') {
      return {
        ...技能,
      }
    } else if (技能?.技能名称 === '风流云散') {
      let 技能原始CD = 技能.技能CD || 0
      let 最大充能层数 = 技能.最大充能层数 || 1

      if (判断奇穴('出岫')) {
        技能原始CD = 每秒郭氏帧 * 18 - 每秒郭氏帧 * 4
        最大充能层数 = 2
      }

      return {
        ...技能,
        技能CD: 技能原始CD,
        最大充能层数,
      }
    } else if (技能?.技能名称 === '破穴') {
      let 最大充能层数 = 技能.最大充能层数 || 1

      if (判断奇穴('蛰微')) {
        最大充能层数 = 2
      }

      return {
        ...技能,
        最大充能层数,
      }
    } else if (技能?.技能名称 === '劈风令') {
      return 判断奇穴('摧烟')
        ? {
            ...技能,
            最大充能层数: 3,
          }
        : 技能
    } else if (技能?.技能名称 === '抟风令') {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('清激')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 10
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (技能?.技能名称 === '抟风令断') {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('清激')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 10
      }
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
