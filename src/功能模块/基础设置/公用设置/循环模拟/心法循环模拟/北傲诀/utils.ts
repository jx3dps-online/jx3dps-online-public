import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环日志数据类型 } from './simulator/type'
// import { 属性系数 } from '@/数据/常量'
import { 循环技能详情 } from '@/@types/循环'

export const getDpsCycle = (
  data: 循环日志数据类型[],
  战斗时间?,
  大橙武模拟 = false,
): 循环技能详情[] => {
  const res: { [key: string]: 循环技能详情 } = {}
  const 上将军印增益分布 = new Map<string, { 名称: string[]; 次数: number }>()
  let 上将军印总次数 = 0
  for (let i = 0; i < data.length; i++) {
    const 当前数据 = data[i]
    const 本次造成伤害次数 = 当前数据?.其他数据?.伤害次数 || 1
    const 本次技能等级 = 当前数据?.其他数据?.技能等级 || 1
    const 本次伤害层数 = 当前数据?.其他数据?.伤害层数 || 1
    if (当前数据?.日志类型 === '造成伤害') {
      if (
        大橙武模拟 &&
        (当前数据.日志 === '上将军印' || 当前数据.日志.startsWith('上将军印·连续'))
      ) {
        const 增益名称列表 = 当前数据.buff列表 || []
        const 增益键 = [...增益名称列表].sort().join(',')
        const 当前分布 = 上将军印增益分布.get(增益键)
        上将军印增益分布.set(增益键, {
          名称: 增益名称列表,
          次数: (当前分布?.次数 || 0) + 本次造成伤害次数,
        })
        上将军印总次数 += 本次造成伤害次数
      }
      const 当前日志对应技能枚举 = Skill_Cycle_Map[当前数据?.日志] || 当前数据?.日志
      const key = `${当前日志对应技能枚举}_${本次技能等级}_${本次伤害层数}`
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
          const 当前增益名称 = [...当前数据.buff列表].sort().join(',')
          增益列表 = 增益列表.map((item) => {
            const 技能增益列表 = item?.增益名称?.split(',') || []
            if (技能增益列表.sort().join(',') === 当前增益名称) {
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
        伤害层数: 本次伤害层数,
        技能数量: (res[key]?.技能数量 || 0) + 本次造成伤害次数,
        技能增益列表: [...增益列表],
      }
    }
  }

  const 上将军印神兵次数 = Math.floor((上将军印总次数 * 102) / 1024)
  if (大橙武模拟 && 上将军印神兵次数 > 0) {
    const 增益列表 = [...上将军印增益分布.values()].map((分布) => ({
      增益名称: 分布.名称.join(','),
      增益技能数: (分布.次数 / 上将军印总次数) * 上将军印神兵次数,
    }))
    res['上将军印·神兵_1'] = {
      技能名称: '上将军印·神兵',
      技能等级: 1,
      技能数量: 上将军印神兵次数,
      技能增益列表: 增益列表,
    }
  }

  let 结果循环 = Object.keys(res).map((item) => {
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
