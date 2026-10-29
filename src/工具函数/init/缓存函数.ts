import { 目标集合 } from '@/数据/目标'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 品级筛选范围 } from '@/数据/常量/装备常量'
import type { 装备选择范围类型 } from '@/@types/装备'
import type { 增益选项数据类型, 团队增益选项数据类型 } from '@/@types/团队增益'
import type { 角色增益数据类型 } from '@/角色/类型'
import type { 副本事件定义类型 } from '@/@types/副本事件'
import 事件定义原始 from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/通用/通用组件/副本事件编辑器/事件定义.json'
import {
  默认方案名称,
  生成默认方案,
} from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/通用/通用组件/副本事件编辑器/utils'
import { 默认团队增益轴, 默认网页设置, 合并网页设置 } from './默认数据'

const 副本事件定义列表 = 事件定义原始 as 副本事件定义类型[]

export const 加载缓存网络延迟 = () => {
  const { 缓存映射 = {} as any, 默认数据 = {} } = 获取当前数据()
  const 默认延迟 = 默认数据?.网络延迟 || 0
  const localNetwork = localStorage.getItem(缓存映射.网络延迟) || 默认延迟 || 1
  if (localNetwork) {
    return +localNetwork
  } else {
    return 1
  }
}

export const 加载缓存背景图片显示状态 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  return !!+(localStorage.getItem(缓存映射.背景图片显示状态) || '1')
}

export const 加载缓存网页设置 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 缓存字符串 = localStorage.getItem(缓存映射.网页设置)
  if (缓存字符串) {
    try {
      const 缓存值 = JSON.parse(缓存字符串)
      return 合并网页设置(默认网页设置, 缓存值)
    } catch {
      return { ...默认网页设置 }
    }
  }
  return {
    ...默认网页设置,
    外观: { ...默认网页设置.外观, 背景图片显示: 加载缓存背景图片显示状态() },
  }
}

export const 加载缓存背景图选择 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 缓存字符串 = localStorage.getItem(缓存映射.背景图选择)
  if (缓存字符串) {
    try {
      const 缓存值 = JSON.parse(缓存字符串)
      return Array.isArray(缓存值) ? 缓存值 : []
    } catch {
      return []
    }
  }
  return []
}

export const 加载缓存自定义背景图 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 缓存字符串 = localStorage.getItem(缓存映射.自定义背景图)
  if (缓存字符串) {
    try {
      const 缓存值 = JSON.parse(缓存字符串)
      return Array.isArray(缓存值) ? 缓存值 : []
    } catch {
      return []
    }
  }
  return []
}

export const 加载缓存当前输出计算目标名称 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 名称 = localStorage.getItem(缓存映射.当前输出计算目标名称)
  if (目标集合.some((目标) => 目标.名称 === 名称)) return 名称!
  const 默认名称 = 目标集合[0].名称
  if (名称 && 缓存映射.当前输出计算目标名称) {
    try {
      localStorage.setItem(缓存映射.当前输出计算目标名称, 默认名称)
    } catch (错误) {
      console.warn('默认输出目标未保存。', 错误)
    }
  }
  return 默认名称
}

export const 加载缓存增益启用 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  return localStorage.getItem(缓存映射.增益启用) === '1'
}

/** 当前心法的特殊配置：各心法专属定制设置统一存这一个 JSON 对象，避免缓存键膨胀 */
export const 加载缓存特殊配置 = (心法名?: string): Record<string, any> => {
  if (!心法名) return {}
  const 缓存字符串 = localStorage.getItem(获取缓存映射(心法名).特殊配置)
  if (!缓存字符串) return {}
  try {
    const 缓存值 = JSON.parse(缓存字符串)
    return 缓存值 && typeof 缓存值 === 'object' ? 缓存值 : {}
  } catch {
    return {}
  }
}

const 有效团队增益数组 = (值: unknown): 值 is 团队增益选项数据类型[] =>
  Array.isArray(值) &&
  值.every(
    (项) =>
      !!项 &&
      typeof 项 === 'object' &&
      typeof 项.增益名称 === 'string' &&
      typeof 项.启用 === 'boolean' &&
      typeof 项.层数 === 'number' &&
      typeof 项.覆盖率 === 'number',
  )

export const 加载缓存团队增益 = (): 团队增益选项数据类型[] => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 缓存字符串 = localStorage.getItem(缓存映射.团队增益)
  if (缓存字符串) {
    try {
      const 缓存值 = JSON.parse(缓存字符串)
      return 有效团队增益数组(缓存值) ? 缓存值 : []
    } catch {
      return []
    }
  }
  return []
}

/** 全局团队增益与当前心法可用列表取交集：心法里没有的增益忽略。 */
export const 合成增益数据 = (角色增益: 角色增益数据类型): 增益选项数据类型 => {
  const { 团队增益 = [] } = 获取当前数据()
  return {
    阵眼: 角色增益.阵眼,
    小吃: 角色增益.小吃,
    团队增益: 加载缓存团队增益().filter((项) =>
      团队增益.some((可用项) => 可用项.增益名称 === 项.增益名称),
    ),
  }
}

export const 加载缓存团队增益轴 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 团队增益轴 = JSON.parse(localStorage.getItem(缓存映射.团队增益轴) || '{}') || {}
  if (团队增益轴) {
    return { ...默认团队增益轴, ...团队增益轴 }
  } else {
    return { ...默认团队增益轴 }
  }
}

export const 加载缓存副本事件方案列表 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 缓存数据 = JSON.parse(localStorage.getItem(缓存映射.副本事件方案列表) || '[]') || []
  // 默认方案始终按当前事件定义重新生成，不读取缓存副本
  const 副本事件方案列表 = Array.isArray(缓存数据)
    ? 缓存数据.filter((item) => item?.方案名称 !== 默认方案名称)
    : []
  return [生成默认方案(副本事件定义列表), ...副本事件方案列表]
}

export const 加载缓存装备选择范围 = (): 装备选择范围类型 => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 默认值: 装备选择范围类型 = { 品级范围: 品级筛选范围.全部 }
  const 缓存字符串 = localStorage.getItem(缓存映射.装备选择范围)
  if (缓存字符串) {
    try {
      const 缓存值 = JSON.parse(缓存字符串)
      if (缓存值 && typeof 缓存值 === 'object') {
        return {
          品级范围: Array.isArray(缓存值.品级范围)
            ? 缓存值.品级范围.filter((值) => typeof 值 === 'number')
            : [],
          词条类型: Array.isArray(缓存值.词条类型)
            ? 缓存值.词条类型.filter((值) => typeof 值 === 'string')
            : [],
          过滤类型: Array.isArray(缓存值.过滤类型)
            ? 缓存值.过滤类型.filter((值) => typeof 值 === 'string')
            : [],
        }
      }
    } catch {
      return 默认值
    }
  }
  return 默认值
}

// 获取自定义循环
export const 加载缓存自定义循环数据 = () => {
  const { 缓存映射 = {} as any } = 获取当前数据()
  const 循环枚举 = JSON.parse(localStorage.getItem(缓存映射.自定义循环) || '{}') || {}
  if (Object.keys(循环枚举)?.length) {
    return Object.keys(循环枚举).map((key) => {
      return 循环枚举[key]
    })
  } else {
    return []
  }
}
