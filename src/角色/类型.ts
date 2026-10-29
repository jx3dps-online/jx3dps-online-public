import type { 装备信息数据类型 } from '@/@types/装备'
import type { 选中秘籍信息 } from '@/@types/秘籍'
import type { 踏天状态 } from '@/功能模块/计算结果/登龙长阶/踏天/类型'

export interface 配装循环 {
  名称: string
  奇穴: string[]
  秘籍: 选中秘籍信息
}

export interface 配装快照 {
  装备: 装备信息数据类型
  名称: string
  时间: number
  循环?: 配装循环
}

// 目标池条目：按心法共享，不含起点
export interface 配装目标 {
  id: string
  装备: 装备信息数据类型
  名称: string
  时间: number
  循环?: 配装循环
}

// 角色与目标的绑定：起点按角色保存
export interface 角色目标绑定 {
  目标id: string
  起点?: 装备信息数据类型
  起点循环?: 配装循环
}

export interface 角色计划 {
  绑定: 角色目标绑定[]
  聚焦id?: string
  历史: 配装快照[]
  踏天?: 踏天状态
}

export interface 角色增益数据类型 {
  阵眼: string
  小吃: string[]
}

export interface 角色元数据 {
  id: string
  心法: string
  名称: string
  区服?: string
  游戏角色名?: string
  uid?: string
  创建时间: number
  更新时间: number
}

export interface 角色注册表数据类型 {
  列表: 角色元数据[]
  当前角色id: string
  按心法记忆: Record<string, string>
}

export interface 角色状态数据类型 {
  装备信息: 装备信息数据类型
  当前计算循环名称: string
  当前奇穴信息: string[]
  当前秘籍信息: 选中秘籍信息
  角色增益: 角色增益数据类型
  更新时间: number
}
