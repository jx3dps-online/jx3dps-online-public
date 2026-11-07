import { useEffect, useMemo, useState } from 'react'
import type { 技能总伤害计算入参类型 } from '@/@types/计算'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import 获取当前数据, { 在指定心法数据下执行 } from '@/数据/数据工具/获取当前数据'
import { 获取秒伤计算基础 } from '@/计算模块/计算函数'
import { 获取收益计算入参 } from '../心法增益/收益计算'
import { 获取装备收益来源 } from './属性来源'
import { 计算装备容量分布 } from './容量计算'
import { 获取属性效用入参, 过滤属性效用增益 } from './属性效用'
import { 获取装备收益基准, 计算装备收益秒伤, 计算装备来源收益, type 装备收益结果 } from './收益计算'

const 初始状态 = {
  已计算: 0,
  总数: 0,
  基准秒伤: 0,
  效用基准秒伤: 0,
  计算中: true,
  错误: '',
  结果: [] as 装备收益结果[],
  效用结果: [] as 装备收益结果[],
  效用入参: null as 技能总伤害计算入参类型 | null,
}

function use装备分析(包含特效: boolean) {
  const { 名称 } = use心法数据()
  const 数据 = useAppSelector((state) => state.data)
  const dispatch = useAppDispatch()
  const 输入 = useMemo(() => ({ 数据, 名称, 包含特效 }), [数据, 名称, 包含特效])
  const [状态, 设置状态] = useState({ ...初始状态, 输入 })
  const 基础 = useMemo(() => {
    try {
      const 来源 = 获取装备收益来源(数据.装备信息)
      return {
        来源,
        容量: 计算装备容量分布(数据.装备信息, 包含特效, 来源),
        效用容量: 计算装备容量分布(数据.装备信息, 包含特效, 来源, true),
        错误: '',
      }
    } catch (异常) {
      return {
        来源: [],
        容量: undefined,
        效用容量: undefined,
        错误: 异常 instanceof Error ? 异常.message : '装备容量计算失败',
      }
    }
  }, [数据.装备信息, 名称, 包含特效])

  useEffect(() => {
    let 已取消 = false
    let 定时器: ReturnType<typeof setTimeout>
    设置状态({ ...初始状态, 输入 })
    if (基础.错误) {
      设置状态({ ...初始状态, 输入, 计算中: false, 错误: 基础.错误 })
      return
    }
    const 心法数据 = 获取当前数据(名称)
    const 报错 = (异常: unknown) =>
      设置状态({
        ...初始状态,
        输入,
        计算中: false,
        错误: 异常 instanceof Error ? 异常.message : '装备收益计算失败',
      })
    定时器 = setTimeout(() => {
      try {
        const { 入参, 基准秒伤, 效用入参, 效用基准秒伤 } = 在指定心法数据下执行(心法数据, () => {
          const 计算基础 = dispatch((内部派发, 获取状态) => 获取秒伤计算基础(内部派发, 获取状态))
          const 原入参 = 获取收益计算入参(计算基础)
          if (!原入参.战斗时间 || !原入参.计算循环.length) {
            throw new Error('当前没有可用循环，请先选择能够计算秒伤的循环。容量仍可单独查看。')
          }
          const 入参 = 获取装备收益基准(原入参, 基础.来源, 包含特效)
          const 效用入参 = 获取属性效用入参(入参)
          return {
            入参,
            基准秒伤: 计算装备收益秒伤(入参),
            效用入参,
            效用基准秒伤: 计算装备收益秒伤(效用入参),
          }
        })
        const 新结果: 装备收益结果[] = []
        const 新效用结果: 装备收益结果[] = []
        const 下一项 = () => {
          if (已取消) return
          try {
            if (新结果.length < 基础.来源.length) {
              const 来源 = 基础.来源[新结果.length]
              新效用结果.push(
                在指定心法数据下执行(心法数据, () =>
                  计算装备来源收益(
                    效用入参,
                    { ...来源, 移除后增益: 过滤属性效用增益(来源.移除后增益) },
                    效用基准秒伤,
                    包含特效,
                  ),
                ),
              )
              新结果.push(
                在指定心法数据下执行(心法数据, () =>
                  计算装备来源收益(入参, 来源, 基准秒伤, 包含特效),
                ),
              )
            }
            const 计算中 = 新结果.length < 基础.来源.length
            设置状态({
              输入,
              已计算: 新结果.length,
              总数: 基础.来源.length,
              基准秒伤,
              效用基准秒伤,
              效用入参: 计算中 ? null : 效用入参,
              计算中,
              错误: '',
              结果: 计算中 ? [] : 新结果.sort((a, b) => b.秒伤差值 - a.秒伤差值),
              效用结果: 计算中 ? [] : 新效用结果,
            })
            if (计算中) 定时器 = setTimeout(下一项, 0)
          } catch (异常) {
            报错(异常)
          }
        }
        下一项()
      } catch (异常) {
        报错(异常)
      }
    }, 0)
    return () => {
      已取消 = true
      clearTimeout(定时器)
    }
  }, [dispatch, 输入, 基础, 名称, 包含特效])

  return { ...基础, 状态: 状态.输入 === 输入 ? 状态 : 初始状态 }
}

export default use装备分析
