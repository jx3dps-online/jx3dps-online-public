import { 属性类型 } from './属性'
import { 装备部位枚举 } from './枚举'

export type 附魔类型 = '蓝' | '紫' | '精' | '挑'

export interface 附魔数据类型 {
  id: number
  附魔名称: string
  附魔效果简写: string
  附魔装分: number
  附魔类型: 附魔类型
  附魔颜色: 附魔类型
  增益集合: Array<{ 属性: 属性类型; 值: number }>
  附魔支持部位: 装备部位枚举[]
}
