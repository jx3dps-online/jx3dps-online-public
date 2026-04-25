import { 循环技能详情 } from '@/@types/循环'
import { 循环日志数据类型 } from './simulator/type'
import { 每秒郭氏帧 } from '@/数据/常量'

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

  const 结果循环 = Object.keys(res).map((item) => {
    const v = res[item]
    return {
      ...v,
      技能数量: Math.round(v.技能数量),
      技能增益列表: v.技能增益列表?.map((d) => {
        return {
          ...d,
          增益技能数: Math.round(d.增益技能数),
        }
      }),
    }
  })

  return 结果循环
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

export const 根据加速等级获取虚拟加速值 = (加速等级) => {
  const 加速等级枚举 = {
    0: 0,
    1: 206,
    2: 9232,
    3: 19285,
    4: 30158,
    5: 42057,
  }
  return 加速等级枚举[加速等级]
}

export const 判断有无橙武循环数据 = (循环, 大橙武启用) => {
  if (!大橙武启用) {
    return 循环.filter((item) => {
      return !item?.技能序列?.includes('触发橙武')
    })
  } else {
    return 循环
  }
}
