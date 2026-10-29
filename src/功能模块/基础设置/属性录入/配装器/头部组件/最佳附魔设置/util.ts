import { 角色基础属性类型 } from '@/@types/角色'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'
import { 生成附魔组合, 附魔组合 } from '@/数据/附魔/组合'
import { 基础属性计算 } from '../../工具函数/根据装备信息获取基础属性'

export const 修改装备属性 = (装备基础属性: 角色基础属性类型, 当前附魔数据: 附魔组合) => {
  let 计算后属性 = { ...装备基础属性 }
  Object.values(当前附魔数据).forEach((id) => {
    根据附魔ID获取附魔数据(id)?.增益集合.forEach((增益) => {
      计算后属性 = 基础属性计算(增益, 计算后属性)
    })
  })
  return 计算后属性
}

export const 初始化所有组合 = (计算部位: string[], 过滤精品及挑战附魔: boolean) => {
  const { 附魔 = [] } = 获取当前数据()
  return 生成附魔组合(附魔, 计算部位 || [], 过滤精品及挑战附魔)
}
