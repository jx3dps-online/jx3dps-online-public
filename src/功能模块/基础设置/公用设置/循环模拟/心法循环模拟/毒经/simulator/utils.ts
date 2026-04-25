import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型, DotDTO } from './type'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 判断秘籍减冷却, 秘籍加持续时间 } from '../../通用/通用函数'

export const 根据奇穴修改buff数据 = (奇穴: string[], 秘籍?: 选中秘籍信息) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    switch (key) {
      case '蛇影DOT':
        if (obj.最大持续时间 && (obj as DotDTO).最大作用次数) {
          let 最大持续时间 = 每秒郭氏帧 * 12
          let 最大作用次数 = 6
          最大持续时间 = 最大持续时间 + (秘籍?.['蛇影']?.includes('加一跳') ? 每秒郭氏帧 * 2 : 0)
          最大作用次数 = 最大作用次数 + (秘籍?.['蛇影']?.includes('加一跳') ? 1 : 0)
          if (判断奇穴('蛇悉')) {
            最大持续时间 = 最大持续时间 + 每秒郭氏帧 * 4
            最大作用次数 = 最大作用次数 + 2
          }
          ;(obj as DotDTO).最大持续时间 = 最大持续时间
          ;(obj as DotDTO).最大作用次数 = 最大作用次数
        }
        break
      case '蟾啸DOT':
        if (obj.最大持续时间 && (obj as DotDTO).最大作用次数) {
          const 最大持续时间 = 每秒郭氏帧 * 14
          const 最大作用次数 = 7
          ;(obj as DotDTO).最大持续时间 = 最大持续时间
          ;(obj as DotDTO).最大作用次数 = 最大作用次数
        }
        break
      case '百足DOT':
        if (obj.最大持续时间 && (obj as DotDTO).最大作用次数) {
          const 最大作用次数 = 9
          const 伤害频率 = 32
          ;(obj as DotDTO).最大作用次数 = 最大作用次数
          ;(obj as DotDTO).伤害频率 = 伤害频率
        }
        break
      default:
        break
    }
    res[key] = JSON.parse(JSON.stringify(obj))
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
    if (技能?.技能名称 === '蝎心') {
      let 读条时间 = 技能.读条时间 || 0
      if (秘籍?.['蝎心']?.includes('减读条_0.125_1')) {
        读条时间 = 读条时间 - 每秒郭氏帧 * 0.125
      }
      if (秘籍?.['蝎心']?.includes('减读条_0.125_2')) {
        读条时间 = 读条时间 - 每秒郭氏帧 * 0.125
      }
      return {
        ...技能,
        读条时间: 读条时间,
      }
    } else if (技能?.技能名称 === '蛇影') {
      if (判断奇穴('蛇悉')) {
        return {
          ...技能,
          技能CD: 每秒郭氏帧 * 6,
        }
      }
      return 技能
    } else if (技能?.技能名称 === '百足') {
      const 技能原始CD = 技能.技能CD || 0
      const 秘籍减少CD = 判断秘籍减冷却('百足', 秘籍)
      return {
        ...技能,
        技能CD: 技能原始CD - 秘籍减少CD,
      }
    } else if (技能?.技能名称 === '千丝') {
      const 技能原始CD = 技能.技能CD || 0
      // console.log(秘籍, 技能原始CD)
      const 秘籍减少CD = 判断秘籍减冷却('千丝', 秘籍)
      const 奇穴减少CD = 判断奇穴('蛛魄') ? 每秒郭氏帧 * -7 : 0
      return {
        ...技能,
        技能CD: 技能原始CD - 秘籍减少CD - 奇穴减少CD,
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
  缴械无法释放: {
    信息: '处于缴械状态无法释放',
  },
}

export const 转化buff和增益名称 = (增益名称, buff列表, 判定增益层数) => {
  if (判定增益层数) {
    return buff列表?.[增益名称]?.当前层数 === +判定增益层数 ? buff列表?.[增益名称] : undefined
  } else {
    return buff列表?.[增益名称]
  }
}
