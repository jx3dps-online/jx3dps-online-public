import { useEffect, useMemo, useState } from 'react'
import type { 数据类型 } from '@/@types/数据'
import type { 配装原始数据 } from '@/功能模块/攻略/components/配装'
import 根据表单选项获取装备信息 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据表单选项获取装备信息'
import { 登阶武器类型, 登阶循环限制 } from '../领域/循环'
import { 获取文案, 填充文案, 武器类型显示 } from '../文案'
import type { 配装目标 } from '@/角色/类型'
import { 有效配装装备 } from '@/角色/计划'
import { 踏天目标id, 踏天开启进度阈值 } from './类型'
import type { 踏天配置, 踏天路线 } from './类型'

export function 解析踏天参考(配置: 踏天配置, 心法: 数据类型, 路线: 踏天路线) {
  const 文案 = 获取文案(心法.名称)
  const 阈值 = 配置.开启进度阈值 ?? 踏天开启进度阈值
  if (!Number.isFinite(阈值) || 阈值 < 0 || 阈值 > 1)
    throw new Error(文案['踏天.配置.开启阈值无效'])
  const 解析 = (配装: 配装原始数据, 循环名称: string, 预期: 踏天路线, 来源: string): 配装目标 => {
    // 禁止引擎静默忽略空槽、下架 ID 后仍把结果当成完整参考。
    const 表单 = 配装 as Record<string, any>
    for (let i = 1; i <= 12; i++) {
      if (!Number.isInteger(表单?.['_' + i]?.id) || 表单['_' + i].id <= 0)
        throw new Error(填充文案(文案['踏天.配置.配装不完整'], { 来源 }))
    }
    const 装备 = 根据表单选项获取装备信息(配装)
    if (
      !有效配装装备(装备) ||
      装备.装备列表.length !== 12 ||
      装备.装备列表.some((项) => !心法.装备数据[项.装备部位]?.some((数据) => 数据.id === 项.id))
    )
      throw new Error(填充文案(文案['踏天.配置.装备无效'], { 来源 }))
    const 实际 = 登阶武器类型(装备)
    if (实际 === '未装备' || (实际 === '橙武') !== (预期 === '橙武'))
      throw new Error(
        填充文案(文案[预期 === '紫武' ? '踏天.配置.紫武不能橙武' : '踏天.配置.橙武需要橙武'], {
          来源,
        }),
      )
    const 元数据 = 心法.计算循环.find((项) => 项.名称 === 循环名称)
    if (!元数据 || 登阶循环限制(装备, 元数据, 文案))
      throw new Error(填充文案(文案['踏天.配置.循环不可用'], { 来源, 循环: 循环名称 }))
    return {
      id: 踏天目标id(预期),
      名称: 填充文案(文案['踏天.配置.目标名'], { 路线: 武器类型显示(文案, 预期) }),
      时间: 0,
      装备,
      循环: { 名称: 元数据.名称, 奇穴: 元数据.奇穴 || [], 秘籍: 元数据.秘籍 || {} },
    }
  }
  const 目标配置 = 配置.路线[路线]
  if (!目标配置) throw new Error(文案['踏天.配置.路线未配置'])
  const 目标 = 解析(目标配置.配装, 目标配置.循环名称, 路线, 路线 + '.json')
  const 门槛 = 解析(配置.门槛.配装, 配置.门槛.循环名称, '紫武', '门槛.json')
  return {
    目标,
    门槛,
    阈值,
    签名: JSON.stringify([配置.版本, 路线, 目标.装备, 目标.循环, 门槛.装备, 门槛.循环]),
  }
}
export type 踏天参考 = ReturnType<typeof 解析踏天参考>

export function use踏天参考(心法: 数据类型, 路线: 踏天路线) {
  const 文案 = 获取文案(心法.名称)
  const 加载 = 心法.踏天境
  const [状态, 设置状态] = useState<{ 加载: typeof 加载; 配置?: 踏天配置; 错误?: string }>()
  useEffect(() => {
    let 取消 = false
    if (加载)
      加载()
        .then((模块) => {
          if (!取消) 设置状态({ 加载, 配置: 模块.default })
        })
        .catch(() => {
          if (!取消) 设置状态({ 加载, 错误: 文案['踏天.配置.加载失败'] })
        })
    return () => {
      取消 = true
    }
  }, [加载, 文案])
  const 配置 = 状态?.加载 === 加载 ? 状态?.配置 : undefined
  return useMemo(() => {
    if (!加载) return { 已配置: false, 加载中: false }
    if (!配置)
      return {
        已配置: true,
        加载中: 状态?.加载 !== 加载,
        错误: 状态?.加载 === 加载 ? 状态.错误 : undefined,
      }
    try {
      return { 已配置: true, 加载中: false, 配置, 参考: 解析踏天参考(配置, 心法, 路线) }
    } catch (错误) {
      return {
        已配置: true,
        加载中: false,
        配置,
        错误: 错误 instanceof Error ? 错误.message : 文案['踏天.配置.待维护'],
      }
    }
  }, [加载, 配置, 心法, 路线, 状态, 文案])
}
