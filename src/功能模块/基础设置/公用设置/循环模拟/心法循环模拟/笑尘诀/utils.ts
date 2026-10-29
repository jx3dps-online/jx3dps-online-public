import { 循环日志数据类型 } from './simulator/type'
import { 循环技能详情 } from '@/@types/循环'
import 循环模拟技能基础数据 from './constant/skill'
import { 获取实际技能数据 } from '../通用/通用函数'

export const 转换技能序列 = (节点: string[]) =>
  节点.map((文本) => {
    const { 实际技能名称, 额外信息 } = 获取实际技能数据(文本.trim())
    const 技能 = 循环模拟技能基础数据.find((数据) => 数据.技能名称 === 实际技能名称)
    if (!技能) throw new Error(`不支持的技能：${实际技能名称}`)
    return { ...技能, 额外信息: 额外信息 || undefined }
  })

export const getDpsCycle = (data: 循环日志数据类型[], 战斗时间?): 循环技能详情[] => {
  const res: { [key: string]: 循环技能详情 } = {}
  for (let i = 0; i < data.length; i++) {
    const 当前数据 = data[i]
    const 本次造成伤害次数 = 当前数据?.其他数据?.伤害次数 || 1
    const 本次技能等级 = 当前数据?.其他数据?.技能等级 || 1
    if (当前数据?.日志类型 === '造成伤害') {
      const 当前日志对应技能枚举 = 当前数据.日志
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
      }
    }
  }

  let 结果循环 = Object.keys(res).map((item) => {
    const v = res[item]
    if (v.技能名称 === '龙战于野·神兵') return v
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
