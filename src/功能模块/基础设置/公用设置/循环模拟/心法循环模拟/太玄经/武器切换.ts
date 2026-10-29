import { 装备信息数据类型, 装备位置部位枚举, 装备类型枚举, 选择装备数据类型 } from '@/@types/装备'
import 武器装备数据 from '@/数据/装备/内功/武器'
import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'
import { 装备信息转表单值 } from '@/功能模块/基础设置/属性录入/配装器/工具函数/装备表单转换'
import 根据表单选项获取装备信息 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据表单选项获取装备信息'

export const 切换武器选项 = [45695, 46733, 44067, 44068].map((id) => {
  const 武器 = 武器装备数据.find((item) => item.id === id)!
  return { value: id, label: 武器.装备名称 }
})

export interface 武器装备类型 {
  起手武器ID: number
  装备集合: Record<number, 装备信息数据类型>
}

export const 获取武器名称 = (id?: number) => 武器装备数据.find((item) => item.id === id)?.装备名称

export const 准备切换武器装备 = (
  装备信息: 装备信息数据类型,
  准备备用装备 = true,
): 武器装备类型 | undefined => {
  const 表单 = 装备信息转表单值(装备信息)
  const 原武器 = 表单._12
  if (!原武器?.id || !武器装备数据.some((item) => item.id === 原武器.id)) return undefined
  const 装备集合: Record<number, 装备信息数据类型> = {
    [原武器.id]: structuredClone(装备信息),
  }
  if (!准备备用装备) return { 起手武器ID: 原武器.id, 装备集合 }
  for (const { value: id } of 切换武器选项) {
    if (id === 原武器.id) continue
    const 武器 = 武器装备数据.find((item) => item.id === id)!
    const 选择武器: 选择装备数据类型 = {
      id,
      装备部位: 装备位置部位枚举._12,
      装备部位索引: '_12',
      当前精炼等级: 武器.最大精炼等级 ?? (武器.装备类型 === 装备类型枚举.橙武 ? 8 : 6),
      镶嵌孔数组:
        武器.镶嵌孔数组?.map((孔, 索引) => ({
          ...孔,
          镶嵌宝石等级: 原武器.镶嵌孔数组?.[索引]?.镶嵌宝石等级 ?? 8,
        })) ?? [],
      附魔: 根据附魔ID获取附魔数据(原武器.附魔, '武器')?.id,
    }
    装备集合[id] = 根据表单选项获取装备信息({ ...表单, _12: 选择武器 })
  }
  return { 起手武器ID: 原武器.id, 装备集合 }
}
