import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { DotDTO, 循环基础技能数据类型 } from './type'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 判断秘籍减冷却 } from '../../通用/通用函数'
import { read } from 'fs'

export const 根据奇穴秘籍修改buff数据 = (
  奇穴: string[],
  秘籍信息: 选中秘籍信息,
  // 加速值: number,
) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]
    let 血怒总持续时间延长: number = 0
    let 盾飞总持续时间延长: number = 0

    switch (key) {
      case '血怒':
        if (秘籍信息?.['血怒']?.length) {
          for (let i = 0; i < 秘籍信息['血怒'].length; i++) {
            if (秘籍信息['血怒'][i]?.includes('持续')) {
              血怒总持续时间延长 += 1
            }
          }
        }
        // 点出愤恨奇穴时，血怒持续时间增加至25秒，否则是10秒
        obj.最大持续时间 =
          每秒郭氏帧 * (判断奇穴('愤恨') ? 25 + 血怒总持续时间延长 : 10 + 血怒总持续时间延长)
        break

      case '血怒_惊涌':
        if (秘籍信息?.['血怒']?.length) {
          for (let i = 0; i < 秘籍信息['血怒'].length; i++) {
            if (秘籍信息['血怒'][i]?.includes('持续')) {
              血怒总持续时间延长 += 1
            }
          }
        }
        if (秘籍信息?.['血怒']) {
          obj.最大持续时间 = 每秒郭氏帧 * (10 + 血怒总持续时间延长)
        } else {
          obj.最大持续时间 = 每秒郭氏帧 * 10
        }
        break

      case '盾飞':
        if (秘籍信息?.['盾飞']?.length) {
          for (let i = 0; i < 秘籍信息['盾飞'].length; i++) {
            if (秘籍信息['盾飞'][i]?.includes('持续')) {
              盾飞总持续时间延长 += 5
            }
          }
        }
        if (秘籍信息?.['盾飞']) {
          obj.最大持续时间 = 每秒郭氏帧 * (15 + 盾飞总持续时间延长)
        } else {
          obj.最大持续时间 = 每秒郭氏帧 * 15
        }
        break

      case '流血':
        // 点出登锋后，流血间隔缩短
        if (obj.最大持续时间 && (obj as DotDTO).最大作用次数) {
          let 最大作用次数 = 13
          let 伤害频率 = 32

          if (判断奇穴('登锋')) {
            最大作用次数 = 最大作用次数 + 13
            伤害频率 = 16
          }
          ;(obj as DotDTO).最大作用次数 = 最大作用次数
          ;(obj as DotDTO).伤害频率 = 伤害频率
        }
        // 点出崩血后，流血可叠加3层
        obj.最大层数 = 判断奇穴('崩血') ? 3 : 1
        break

      default:
        break
      //
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
    if (技能?.技能名称 === '盾舞') {
      let 秘籍延长跳数 = 0
      let 原可中断倒读条最大跳数 = 10
      const 盾舞秘籍 = 秘籍?.['盾舞'] || []
      for (let i = 0; i < 盾舞秘籍?.length; i++) {
        if (盾舞秘籍[i]?.includes('持续')) {
          // 根据描述，每本秘籍应该增加1秒或2秒，即16帧或32帧
          if (盾舞秘籍[i]?.includes('1秒')) {
            秘籍延长跳数 += 2 // 1秒 = 16帧
          } else if (盾舞秘籍[i]?.includes('2秒')) {
            秘籍延长跳数 += 4 // 2秒 = 32帧
          }
        }
      }
      return {
        ...技能,
        可中断倒读条最大跳数: 原可中断倒读条最大跳数 + 秘籍延长跳数,
      }
      // 援戈降低盾击CD
    } else if (技能?.技能名称 === '盾击') {
      let 技能CD = 每秒郭氏帧 * 4
      if (判断奇穴('援戈')) {
        技能CD = 0
      }
      return {
        ...技能,
        技能CD: 技能CD,
      }
    } else {
      return 技能
    }
  })

  return res
}

export const ERROR_ACTION = {
  怒气不足: {
    信息: '当前怒气不足，无法释放该技能',
  },
  体态错误: {
    信息: '当前体态无法释放该技能',
  },
  BUFF错误: {
    信息: '当前没有对应的BUFF',
  },
}

// export const 起手识破BUFF = (Buff和Dot数据) => {
//   return {
//     识破: {
//       ...Buff和Dot数据['识破'],
//       当前层数: 1,
//       刷新时间: 0,
//     },
//   }
// }
