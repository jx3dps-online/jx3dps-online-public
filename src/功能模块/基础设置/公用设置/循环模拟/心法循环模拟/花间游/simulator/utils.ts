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
    const obj = { ...原始Buff数据[key] }

    const 商阳指秘籍多一跳 = 秘籍?.['商阳指']?.some((a) => a?.includes('持续时间'))
    const 兰摧玉折秘籍多一跳 = 秘籍?.['兰摧玉折']?.some((a) => a?.includes('持续时间'))
    const 钟林毓秀秘籍多一跳 = 秘籍?.['钟林毓秀']?.some((a) => a?.includes('持续时间'))
    switch (key) {
      case 'DOT_商阳指':
        if (商阳指秘籍多一跳) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 7
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 21
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 6
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 18
        }
        break
      case 'DOT_钟林毓秀':
        if (钟林毓秀秘籍多一跳) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 7
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 21
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 6
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 18
        }
        break
      case 'DOT_兰摧玉折':
        if (兰摧玉折秘籍多一跳) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 7
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 21
        } else {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(obj as DotDTO).最大作用次数 = 6
          ;(obj as DotDTO).最大持续时间 = 每秒郭氏帧 * 18
        }
        break
      case '乱洒青荷':
        if (判断奇穴('渲青')) {
          obj.最大层数 = 2
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
    if (技能?.技能名称 === '兰摧玉折') {
      const 秘籍减冷却 = 判断秘籍减冷却(技能?.技能名称, 秘籍)
      let 技能原始CD = (技能.技能CD || 0) - 秘籍减冷却
      if (判断奇穴('清流')) {
        技能原始CD = 技能原始CD - 每秒郭氏帧 * 4
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
      }
    } else if (技能?.技能名称 === '快雪时晴') {
      let 技能原始CD = 技能.技能CD || 0
      let 最大充能层数 = 技能.最大充能层数 || 1
      let 可中断倒读条最大跳数 = 技能.可中断倒读条最大跳数 || undefined
      if (判断奇穴('丹鼎')) {
        技能原始CD = 每秒郭氏帧 * 20
        最大充能层数 = 2
        可中断倒读条最大跳数 = undefined
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
        最大充能层数,
        可中断倒读条最大跳数,
      }
    } else if (技能?.技能名称 === '水月无间') {
      let 技能原始CD = 技能.技能CD || 0
      let 最大充能层数 = 技能.最大充能层数 || 1
      if (判断奇穴('活络')) {
        技能原始CD = 每秒郭氏帧 * 50
        最大充能层数 = 2
      }
      return {
        ...技能,
        技能CD: 技能原始CD,
        最大充能层数,
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
