import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型, DotDTO } from './type'
import { 判断秘籍减冷却 } from '../../通用/通用函数'
import { 选中秘籍信息 } from '@/@types/秘籍'

export const 根据奇穴修改buff数据 = (奇穴: string[]) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    switch (key) {
      case '苍棘缚地':
        if (判断奇穴('连茹')) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 12 + 每秒郭氏帧 * 2 + 8
          // 攻击结束到草消失大概还有2秒的时间
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 8 + 每秒郭氏帧 * 2 + 8
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
    if (技能?.技能名称 === '剑破虚空') {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('明空')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 6
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (技能?.技能名称 === '心鼓弦' && 判断奇穴('化冰')) {
      return {
        ...技能,
        技能CD: 每秒郭氏帧 * 30,
      }
    } else if (技能?.技能名称 === '剑气长江') {
      const 秘籍减冷却 = 判断秘籍减冷却(技能?.技能名称, 秘籍)
      let 技能原始CD = 技能.技能CD || 0
      技能原始CD = 技能原始CD - 秘籍减冷却
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
  const 仙姿名称映射 = {
    '仙姿·剑破': '仙姿剑破',
    '仙姿·玳弦': '仙姿玳弦',
    '仙姿·剑气': '仙姿剑气',
    '仙姿·剑影': '仙姿剑影',
  }
  return buff列表?.[仙姿名称映射[增益名称] || 增益名称]
}
