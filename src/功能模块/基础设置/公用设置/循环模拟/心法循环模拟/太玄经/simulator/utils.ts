import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型 } from './type'
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
      case '卦象_水坎':
      case '卦象_山艮':
      case '卦象_火离':
        if (判断奇穴('顺祝')) {
          obj.最大持续时间 = 每秒郭氏帧 * 20
        } else {
          obj.最大持续时间 = 每秒郭氏帧 * 20
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
    if (['起水卦', '起山卦', '起火卦', '起卦']?.includes(技能?.技能名称)) {
      const 秘籍减冷却 = 判断秘籍减冷却(技能?.技能名称, 秘籍)
      let 技能原始CD = (技能.技能CD || 0) - 秘籍减冷却
      if (判断奇穴('堪卜')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 8
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (['奇门飞宫']?.includes(技能?.技能名称)) {
      const 秘籍减冷却 = 判断秘籍减冷却(技能?.技能名称, 秘籍)
      const 技能原始CD = (技能.技能CD || 0) - 秘籍减冷却
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (['纵横三才']?.includes(技能?.技能名称)) {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('踏斗')) {
        技能原始CD = 技能原始CD + 每秒郭氏帧 * 6
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (['返闭惊魂']?.includes(技能?.技能名称)) {
      const 秘籍减冷却 = 判断秘籍减冷却(技能?.技能名称, 秘籍)
      const 技能原始CD = (技能.技能CD || 0) - 秘籍减冷却
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (['天斗旋']?.includes(技能?.技能名称)) {
      let 最大充能层数 = 1
      if (判断奇穴('亘天')) {
        最大充能层数 = 3
      }
      return {
        ...技能,
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
  星运不足: {
    信息: '当前星运不足',
  },
  BUFF错误: {
    信息: '当前没有对应的BUFF',
  },
}

export const 转化buff和增益名称 = (增益名称, buff列表) => {
  return buff列表?.[增益名称]
}
