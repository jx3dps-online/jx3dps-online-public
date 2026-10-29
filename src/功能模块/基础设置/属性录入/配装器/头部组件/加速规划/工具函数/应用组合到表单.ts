import type { 加速数据类型 } from '../worker'
import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'
import { 装备属性信息模型, 装备位置部位枚举 } from '@/@types/装备'
import { 属性类型 } from '@/@types/属性'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取最大精炼等级 } from '../../../功能组件/装备选择'

export interface 应用组合结果 {
  表单值: Record<string, any>
  含小药家园酒: boolean
  小吃名称列表: string[]
  应用项数: number
  已应用部位: string[]
}

const 提取小吃名称 = (组合: 加速数据类型[]) => {
  const 小吃名称: string[] = []
  组合?.forEach((item) => {
    const id = item?.id?.toString() || ''
    if (id?.startsWith('小药_')) {
      小吃名称.push(id?.replace('小药_', ''))
    } else if (id?.startsWith('家园酒_')) {
      小吃名称.push(id?.replace('家园酒_', ''))
    }
  })
  return 小吃名称
}

const 查找五彩石名称 = (五彩石项: 加速数据类型) => {
  if (五彩石项.五彩石名称) return 五彩石项.五彩石名称
  const { 五彩石 } = 获取当前数据()
  const 六级五彩石 = 五彩石?.[6]
  return 六级五彩石?.find((石) => {
    return (
      石?.五彩石名称?.includes('急速') &&
      石?.装备增益?.some(
        (增益) => 增益?.增益类型 === 属性类型.加速等级 && 增益?.增益数值 === 五彩石项?.value,
      )
    )
  })?.五彩石名称
}

export const 应用组合到表单 = (
  组合: 加速数据类型[],
  当前表单值: Record<string, any>,
  锁定装备: 装备属性信息模型[],
): 应用组合结果 => {
  const obj = { ...当前表单值 }
  let 应用项数 = 0
  const 已应用部位: string[] = []

  const 锁定部位索引 = Object.keys(装备位置部位枚举).filter((key) =>
    锁定装备?.some((装备) => 装备?.装备部位 === 装备位置部位枚举[key]),
  )

  const 装备项 = 组合?.filter((item) => !!item?.equip && !锁定部位索引?.includes(item?.type))
  const 五彩石项 = 组合?.find((item) => item?.type === '五彩石')
  const 附魔项 = 组合?.find((item) => item?.type === '附魔')
  const 小吃名称列表 = 提取小吃名称(组合)
  const 含小药家园酒 = 小吃名称列表?.length > 0

  装备项?.forEach((item) => {
    const 部位索引 = item?.type
    const 现有值 = obj?.[部位索引]
    const 装备 = item?.equip
    obj[部位索引] = {
      ...现有值,
      镶嵌孔数组: 装备?.镶嵌孔数组?.map((孔, index) => ({
        ...孔,
        镶嵌宝石等级: 现有值?.镶嵌孔数组?.[index]?.镶嵌宝石等级 || 8,
      })),
      当前精炼等级: 获取最大精炼等级(装备),
      id: 装备?.id,
      装备部位: 装备位置部位枚举[部位索引],
    }
    if (!已应用部位?.includes(部位索引)) {
      已应用部位.push(部位索引)
    }
    应用项数++
  })

  if (五彩石项) {
    const 五彩石名称 = 查找五彩石名称(五彩石项)
    if (五彩石名称) {
      obj['五彩石'] = 五彩石名称
      应用项数++
    }
  }

  const 附魔分配 = 附魔项?.附魔分配 || {}
  // 方案未分配的加速部位代表不使用加速附魔，避免沿用表单旧值而重复加速。
  if (附魔项) {
    for (const key of ['_1', '_6', '_11']) {
      if (!obj[key] || 锁定部位索引.includes(key) || 附魔分配[key]) continue
      const 当前附魔 = 根据附魔ID获取附魔数据(obj[key].附魔, 装备位置部位枚举[key])
      if (当前附魔?.增益集合.some((gain) => gain.属性 === 属性类型.加速等级)) {
        obj[key] = { ...obj[key], 附魔: undefined }
        if (!已应用部位.includes(key)) 已应用部位.push(key)
        应用项数++
      }
    }
  }
  Object.keys(附魔分配).forEach((部位索引) => {
    if (
      obj?.[部位索引] &&
      !锁定部位索引.includes(部位索引) &&
      根据附魔ID获取附魔数据(附魔分配[部位索引], 装备位置部位枚举[部位索引])
    ) {
      obj[部位索引] = { ...obj[部位索引], 附魔: 附魔分配[部位索引] }
      if (!已应用部位?.includes(部位索引)) {
        已应用部位.push(部位索引)
      }
      应用项数++
    }
  })

  return { 表单值: obj, 含小药家园酒, 小吃名称列表, 应用项数, 已应用部位 }
}
