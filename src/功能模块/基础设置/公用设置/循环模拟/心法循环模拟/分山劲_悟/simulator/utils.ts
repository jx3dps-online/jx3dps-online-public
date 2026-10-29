import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型 } from './type'
import { 选中秘籍信息 } from '@/@types/秘籍'

export const 根据奇穴秘籍修改buff数据 = (奇穴: string[]) => {
  const res = {}
  const 判断奇穴 = (val) => {
    return 奇穴?.includes(val)
  }

  Object.keys(原始Buff数据).forEach((key) => {
    const obj = 原始Buff数据[key]

    switch (key) {
      case '血怒·悟':
        // Buff.tab 71320=288帧(18秒)；碎甲·悟(71321)=400帧(25秒)
        obj.最大持续时间 = 每秒郭氏帧 * (判断奇穴('碎甲·悟') ? 25 : 18)
        break

      case '流血':
        // 血狱·悟：流血最多可叠加3层
        obj.最大层数 = 判断奇穴('血狱·悟') ? 3 : 1
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
  const res: 循环基础技能数据类型[] = 循环模拟技能基础数据.map((技能) => {
    // 盾飞秘籍「调息增加5秒并清除刀系调息」(17254)：调息时间增加5秒（recipeSkill CoolDownAdd2=80帧）
    if (技能?.技能名称 === '盾飞·悟' && 秘籍?.['盾飞·悟']?.includes('【绝篇】重置调息')) {
      return {
        ...技能,
        技能CD: (技能.技能CD || 0) + 每秒郭氏帧 * 5,
      }
    }
    return 技能
  })

  return res
}

export const ERROR_ACTION = {
  BUFF错误: {
    信息: '当前没有对应的BUFF',
  },
  盾飞持续中: {
    信息: '盾飞·悟持续期间无法释放盾刀（傍身招式已替换为劫刀）',
  },
  无盾飞: {
    信息: '未处于盾飞·悟持续期间，无法释放劫刀（傍身招式为盾刀）',
  },
}
