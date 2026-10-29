import { 装备属性信息模型, 装备位置部位枚举, 装备类型枚举 } from '@/@types/装备'

export const 获取品级范围外部位索引 = (
  表单值: Record<string, any>,
  品级范围: number[] | undefined,
  装备数据: Record<string, 装备属性信息模型[]> | undefined,
): string[] => {
  if (!品级范围?.length) return []
  return Object.keys(装备位置部位枚举).filter((部位索引) => {
    const 部位值 = 表单值?.[部位索引]
    if (!部位值?.id) return false
    const 部位名 = 装备位置部位枚举[部位索引]
    const 装备 = 装备数据?.[部位名]?.find((item) => item?.id === 部位值?.id)
    if (!装备) return false
    if (部位名 === '武器' && 装备?.装备类型 === 装备类型枚举.橙武) return false
    return 装备?.装备品级 < 品级范围[0] || 装备?.装备品级 > 品级范围[1]
  })
}
