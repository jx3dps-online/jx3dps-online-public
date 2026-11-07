import { useEffect, useRef, useState } from 'react'
import { App } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 读取原始角色状态 } from '@/角色/状态'
import { use角色计划 } from '@/角色/use角色计划'
import { use目标池 } from '@/角色/use目标池'
import { 读取角色注册表 } from '@/角色/注册表'
import { 提取配装循环 } from '@/功能模块/计算结果/登龙长阶/领域/循环'
import { 加载目标库配置, 解析内置目标 } from '@/功能模块/计算结果/登龙长阶/目标库/配置'
import { 有其他操作弹窗 } from './默认目标界面'

const 已检查角色 = new Set<string>()

export function use默认目标(允许: boolean) {
  const 心法 = use心法数据()
  const 数据 = useAppSelector((state) => state.data)
  const 角色id = 数据.当前角色?.id
  const { 池, 存储: 目标存储, 读取错误: 目标错误 } = use目标池(心法.名称)
  const { 计划, 存储: 计划存储, 读取错误: 计划错误 } = use角色计划(角色id)
  const { message } = App.useApp()
  const dispatch = useAppDispatch()
  const [目标id, 设置目标id] = useState('')
  const [可见, 设置可见] = useState(document.visibilityState === 'visible')
  const 最新许可 = useRef(允许)
  最新许可.current = 允许

  useEffect(() => {
    const 更新 = () => 设置可见(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', 更新)
    return () => document.removeEventListener('visibilitychange', 更新)
  }, [])

  useEffect(() => {
    if (!允许 || !可见 || !角色id || !目标存储 || !计划存储) return
    const 范围 = `${心法.名称}:${角色id}`
    if (已检查角色.has(范围)) return
    if (池.目标.length || 计划.踏天 || 目标错误 || 计划错误 || 数据.角色读取错误) {
      已检查角色.add(范围)
      return
    }
    if (!读取原始角色状态(角色id)) return
    let 取消 = false
    const 仍可执行 = () => {
      const 当前 = dispatch((_, 获取状态) => 获取状态())
      return (
        !取消 &&
        最新许可.current &&
        !有其他操作弹窗() &&
        document.visibilityState === 'visible' &&
        当前.data.当前角色?.id === 角色id &&
        当前.data.当前角色.心法 === 心法.名称 &&
        !当前.data.角色读取错误 &&
        !当前.system.新手引导流程状态 &&
        !当前.system.配装器弹窗显示状态 &&
        读取角色注册表().列表.some((角色) => 角色.id === 角色id)
      )
    }
    const 执行 = async () => {
      const 配置 = await 加载目标库配置(心法)
      if (!仍可执行()) return
      const 推荐 = 配置?.目标.find((项) => 项.标识 === '英雄平民')
      if (!推荐) throw new Error('当前心法暂无可用的“英雄平民”目标，请通过目标管理设置目标。')
      const 保存 = () => {
        if (!仍可执行() || 已检查角色.has(范围)) return
        const 最新池 = 目标存储.读取()
        const 最新计划 = 计划存储.读取()
        const 错误 = 目标存储.读取错误() || 计划存储.读取错误()
        if (错误) throw new Error(错误)
        if (最新池.目标.length || 最新计划.踏天) {
          已检查角色.add(范围)
          return
        }
        const 角色状态 = 读取原始角色状态(角色id)
        if (!角色状态) return
        const 当前数据 = dispatch((_, 获取状态) => 获取状态().data)
        const 目标 = 解析内置目标(推荐, 心法, 当前数据)
        已检查角色.add(范围)
        const id = 目标存储.新增目标(目标.装备, 目标.名称, 目标.循环)
        try {
          计划存储.聚焦目标(id, {
            装备: 角色状态.装备信息,
            循环: 提取配装循环(角色状态),
          })
        } catch (错误) {
          message.warning(
            `“英雄平民”目标已保存，但未能设为当前目标，请在目标管理中选择。${错误 instanceof Error ? 错误.message : ''}`,
          )
          return
        }
        const 已保存计划 = 计划存储.读取()
        if (
          !目标存储.读取().目标.some((项) => 项.id === id) ||
          已保存计划.聚焦id !== id ||
          !已保存计划.绑定.some((项) => 项.目标id === id)
        )
          throw new Error('目标状态已发生变化，请在目标管理中查看当前目标。')
        设置目标id(id)
      }
      if (navigator.locks) await navigator.locks.request(`jx3dps:默认目标:${心法.名称}`, 保存)
      else 保存()
    }
    执行().catch((错误) => {
      if (!仍可执行()) return
      已检查角色.add(范围)
      message.error(错误 instanceof Error ? 错误.message : '默认目标设置失败，请通过目标管理重试。')
    })
    return () => {
      取消 = true
    }
  }, [
    允许,
    可见,
    角色id,
    数据.角色更新时间,
    数据.角色读取错误,
    心法,
    池,
    计划,
    目标错误,
    计划错误,
    目标存储,
    计划存储,
    dispatch,
    message,
  ])

  return {
    目标id,
    有效: !!目标id && 池.目标.some((项) => 项.id === 目标id) && 计划.聚焦id === 目标id,
  }
}
