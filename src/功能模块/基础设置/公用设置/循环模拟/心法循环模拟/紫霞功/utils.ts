import { 循环技能详情 } from '@/@types/循环'
import { 循环日志数据类型, 技能释放记录数据 } from './simulator/type'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from './constant/skill'
import { 技能额外信息分隔符 } from '../通用/通用函数'

export const 转换技能序列 = (节点: string[]) =>
  节点.map((文本) => {
    const 分隔位置 = 文本.indexOf(技能额外信息分隔符)
    const 技能名称 = (分隔位置 < 0 ? 文本 : 文本.slice(0, 分隔位置)).trim()
    const 技能 = 循环模拟技能基础数据.find((数据) => 数据.技能名称 === 技能名称)
    if (!技能) throw new Error(`不支持的技能：${技能名称}`)
    const 额外信息 = 分隔位置 < 0 ? undefined : JSON.parse(文本.slice(分隔位置 + 1))
    if (
      额外信息 !== undefined &&
      (!额外信息 || typeof 额外信息 !== 'object' || Array.isArray(额外信息))
    ) {
      throw new Error('技能额外信息应为对象')
    }
    const 延迟 = 额外信息?.延迟
    if (额外信息?.作用次数 !== undefined && !(技能名称 === '万世不竭' && 额外信息.作用次数 === 5)) {
      throw new Error('本期仅支持完整读条，不支持修改作用次数')
    }
    if (
      延迟 !== undefined &&
      延迟 !== 'GCD' &&
      !(typeof 延迟 === 'number' && Number.isInteger(延迟) && 延迟 >= 0)
    ) {
      throw new Error('技能延迟应为非负整数帧或GCD')
    }
    return { ...技能, 额外信息 }
  })

export const getDpsCycle = (data: 循环日志数据类型[]): 循环技能详情[] => {
  const res: { [key: string]: 循环技能详情 } = {}
  for (let i = 0; i < data.length; i++) {
    const 当前数据 = data[i]
    const 本次造成伤害次数 = 当前数据?.其他数据?.伤害次数 || 1
    const 本次技能等级 = 当前数据?.其他数据?.技能等级 || 1
    const 伤害层数 = 当前数据?.日志?.includes('DOT') ? 当前数据?.其他数据?.技能等级 || 1 : 1
    if (当前数据?.日志类型 === '造成伤害') {
      const 当前日志对应技能枚举 = 获取当前日志对应技能枚举(当前数据?.日志)

      const key = `${当前日志对应技能枚举}_${本次技能等级}`

      let 增益列表 = res[key]?.技能增益列表 || []
      if (!增益列表?.length) {
        if (当前数据?.buff列表?.length) {
          增益列表 = 增益列表.concat([
            {
              增益名称: 当前数据?.buff列表?.join(','),
              增益技能数: 本次造成伤害次数,
            },
          ])
        }
      } else {
        if (当前数据?.buff列表?.length) {
          let 不存在相同增益 = true
          增益列表 = 增益列表.map((item) => {
            const 技能增益列表 = item?.增益名称?.split(',') || []
            if (
              技能增益列表?.length === 当前数据?.buff列表?.length &&
              !技能增益列表?.some((a) => !当前数据?.buff列表?.includes(a))
            ) {
              不存在相同增益 = false
              return {
                增益名称: item.增益名称,
                增益技能数: item.增益技能数 + 本次造成伤害次数,
              }
            } else {
              return {
                ...item,
              }
            }
          })
          if (不存在相同增益) {
            增益列表 = 增益列表.concat({
              增益名称: 当前数据?.buff列表?.join(','),
              增益技能数: 本次造成伤害次数,
            })
          }
        }
      }

      res[key] = {
        ...res[key],
        技能名称: 当前日志对应技能枚举,
        技能等级: 本次技能等级,
        技能数量: (res[key]?.技能数量 || 0) + 本次造成伤害次数,
        技能增益列表: [...增益列表],
        伤害层数,
      }
    }
  }

  return Object.values(res)
}

export const 获取紫气覆盖技能 = (记录: 技能释放记录数据[], 日志: 循环日志数据类型[]) => {
  const 覆盖 = new Map<number, number>()
  for (const 伤害 of 日志) {
    if (伤害.日志类型 !== '造成伤害' || !伤害.buff列表?.includes('紫气东来·3')) continue
    for (let 索引 = 记录.length - 1; 索引 >= 0; 索引--) {
      const 技能 = 记录[索引]
      if (
        技能.技能释放记录结果.实际伤害技能 === 伤害.日志 &&
        (技能.结束读条时间 ?? 技能.实际释放时间) <= (伤害.日志时间 ?? 0)
      ) {
        覆盖.set(索引, (覆盖.get(索引) || 0) + (伤害.其他数据?.伤害次数 ?? 1))
        break
      }
    }
  }
  return 覆盖
}

export const 判断上一个同名技能 = (当前技能, 循环) => {
  // 上一个同名技能
  const 循环副本 = [...循环]
  循环副本.reverse()
  let 剩余CD = 0

  const 上一个同名技能 = 循环副本?.find((item) => {
    if (item?.实际技能) {
      // 用下一个技能可以释放时间判断不是当前技能
      return item?.实际技能 === 当前技能?.实际技能 && item?.下一个技能可以释放时间
    } else {
      const 正常技能判定 = item?.技能名称 === 当前技能?.技能名称 && item?.下一个技能可以释放时间
      // 用下一个技能可以释放时间判断不是当前技能
      return 正常技能判定
    }
  })

  if (上一个同名技能) {
    const 实际CD = 当前技能?.技能CD
    const 上一个同名技能释放时间 = (上一个同名技能?.本技能实际释放时间 || 0) + (实际CD || 0)
    const 下一个技能可以释放时间 = 循环[循环.length - 1]?.下一个技能可以释放时间

    剩余CD =
      上一个同名技能释放时间 - 下一个技能可以释放时间 > 0
        ? 上一个同名技能释放时间 - 下一个技能可以释放时间
        : 0
  }

  return { 上一个同名技能, 剩余CD }
}

export const 获取总用时 = (时间) => {
  const 用时秒 = Math.round((时间 / 每秒郭氏帧) * 100) / 100
  return 用时秒
}

export const 获取显示秒伤 = (最后一条伤害数据) => {
  return Math.round((最后一条伤害数据?.造成总伤害 || 0) / (最后一条伤害数据?.日志时间 / 每秒郭氏帧))
}

// 没表明枚举就直接取原值
export const Skill_Cycle_Map = {}

const 获取当前日志对应技能枚举 = (日志) => {
  return Skill_Cycle_Map[日志] || 日志
}
