import type { 配装原始数据 } from '@/功能模块/攻略/components/配装'

export type 目标标签 =
  | '紫武'
  | '橙武'
  | '新手推荐'
  | '高手进阶'
  | '平民配装'
  | '性价比'
  | '土豪专用'

export interface 内置目标 {
  标识: string
  名称: string
  说明: string
  提供者: string
  更新日期: string
  标签: 目标标签[]
  来源链接?: string
  推荐?: boolean
  配装: 配装原始数据
  循环名称: string
  参考延迟?: number
}

export interface 目标库配置 {
  心法: string
  目标: 内置目标[]
}
