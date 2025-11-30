import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { DotDTO, 循环基础技能数据类型 } from './type'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 判断秘籍减冷却 } from '../../通用/通用函数'

export const 根据奇穴修改buff数据 = (奇穴: string[], 秘籍: 选中秘籍信息) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    switch (key) {
      case '扬威':
        (obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 15
        if (判断奇穴('神威穿彻')) {
          (obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 10
        }
        break
      default:
        break
    }
    res[key] = obj
  })

  return res
}

export const 根据奇穴秘籍修改技能数据 = (奇穴: string[], 秘籍: 选中秘籍信息): 循环基础技能数据类型[] => {
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  const res: 循环基础技能数据类型[] = 循环模拟技能基础数据.map((技能) => {
    if (技能?.技能名称 === '孔雀翎') {
      const 秘籍减冷却 = 判断秘籍减冷却(技能?.技能名称, 秘籍)
      return {
        ...技能,
        技能CD: (技能.技能CD || 0) - 秘籍减冷却,
      }
    } else if (技能?.技能名称 === '鬼斧神工') {
      const 奇穴减少冷却 = 判断奇穴('神威穿彻') ? 每秒郭氏帧 * 40 : 0
      let 技能原始CD = 技能.技能CD || 0
      技能原始CD = 技能原始CD - 奇穴减少冷却
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
  千机变不存在: {
    信息: '千机变不存在',
  },
  连弩或重弩不存在: {
    信息: '连弩或重弩不存在，请设置起手机关存在或施放千机变',
  }
}

export const 转化buff和增益名称 = (增益名称, buff列表) => {
  return buff列表?.[增益名称]
}
