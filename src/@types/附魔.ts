import { 属性加成 } from '@/@types/属性'
import { 装备部位枚举 } from './枚举'

export interface 附魔数据类型 {
  /**
   * @name 附魔名称
   */
  附魔名称: string
  /**
   * @name 附魔装分
   */
  附魔装分: number
  /**
   * @name 挑战附魔
   */
  挑战附魔?: boolean
  /**
   * @name 阆风仙玉
   */
  阆风仙玉?: boolean
  /**
   * @name 增益集合
   */
  增益集合?: 属性加成[]
  /**
   * @name 附魔支持部位
   */
  附魔支持部位?: 装备部位枚举[]
  /**
   * @name 附魔颜色
   */
  附魔颜色?: '橙' | '绿' | '紫' | '蓝'
}

export interface 附魔原始数据 {
  数值: number
  分数: number
  赛季?: '当前' | '上赛季'
  颜色?: '橙' | '绿' | '紫' | '蓝'
}
