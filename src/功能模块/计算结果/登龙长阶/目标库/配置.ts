import { useEffect, useState } from 'react'
import type { 数据类型 } from '@/@types/数据'
import { 装备位置部位枚举 } from '@/@types/装备'
import type { 数据模块类型 } from '@/store/data'
import type { 目标JSON数据 } from '@/角色/目标导入导出'
import { 有效配装装备, 快照装备 } from '@/角色/计划'
import { 获取循环配套数据 } from '@/角色/状态'
import { 在指定心法数据下执行 } from '@/数据/数据工具/获取当前数据'
import 根据表单选项获取装备信息 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据表单选项获取装备信息'
import { 登阶循环限制, 提取配装循环 } from '../领域/循环'
import { 获取文案 } from '../文案'
import type { 内置目标, 目标库配置 } from './类型'

export function 解析内置目标(
  项: 内置目标,
  心法: 数据类型,
  环境: Pick<数据模块类型, '增益数据' | '增益启用' | '网络延迟' | '自定义循环列表'>,
): 目标JSON数据 {
  return 在指定心法数据下执行(心法, () => {
    const 文案 = 获取文案(心法.名称)
    const 表单 = 项.配装 as Record<string, any>
    for (const [槽, 部位] of Object.entries(装备位置部位枚举)) {
      if (
        !Number.isInteger(表单?.[槽]?.id) ||
        表单[槽].id <= 0 ||
        !心法.装备数据[部位].some((装备) => 装备.id === 表单[槽].id)
      )
        throw new Error(文案['目标库.错误.配装'])
    }
    const 装备 = 根据表单选项获取装备信息(表单)
    if (!有效配装装备(装备) || 装备.装备列表.length !== 12)
      throw new Error(文案['目标库.错误.配装'])
    const 循环 = 心法.计算循环.find((循环) => 循环.名称 === 项.循环名称)
    const 原因 = 登阶循环限制(装备, 循环, 文案)
    if (原因) throw new Error(原因)
    return {
      名称: 项.名称,
      装备: 快照装备(装备),
      循环: 提取配装循环(获取循环配套数据(项.循环名称, { ...环境, 装备信息: 装备 })),
    }
  })
}

export async function 加载目标库配置(心法: 数据类型) {
  const 配置 = (await 心法.目标库?.())?.default
  if (
    配置 &&
    (配置.心法 !== 心法.名称 || new Set(配置.目标.map((项) => 项.标识)).size !== 配置.目标.length)
  )
    throw new Error(获取文案(心法.名称)['目标库.错误.配置'])
  return 配置
}

export function use目标库(心法: 数据类型) {
  const 加载 = 心法.目标库
  const [重试次数, 设置重试次数] = useState(0)
  const [状态, 设置状态] = useState<{
    加载: typeof 加载
    配置?: 目标库配置
    错误?: string
  }>()
  const 文案 = 获取文案(心法.名称)
  useEffect(() => {
    let 取消 = false
    if (!加载) return
    设置状态(undefined)
    加载目标库配置(心法)
      .then((配置) => {
        if (!取消) 设置状态({ 加载, 配置 })
      })
      .catch(() => {
        if (!取消) 设置状态({ 加载, 错误: 文案['目标库.错误.加载'] })
      })
    return () => {
      取消 = true
    }
  }, [加载, 心法.名称, 重试次数, 文案])
  return {
    目标: 状态?.加载 === 加载 ? 状态?.配置?.目标 || [] : [],
    加载中: !!加载 && 状态?.加载 !== 加载,
    错误: 状态?.加载 === 加载 ? 状态?.错误 : undefined,
    重试: () => 设置重试次数((次数) => 次数 + 1),
  }
}
