import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export interface 新增小吃项 {
  名称: string
  类型?: string
}

interface 组合项 {
  id?: string | number
  type?: string
}

/**
 * @name 提取组合小吃
 * @description 从加速组合中提取小药/家园酒项，附带其小吃部位类型
 */
export const 提取组合小吃 = (组合: 组合项[]): 新增小吃项[] => {
  const 小吃列表: 新增小吃项[] = []
  组合?.forEach((item) => {
    const id = item?.id?.toString() || ''
    if (id?.startsWith('小药_')) {
      小吃列表.push({ 名称: id?.replace('小药_', ''), 类型: item?.type })
    } else if (id?.startsWith('家园酒_')) {
      小吃列表.push({ 名称: id?.replace('家园酒_', ''), 类型: item?.type })
    }
  })
  return 小吃列表
}

/**
 * @name 合并小吃数据
 * @description 将新增小吃合并进当前小吃列表，同类型（小吃部位）的小吃会被替换
 */
export const 合并小吃数据 = (当前小吃: string[], 新增小吃列表: 新增小吃项[]) => {
  const { 小药小吃 } = 获取当前数据()
  if (!新增小吃列表?.length) {
    return 当前小吃 || []
  }
  const 新增类型集合 = new Set(
    新增小吃列表
      ?.map((小吃) => 小吃?.类型 || 小药小吃?.find((a) => a.小吃名称 === 小吃.名称)?.小吃部位)
      ?.filter(Boolean) as string[],
  )
  const 保留小吃 = (当前小吃 || []).filter((名称) => {
    const 当前类型 = 小药小吃?.find((a) => a.小吃名称 === 名称)?.小吃部位
    return 当前类型 ? !新增类型集合.has(当前类型) : true
  })
  // 按名称去重，防止同一个小吃被重复写入
  return Array.from(new Set([...保留小吃, ...新增小吃列表.map((小吃) => 小吃.名称)]))
}
