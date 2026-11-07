import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { Buff枚举, 循环基础技能数据类型, DotDTO, 角色状态信息类型 } from './type'
import { 判断秘籍减冷却 } from '../../通用/通用函数'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 大扇子P2动作时刻, 大扇子P2分支技能 } from '../constant/大扇子'

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

export const 获取大扇子技能限制 = (
  技能: 循环基础技能数据类型,
  自身Buff: Buff枚举,
  当前时间: number,
  角色状态: 角色状态信息类型,
) => {
  if (技能.技能名称 === '换行') return ''
  const P1 = 自身Buff.大扇子
  const P2 = 自身Buff['大扇子·P2']
  const P1生效 = !!P1?.当前层数 && 当前时间 < P1.刷新时间! + P1.最大持续时间!
  const P2生效 = !!P2?.当前层数 && 当前时间 < P2.刷新时间! + P2.最大持续时间!
  if (技能.技能名称 === '使用大扇子') {
    return P1生效 || P2生效 ? '当前已处于大扇子状态，请先退出' : ''
  }
  if (!P1生效 && !P2生效) {
    return 技能.技能类型 === '大扇子' ? '请先使用大扇子' : ''
  }
  if (技能.技能类型 !== '大扇子') return '大扇子期间不能使用其他套路技能，请先退出大扇子'
  if (技能.技能名称 === '退出大扇子') return ''
  if (P2生效) {
    if (技能.大扇子阶段 !== 'P2') return '当前为大扇子P2，不能使用P1技能'
    const 分支技能 = 大扇子P2分支技能[角色状态.大扇子分支!]
    if (!分支技能) return '25分支QTE顺序资料待补，请退出大扇子'
    const 已完成次数 = 角色状态.大扇子P2技能序列.length
    if (已完成次数 >= 4) return 'P2四次QTE已完成，请退出大扇子'
    if (技能.技能名称 !== 分支技能[已完成次数]) {
      return `当前QTE只能施展${分支技能[已完成次数]}`
    }
    if (当前时间 > P2.刷新时间! + 大扇子P2动作时刻[已完成次数]) {
      return '已错过当前P2动作的固定判定时刻'
    }
    return ''
  }
  if (技能.大扇子阶段 === 'P2') return '请先使用绫罗红波(5)进入P2'
  if (技能.技能名称 === '绫罗红波' && 当前时间 > P1.刷新时间! + 11 * 每秒郭氏帧) {
    return '绫罗红波(5)固定在使用大扇子后第11秒施展，前置动作已超过判定时刻'
  }
  if (技能.技能名称 === '绫罗红波' && !角色状态.大扇子前一个技能) {
    return '请先施展倾(2)、拧(3)或仰(4)，再使用绫罗红波(5)判定'
  }
  return ''
}
