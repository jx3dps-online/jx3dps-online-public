import useCycle from '@/hooks/use-cycle'
import type { RootState } from '@/store/index'

import { 选中秘籍信息 } from '@/@types/秘籍'
import { 属性加成 } from '@/@types/属性'
import { 增益选项数据类型 } from '@/@types/团队增益'
import { 装备信息数据类型 } from '@/@types/装备'
import { 循环技能详情, 循环详情 } from '@/@types/循环'
import { 当前计算结果类型 } from '@/@types/输出'
import { 技能基础数据模型 } from '@/@types/技能'
import { 更新当前计算结果 } from '@/store/data'
import { INT } from '@/工具函数/help'
import { 判断团队增益轴快照计算 } from '@/数据/团队增益/tools'

import { 获取计算目标信息 } from './统一工具函数/工具函数'
import { 获取判断增益后技能系数 } from './统一工具函数/技能增益启用计算'
import { 根据循环判断快照计算列表 } from './统一工具函数/增益计算函数'
import { 获取心法排除技能增益 } from './职业特殊处理/技能增益排除'
import 循环秒伤计算 from './循环秒伤计算'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 获取当前心法名 } from '@/数据/数据工具/获取当前数据'

interface CurrentDpsFunctionProps {
  是否更新显示计算结果?: boolean // 是否更新当前dps结果

  更新装备信息?: 装备信息数据类型 // 传入的需要更新的装备信息
  更新增益数据?: 增益选项数据类型 // 传入的需要更新的团队增益数据
  更新默认增益集合?: 属性加成[] // 用于增益计算
  是否郭氏计算?: boolean // 是否郭氏计算
  更新计算循环名称?: string // 更新循环名称
  更新奇穴数据?: string[] // 更新奇穴数据
  更新秘籍信息?: 选中秘籍信息
  更新增益启用?: boolean
  更新快照计算?: string[]
  更新网络延迟?: number // 是否传入网络延迟计算

  // 用于模拟器计算
  更新计算循环详情?: 循环详情
  更新循环技能列表?: 循环技能详情[]
  更新计算时间?: number

  // 是否计算技能详细情况
  计算技能详情?: boolean
}

/** 配装器在目标编辑等场景下临时覆盖循环、奇穴、秘籍的计算参数 */
export type 计算循环覆盖类型 = Pick<
  CurrentDpsFunctionProps,
  '更新计算循环名称' | '更新奇穴数据' | '更新秘籍信息'
>

export const 秒伤计算 =
  (props?: CurrentDpsFunctionProps) =>
  (dispatch, getState): 当前计算结果类型 => {
    const {
      是否更新显示计算结果 = false,
      是否郭氏计算 = true,
      更新计算时间,
      更新循环技能列表,
      计算技能详情 = true,
    } = props || {}

    const 基础 = 获取秒伤计算基础(dispatch, getState, props)

    const 当前循环技能列表 = 更新循环技能列表 ?? 基础.实际计算循环详情?.技能详情

    if (!当前循环技能列表?.length || !基础.当前装备信息?.装备基础属性?.基础攻击) {
      const 计算结果 = { 总伤: 0, 秒伤: 0, 秒伤计算时间: 0, 计算结果技能列表: [] }
      if (是否更新显示计算结果) {
        dispatch?.(更新当前计算结果(计算结果))
      }
      return 计算结果
    }

    const 战斗时间 = 更新计算时间 || 基础.实际计算循环详情?.战斗时间 || 0

    // dps结果计算
    const { 总伤, 计算结果技能列表 } = 循环秒伤计算({
      计算循环: 当前循环技能列表,
      心法名称: 基础.心法名称,
      特殊配置: 基础.特殊配置,
      装备信息: 基础.当前装备信息,
      当前目标: 基础.当前目标,
      技能数据映射: 基础.技能数据映射,
      增益启用: 基础.增益启用,
      增益数据: 基础.增益数据,
      战斗时间,
      是否郭氏计算,
      快照计算: 基础.团队快照计算列表,
      计算循环详情: 基础.实际计算循环详情,
      奇穴数据: 基础.奇穴数据,
      计算技能详情,
    })

    // 每秒dps
    const 秒伤 = 是否郭氏计算 ? INT(总伤 / 战斗时间) : 总伤 / 战斗时间

    const 计算结果 = { 总伤, 秒伤, 秒伤计算时间: 战斗时间, 计算结果技能列表 }

    if (是否更新显示计算结果) {
      dispatch?.(更新当前计算结果(计算结果))
    }

    // 是否郭氏计算 && console.timeEnd('计算耗时')

    return 计算结果
  }

/**
 * 秒伤计算的基础数据准备（与循环/时间无关的昂贵部分，只做一次）
 * 供「秒伤计算」与「计算循环秒伤曲线」复用，避免曲线计算时重复执行 setup
 */
