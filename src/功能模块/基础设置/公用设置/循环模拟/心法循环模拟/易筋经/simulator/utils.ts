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
      case '横扫六合DOT':
        if (判断奇穴('我闻')) {
          ;(obj as DotDTO).最大层数 = 2
        } else {
          ;(obj as DotDTO).最大层数 = 1
        }
        if (obj.最大持续时间) {
          obj.最大持续时间 = 每秒郭氏帧 * 12 + 秘籍加持续时间('横扫六合', 秘籍)
          ;(obj as DotDTO).最大作用次数 = 9
        }
        break
      case '擒龙':
        if (判断奇穴('系珠')) {
          obj.最大持续时间 = 每秒郭氏帧 * 12
        } else {
          obj.最大持续时间 = 每秒郭氏帧 * 15
        }
        if (判断奇穴('众嗔')) {
          obj.最大持续时间 = obj.最大持续时间 - 每秒郭氏帧 * 6
        }
        if (obj.最大持续时间) {
          obj.最大持续时间 = obj.最大持续时间 + 秘籍加持续时间('擒龙决', 秘籍)
        }
        break
      case '正念':
        if (判断奇穴('系珠')) {
          obj.最大持续时间 = 每秒郭氏帧 * 12
        } else {
          obj.最大持续时间 = 每秒郭氏帧 * 15
        }
        if (obj.最大持续时间) {
          obj.最大持续时间 = obj.最大持续时间 + 秘籍加持续时间('擒龙决', 秘籍)
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
    if (技能?.技能名称 === '横扫六合') {
      let 技能原始CD = 技能.技能CD || 0
      if (判断奇穴('无诤')) {
        技能原始CD = 每秒郭氏帧 * 17
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (技能?.技能名称 === '捕风式') {
      const 技能原始CD = 技能.技能CD || 0
      const 秘籍减少CD = 判断秘籍减冷却('捕风式', 秘籍)
      return {
        ...技能,
        技能CD: 技能原始CD - 秘籍减少CD,
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
  无法释放拿云式: {
    信息: '当前未达到拿云式释放条件',
  },
}

export const 转化buff和增益名称 = (增益名称, buff列表, 判定增益层数) => {
  if (判定增益层数) {
    return buff列表?.[增益名称]?.当前层数 === +判定增益层数 ? buff列表?.[增益名称] : undefined
  } else {
    return buff列表?.[增益名称]
  }
}
