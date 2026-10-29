import 简写映射 from '@/心法模块/简写映射.json'
import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 清空本地背景图存储, 是否为本地背景图 } from '@/工具函数/本地背景图'

export const 获取全部心法列表 = (): string[] => {
  return Array.from(new Set(Object.values(简写映射) as string[]))
}

export const 读取心法背景图选择 = (心法名称: string): string[] => {
  const 映射 = 获取缓存映射(心法名称)
  try {
    const 缓存字符串 = localStorage.getItem(映射.背景图选择)
    const 缓存值 = JSON.parse(缓存字符串 || '[]')
    return Array.isArray(缓存值) ? 缓存值 : []
  } catch {
    return []
  }
}

export const 保存心法背景图选择 = (心法名称: string, 列表: string[]) => {
  const 映射 = 获取缓存映射(心法名称)
  localStorage.setItem(映射.背景图选择, JSON.stringify(列表))
}

export const 读取心法自定义背景图 = (心法名称: string): string[] => {
  const 映射 = 获取缓存映射(心法名称)
  try {
    const 缓存字符串 = localStorage.getItem(映射.自定义背景图)
    const 缓存值 = JSON.parse(缓存字符串 || '[]')
    return Array.isArray(缓存值) ? 缓存值 : []
  } catch {
    return []
  }
}

export const 保存心法自定义背景图 = (心法名称: string, 列表: string[]) => {
  const 映射 = 获取缓存映射(心法名称)
  localStorage.setItem(映射.自定义背景图, JSON.stringify(列表))
}

export const 加载心法内置背景图 = async (心法名称: string): Promise<string[]> => {
  try {
    const 模块 = await import(`@/心法模块/心法/${心法名称}/index`)
    return 模块?.default?.系统配置?.背景图 || []
  } catch {
    return []
  }
}

export const 清理所有本地背景图 = async () => {
  await 清空本地背景图存储()
  获取全部心法列表().forEach((心法名称) => {
    const 自定义 = 读取心法自定义背景图(心法名称).filter((url) => !是否为本地背景图(url))
    保存心法自定义背景图(心法名称, 自定义)
    const 选择 = 读取心法背景图选择(心法名称).filter((url) => !是否为本地背景图(url))
    保存心法背景图选择(心法名称, 选择)
  })
}
