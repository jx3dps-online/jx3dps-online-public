import type { 数据类型 } from '@/@types/数据'
import type { 循环数据, 循环详情 } from '@/@types/循环'
import type { 数据模块类型 } from '@/store/data'
import type { 角色元数据 } from '@/角色/类型'
import type { 局部计算状态 } from '@/计算容器'

export interface 对比输入 {
  角色: 角色元数据[]
  页面数据: 数据模块类型
}

export interface 对比行 {
  id: string
  角色id: string
  目标id?: string
  名称: string
  来源: '角色' | '目标'
  状态?: 局部计算状态
  原因?: string
  加速值: number
  加速概要?: {
    装备: string
    附魔: string
    小药: number
    酒: number
  }
  武器标记: string
}

export interface 对比数据 {
  心法数据: 数据类型
  行: 对比行[]
  目标: { id: string; 名称: string }[]
  循环: 循环数据[]
}

export interface 对比列 {
  id: string
  循环: 循环数据
  详情: 循环详情
  标题: string
  加速说明: string
  延迟说明: string
  简易标题: string
  加速范围: [number, number]
  原因?: string
}

export interface 对比结果 {
  秒伤?: number
  原因?: string
}

export interface 对比筛选 {
  最低加速: number | null
  最高加速: number | null
  最低延迟: number | null
  最高延迟: number | null
  未限定延迟: boolean
}
