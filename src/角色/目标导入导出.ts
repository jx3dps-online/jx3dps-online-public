import type { 配装目标 } from './类型'
import { 快照装备, 快照循环 } from './计划'
import { 装备位置部位枚举 } from '@/@types/装备'
import 根据表单选项获取装备信息 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据表单选项获取装备信息'

export type 目标JSON数据 = Pick<配装目标, '名称' | '装备' | '循环'>

export const 读取目标JSON = (文本: string, 心法: string): 目标JSON数据 => {
  const 数据: 目标JSON数据 & { 心法: string } = JSON.parse(文本)
  if (!('装备' in 数据) && Object.keys(装备位置部位枚举).some((部位) => 部位 in 数据)) {
    return {
      名称: '导入配装',
      装备: 快照装备(根据表单选项获取装备信息(数据)),
      循环: undefined,
    }
  }
  if (数据.心法 !== 心法) throw new Error('请切换到 JSON 字符串对应的心法后导入。')
  return {
    名称: 数据.名称,
    装备: 快照装备(数据.装备),
    循环: 快照循环(数据.循环),
  }
}

export const 导出目标JSON = (心法: string, 目标: 目标JSON数据) =>
  JSON.stringify(
    { 心法, 名称: 目标.名称, 装备: 目标.装备, 循环: 目标.循环 },
    null,
    2,
  )
