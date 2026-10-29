/**
 * 根据团队增益轴数据，判断该时间包含的团队增益数据
 */

import { 团队增益轴类型 } from '@/@types/团队增益'
import { 副本事件实例类型 } from '@/@types/副本事件'

interface 判断团队增益快照BuffProps {
  团队增益轴: 团队增益轴类型
  判定帧: number
}

const 判断团队增益快照Buff = (props: 判断团队增益快照BuffProps) => {
  const 最终包含增益: string[] = []

  const { 判定帧 = 0, 团队增益轴 } = props

  // 先判定号令三军
  const 号令三军数据 = 团队增益轴?.['号令三军']
  const 号令三军释放时间 = 号令三军数据?.[0] || 0

  // 一鼓
  if (判定帧 >= 号令三军释放时间 && 判定帧 < 号令三军释放时间 + 号令三军数据?.持续时间) {
    最终包含增益.push('号令三军_快照_一鼓')
  } else if (
    判定帧 >= 号令三军释放时间 + 号令三军数据?.持续时间 &&
    判定帧 < 号令三军释放时间 + 号令三军数据?.持续时间 + 号令三军数据?.持续时间
  ) {
    最终包含增益.push('号令三军_快照_二鼓')
  }

  // 判定其他增益
  Object.keys(团队增益轴)
    ?.filter((item) => item !== '号令三军' && item !== '弘法')
    ?.forEach((增益名称) => {
      const 增益数据 = 团队增益轴[增益名称]
      const 初次释放时间 = 增益数据?.释放时间点?.[0] || 0
      if (增益数据 && 判定帧 >= 0) {
        const 增益是否包含 = 判断时间点是否在事件内(
          初次释放时间,
          增益数据?.平均间隔,
          增益数据?.持续时间,
          判定帧,
        )
        if (增益是否包含) {
          最终包含增益.push(`${增益名称}_快照`)
        }
      }
    })

  return 最终包含增益
}

const 判断时间点是否在事件内 = (startTime, interval, duration, checkTime) => {
  let n = 0
  // eslint-disable-next-line no-constant-condition
  while (n < 100) {
    const eventStart = startTime + n * interval
    const eventEnd = eventStart + duration
    // 如果当前事件的开始时间超过了检查时间，直接结束循环
    if (eventStart > checkTime) {
      break
    }
    // 检查 checkTime 是否在当前事件的覆盖范围内
    if (eventStart <= checkTime && checkTime < eventEnd) {
      return true
    }
    n++
  }
  return false
}

/**
 * 根据副本事件实例列表，判断该帧命中的团队/副本 buff 列表
 * 配置驱动：遍历每个实例的每个阶段，命中 [T, T+阶段持续) 即输出 阶段.关联Buff
 * 注意：不做去重，叠加时会重复输出同名 buff
 */
export const 判断副本事件快照Buff = (
  事件实例列表: 副本事件实例类型[],
  判定帧: number,
): string[] => {
  const 最终包含增益: string[] = []

  ;(事件实例列表 || []).forEach((实例) => {
    if (!实例?.阶段列表?.length) {
      return
    }
    let 阶段起点 = 实例.释放时间 || 0
    for (let i = 0; i < 实例.阶段列表.length; i++) {
      const 阶段 = 实例.阶段列表[i]
      const 阶段持续 = 阶段?.持续时间 || 0
      if (判定帧 >= 阶段起点 && 判定帧 < 阶段起点 + 阶段持续) {
        if (阶段?.关联Buff) {
          最终包含增益.push(阶段.关联Buff)
        }
        break // 每个实例同一时刻最多命中一个阶段
      }
      阶段起点 = 阶段起点 + 阶段持续
    }
  })

  return 最终包含增益
}

export const 判断团队增益轴快照计算 = (
  循环快照计算列表: string[] | undefined,
  团队增益轴: 团队增益轴类型,
) => {
  if (循环快照计算列表?.length) {
    return 循环快照计算列表?.filter((item) => {
      if (团队增益轴?.[item]) {
        return 团队增益轴?.[item]?.是否启用快照
      } else {
        return true
      }
    })
  } else {
    return []
  }
}

export default 判断团队增益快照Buff
