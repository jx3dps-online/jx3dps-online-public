import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 循环日志数据类型 } from './simulator/type'
import { 曲线数据点 } from '../通用/通用组件/战斗曲线弹窗/use战斗曲线'
import { 准备切换武器装备 } from './武器切换'
import { 准备武器切换计算 } from './武器切换计算'

export const use武器切换 = ({
  含切换武器,
  奇穴信息,
  秘籍信息,
  增益启用,
  计算异常,
}: {
  含切换武器: boolean
  奇穴信息: string[]
  秘籍信息: 选中秘籍信息
  增益启用: boolean
  计算异常?: string
}) => {
  const dispatch = useAppDispatch()
  const 计算配置 = useAppSelector((state) => state.data)
  const 武器切换功能启用: boolean = 计算配置.特殊配置.武器切换功能启用 ?? true
  const 武器装备 = useMemo(
    () => 准备切换武器装备(计算配置.装备信息, 武器切换功能启用),
    [计算配置.装备信息, 武器切换功能启用],
  )
  const 起手装备 = 武器装备?.装备集合[武器装备.起手武器ID]
  const 允许计算 =
    !含切换武器 ||
    (武器切换功能启用 &&
      !!武器装备 &&
      !计算异常 &&
      !(增益启用 && 计算配置.增益数据.团队增益.some((项) => 项.增益名称 === '飘黄' && 项.启用)) &&
      !起手装备?.装备增益.特效_42767 &&
      !起手装备?.装备增益.龙门飞剑武器)

  const 计算混合曲线 = useCallback(
    ({
      日志信息,
      总战斗用时帧,
      采样间隔帧,
    }: {
      日志信息: 循环日志数据类型[]
      总战斗用时帧: number
      采样间隔帧: number
    }): 曲线数据点[] => {
      if (!武器装备 || 总战斗用时帧 <= 0) return []
      const 计算 = dispatch(
        准备武器切换计算({ 完整日志: 日志信息, 武器装备, 奇穴信息, 秘籍信息, 增益启用 }),
      )
      if (计算.禁止原因) return []
      const 结果: 曲线数据点[] = [{ 时间: 0, 总伤: 0, 秒伤: 0 }]
      let 截止索引 = 0
      for (
        let 帧 = Math.min(采样间隔帧, 总战斗用时帧);
        ;
        帧 = Math.min(帧 + 采样间隔帧, 总战斗用时帧)
      ) {
        while (截止索引 < 日志信息.length && (日志信息[截止索引].日志时间 ?? 0) <= 帧) 截止索引++
        const { 总伤 } = 计算.计算结果(日志信息.slice(0, 截止索引), 帧, false)
        const 时间 = 帧 / 每秒郭氏帧
        结果.push({ 时间, 总伤, 秒伤: 总伤 / 时间 })
        if (帧 === 总战斗用时帧) break
      }
      return 结果
    },
    [dispatch, 武器装备, 奇穴信息, 秘籍信息, 增益启用],
  )

  const 额外缓存标识 = JSON.stringify([
    武器切换功能启用,
    含切换武器,
    武器装备,
    计算配置.装备信息,
    计算配置.当前输出计算目标名称,
    计算配置.增益数据,
    计算配置.当前计算循环名称,
    计算配置.自定义循环列表,
    计算配置.团队增益轴,
  ])

  return {
    武器切换功能启用,
    武器装备,
    武器切换可用: 武器切换功能启用 && !!武器装备,
    允许计算,
    计算回调: 含切换武器 ? 计算混合曲线 : undefined,
    额外缓存标识,
  }
}