export const 获取秒伤计算基础 = (dispatch, getState, props: CurrentDpsFunctionProps = {}) => {
  const {
    更新装备信息 = {},
    更新增益数据 = {},
    更新增益启用 = undefined,
    更新计算循环名称 = '',
    更新奇穴数据,
    更新秘籍信息,
    更新快照计算,
    更新网络延迟,
    更新计算循环详情,
    更新循环技能列表,
  } = props || {}

  const currentState: RootState = getState?.() || {}

  const 网络延迟 = 更新网络延迟 ? 更新网络延迟 : (currentState?.data?.网络延迟 ?? 1)
  const 当前装备信息 = { ...currentState?.data?.装备信息, ...更新装备信息 }
  const 奇穴数据 = 更新奇穴数据?.length ? 更新奇穴数据 : currentState.data.当前奇穴信息
  const 当前目标 = 获取计算目标信息(currentState?.data?.当前输出计算目标名称)
  const 增益启用 = 更新增益启用 === undefined ? currentState?.data?.增益启用 : 更新增益启用
  const 当前计算循环名称 = 更新计算循环名称 || currentState?.data?.当前计算循环名称
  const 当前秘籍信息 = 更新秘籍信息 || currentState?.data?.当前秘籍信息
  const 增益数据 = { ...currentState?.data?.增益数据, ...更新增益数据 }
  const 自定义循环列表 = currentState?.data?.自定义循环列表 || []
  const 团队增益轴 = currentState?.data?.团队增益轴 || []

  const { 计算循环详情 } = useCycle({
    覆盖数据: {
      装备信息: 当前装备信息,
      增益数据: 增益数据,
      增益启用: 增益启用,
      网络延迟: 网络延迟,
      自定义循环列表: 自定义循环列表,
      当前计算循环名称: 当前计算循环名称,
    },
    使用内存数据: false,
  })

  const 实际计算循环详情 = 更新计算循环详情 ? 更新计算循环详情 : 计算循环详情

  const 当前循环技能列表 = 更新循环技能列表 ?? 实际计算循环详情?.技能详情

  const 快照计算 = 更新快照计算 ? 更新快照计算 : 根据循环判断快照计算列表(当前循环技能列表)

  const 团队快照计算列表: any[] = 判断团队增益轴快照计算(快照计算, 团队增益轴)

  const 技能基础数据 = 获取判断增益后技能系数({
    秘籍信息: 当前秘籍信息,
    奇穴数据: 奇穴数据,
    装备增益: 当前装备信息?.装备增益,
    团队增益: 增益启用 ? 增益数据 : false,
    团队快照计算列表,
    排除技能增益: 获取心法排除技能增益(获取当前心法名(), !!增益启用, currentState?.data?.特殊配置),
  })

  const 技能数据映射 = new Map<string, 技能基础数据模型>(
    技能基础数据.map((item) => [item.技能名称, item]),
  )

  return {
    当前装备信息,
    当前目标,
    技能数据映射,
    增益启用,
    增益数据,
    团队快照计算列表,
    实际计算循环详情,
    奇穴数据,
    心法名称: 获取当前心法名(),
    特殊配置: currentState.data.特殊配置,
  }
}

// 战斗曲线单个采样点
export interface 战斗曲线采样点 {
  总伤: number
  时间: number
  秒伤: number
}

/**
 * 战斗曲线批量计算：复用一次基础数据，对多个时间切片分别计算累计总伤
 * 最终采样点与模拟器秒伤完全一致（同一套 循环秒伤计算 + 同一战斗时间）
 */
export const 计算循环秒伤曲线 =
  (props: {
    日志: any[]
    日志转循环: (日志: any[], 战斗时间帧: number) => 循环技能详情[]
    总战斗时间帧: number
    采样间隔帧: number
    奇穴数据?: string[]
    秘籍信息?: 选中秘籍信息
    增益启用?: boolean
  }) =>
  (dispatch, getState): 战斗曲线采样点[] => {
    const { 日志 = [], 日志转循环, 总战斗时间帧, 采样间隔帧 } = props

    if (!日志?.length || !总战斗时间帧 || !采样间隔帧) {
      return []
    }

    const 基础 = 获取秒伤计算基础(dispatch, getState, {
      更新奇穴数据: props?.奇穴数据,
      更新秘籍信息: props?.秘籍信息,
      更新增益启用: props?.增益启用,
      // 关键：快照计算列表需要基于「日志聚合出的循环」推导，与模拟器 计算dps 保持一致。
      // 否则启用/关闭团队增益快照时，基础数据（技能系数映射、快照列表）会和模拟器不一致，导致最终秒伤偏差。
      更新循环技能列表: 日志转循环(日志, 总战斗时间帧),
    })

    const 结果: 战斗曲线采样点[] = [{ 总伤: 0, 时间: 0, 秒伤: 0 }]
    // 日志已按时间排序，用双指针推进前缀，避免重复 slice
    let 前缀截止索引 = 0

    // 采样时间点列表：等间隔，且保证最后一点精确等于总战斗时间（与模拟器秒伤一致）
    const 采样时间列表: number[] = []
    for (let T = 采样间隔帧; T < 总战斗时间帧; T += 采样间隔帧) {
      采样时间列表.push(T)
    }
    采样时间列表.push(总战斗时间帧)

    for (const T of 采样时间列表) {
      while (前缀截止索引 < 日志.length && (日志[前缀截止索引]?.日志时间 || 0) <= T) {
        前缀截止索引++
      }
      const 前缀日志 = 日志.slice(0, 前缀截止索引)
      const 计算循环 = 日志转循环(前缀日志, T)
      const 时间秒 = T / 每秒郭氏帧
      const { 总伤 } = 循环秒伤计算({
        计算循环,
        心法名称: 基础.心法名称,
        特殊配置: 基础.特殊配置,
        装备信息: 基础.当前装备信息,
        当前目标: 基础.当前目标,
        技能数据映射: 基础.技能数据映射,
        增益启用: 基础.增益启用,
        增益数据: 基础.增益数据,
        战斗时间: 时间秒,
        是否郭氏计算: true,
        快照计算: 基础.团队快照计算列表,
        计算循环详情: 基础.实际计算循环详情,
        奇穴数据: 基础.奇穴数据,
        计算技能详情: false,
      })
      结果.push({ 总伤, 时间: 时间秒, 秒伤: 总伤 / 时间秒 })
    }

    return 结果
  }

// 增加setTimeout，等dispatch的state都更新完了再执行计算函数
export const 触发秒伤计算 = (props?: CurrentDpsFunctionProps) => (dispatch) => {
  setTimeout(() => {
    dispatch?.(秒伤计算(props))
  }, 0)
}
