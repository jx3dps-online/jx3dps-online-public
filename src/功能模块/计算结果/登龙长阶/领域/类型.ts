import type { 装备信息数据类型, 选择装备数据类型 } from '@/@types/装备'

export type 登阶类别 = '装备' | '精炼' | '镶嵌' | '附魔' | '大附魔' | '五彩石' | '组合' | '武器'
export interface 登阶差异 {
  部位: string
  当前: string
  目标: string
  类别: 登阶类别
  当前装备?: 选择装备数据类型
  目标装备?: 选择装备数据类型
  当前等级?: number
  目标等级?: number
  目标孔索引?: number
}
export interface 登阶建议 {
  id: string
  标题: string
  说明: string
  类别: 登阶类别
  秒伤?: number
  提升?: number
  装备信息: 装备信息数据类型
}
export interface 登阶部位进度 {
  部位: string
  已达成: boolean
}
export interface 登阶分析 {
  当前秒伤?: number
  目标秒伤?: number
  完成数: number
  总数: number
  分类进度: { 名称: 登阶类别; 完成数: number; 总数: number }[]
  部位进度: 登阶部位进度[]
  差异: 登阶差异[]
  建议: 登阶建议[]
}
