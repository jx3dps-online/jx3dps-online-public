import type { 循环数据, 循环详情 } from '@/@types/循环'
import type { ReactNode } from 'react'
import type { Buff枚举, 起手Buff配置 } from '../../通用框架/类型定义/Buff'

export interface 批量模拟配置 {
  心法: string
  参数: Record<string, any>
  原始Buff数据: Buff枚举
  起手可选DOT?: string[]
  渲染配置?: (配置: Record<string, any>, 更新配置: (值: Record<string, any>) => void) => ReactNode
}

export interface 待合并序列 {
  编号: number
  名称: string
  文本: string
  起手Buff配置: 起手Buff配置
  心法配置: Record<string, any>
  按阈值选择: boolean
  选中阈值: string[]
  加速输入: string
  延迟: number[]
}

export interface 模拟任务 {
  序列: 待合并序列 & { 武器类型: '橙武' | '紫武' }
  技能序列: string[]
  加速范围: [number, number]
  延迟: number
}

export interface 计算进度 {
  序列名称: string
  加速: number
  延迟: number
  错误?: string
  详情?: 循环详情
}

export interface 批量计算结果 {
  循环: 循环数据
  记录: 计算进度[]
}
