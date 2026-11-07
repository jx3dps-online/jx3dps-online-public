import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算 } from '@/计算模块/计算函数'
import 获取当前数据, { 在指定心法数据下执行 } from '@/数据/数据工具/获取当前数据'
import { 准备同部位对比, 计算候选装备效用, type 同部位对比参数 } from './计算'
import { 准备实际秒伤对比, type 同部位对比结果 } from './实际秒伤'

const 初始状态 = { 结果: [] as 同部位对比结果[], 总数: 0, 计算中: true, 错误: '' }

export default function use同部位对比(心法: string, 参数: 同部位对比参数) {
  const dispatch = useAppDispatch()
  const 数据 = useAppSelector((state) => state.data)
  const [状态, 设置状态] = useState({ ...初始状态, 参数, 心法, 数据 })
  useEffect(() => {
    let 已取消 = false
    let 定时器: ReturnType<typeof setTimeout>
    设置状态({ ...初始状态, 参数, 心法, 数据 })
    const 心法数据 = 获取当前数据(心法)
    const 快照 = dispatch((_dispatch, getState) => getState())
    const 报错 = (异常: unknown) =>
      设置状态({
        ...初始状态,
        参数,
        心法,
        数据,
        计算中: false,
        错误: 异常 instanceof Error ? 异常.message : '候选装备计算失败',
      })
    定时器 = setTimeout(() => {
      try {
        const 基准 = 在指定心法数据下执行(心法数据, () => 准备同部位对比(参数))
        const 计算实际秒伤差 = 在指定心法数据下执行(心法数据, () =>
          准备实际秒伤对比(
            快照.data.装备信息,
            参数.来源.标识,
            (装备信息) =>
              秒伤计算({ 更新装备信息: 装备信息, 计算技能详情: false })(dispatch, () => 快照).秒伤,
          ),
        )
        const 结果: 同部位对比结果[] = []
        const 下一批 = () => {
          if (已取消) return
          try {
            const 开始时间 = performance.now()
            while (结果.length < 基准.候选装备.length) {
              结果.push(
                在指定心法数据下执行(心法数据, () => {
                  const 候选 = 基准.候选装备[结果.length]
                  return { ...计算候选装备效用(基准, 候选), ...计算实际秒伤差(候选) }
                }),
              )
              if (performance.now() - 开始时间 >= 8) break
            }
            const 计算中 = 结果.length < 基准.候选装备.length
            设置状态({
              参数,
              心法,
              数据,
              结果: [...结果],
              总数: 基准.候选装备.length,
              计算中,
              错误: '',
            })
            if (计算中) 定时器 = setTimeout(下一批, 0)
          } catch (异常) {
            报错(异常)
          }
        }
        下一批()
      } catch (异常) {
        报错(异常)
      }
    }, 0)
    return () => {
      已取消 = true
      clearTimeout(定时器)
    }
  }, [心法, 参数, dispatch, 数据])
  return 状态.参数 === 参数 && 状态.心法 === 心法 && 状态.数据 === 数据 ? 状态 : 初始状态
}
