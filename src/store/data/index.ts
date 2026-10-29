import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { message } from 'antd'
import type { RootState } from '@/store/index'

import { 团队增益轴类型, 增益选项数据类型, 团队增益选项数据类型 } from '@/@types/团队增益'
import { 副本事件方案类型 } from '@/@types/副本事件'
import { 角色基础属性类型 } from '@/@types/角色'
import { 装备信息数据类型 } from '@/@types/装备'
import { 当前计算结果类型 } from '@/@types/输出'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 循环数据 } from '@/@types/循环'
import 获取当前数据, { 获取当前心法名 } from '@/数据/数据工具/获取当前数据'
import { 归一化小吃数组 } from '@/数据/小药小吃/归一化'
import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 获取数据默认值 } from '@/工具函数/init'
import {
  合成增益数据,
  加载缓存团队增益,
  加载缓存特殊配置,
  加载缓存自定义循环数据,
} from '@/工具函数/init/缓存函数'
import { 解析当前角色 } from '@/角色/注册表'
import { 创建角色状态存储, 读取角色状态 } from '@/角色/状态'
import type { 角色元数据, 角色状态数据类型 } from '@/角色/类型'

// 动态取当前心法的缓存映射（切心法后 localStorage key 前缀变化）
const 获取当前缓存映射 = () => 获取缓存映射(获取当前心法名())

export interface 数据模块类型 {
  // 当前角色
  当前角色?: 角色元数据
  // 角色状态更新时间
  角色更新时间: number
  // 角色状态读取错误
  角色读取错误?: string
  // 角色面板属性信息（不包含各种数据增益。只为装备带来的基础属性
  角色基础属性: 角色基础属性类型
  // 角色装备属性信息（不包含各种数据增益。只为装备带来的基础属性
  装备信息: 装备信息数据类型
  // 当前输出计算循环名
  当前计算循环名称: string
  // 当前输出计算目标名
  当前输出计算目标名称: string
  // 当前计算过的dps
  当前计算结果: 当前计算结果类型
  // 网络延迟
  网络延迟: number
  // 奇穴信息
  当前奇穴信息: string[]
  // 自定义循环列表
  自定义循环列表: 循环数据[]
  // 增益选项
  增益数据: 增益选项数据类型
  // 增益是否启用
  增益启用: boolean
  // 当前心法的特殊配置（各心法专属定制设置统一放这里）
  特殊配置: Record<string, any>
  // 秘籍保存数据
  当前秘籍信息: 选中秘籍信息
  // 团队增益轴
  团队增益轴: 团队增益轴类型
  // 副本事件方案列表（全局共享，持久化）
  副本事件方案列表: 副本事件方案类型[]
}

const 数据默认值 = 获取数据默认值()

const 默认值: 数据模块类型 = {
  ...数据默认值,
}

/** 从当前计算数据取角色状态（用于提交角色时的完整状态重建）。 */
export const 获取角色状态 = (数据: 数据模块类型): 角色状态数据类型 | undefined => {
  if (!数据.当前角色) return undefined
  return {
    装备信息: 数据.装备信息,
    当前计算循环名称: 数据.当前计算循环名称,
    当前奇穴信息: 数据.当前奇穴信息,
    当前秘籍信息: 数据.当前秘籍信息,
    角色增益: { 阵眼: 数据.增益数据?.阵眼 || '', 小吃: 数据.增益数据?.小吃 || [] },
    更新时间: 数据.角色更新时间,
  }
}

const 写入角色状态 = (state: 数据模块类型, 状态: 角色状态数据类型) => {
  state.装备信息 = 状态.装备信息
  state.角色基础属性 = 状态.装备信息?.装备基础属性
  state.当前计算循环名称 = 状态.当前计算循环名称
  state.当前奇穴信息 = 状态.当前奇穴信息
  state.当前秘籍信息 = 状态.当前秘籍信息
  state.角色更新时间 = 状态.更新时间
  // 团队增益为全局一份，按当前心法可用列表从存储重新合成，避免读角色时被清空
  state.增益数据 = 合成增益数据(状态.角色增益)
  // 特殊配置按心法资产：切心法/加载角色时按当前心法的 key 重读
  state.特殊配置 = 加载缓存特殊配置(获取当前心法名())
  // 自定义循环按心法资产：切心法/加载角色时按当前心法的 key 重读
  state.自定义循环列表 = 加载缓存自定义循环数据()
}

const 读取并应用角色 = (state: 数据模块类型, 角色: 角色元数据) => {
  const { 状态, 读取错误 } = 读取角色状态(角色)
  state.当前角色 = 角色
  state.角色读取错误 = 读取错误
  写入角色状态(state, 状态)
}

export const 数据模块 = createSlice({
  name: 'data',
  initialState: 默认值,
  reducers: {
    更新全部数据: (state, action: PayloadAction<Partial<数据模块类型>>) => {
      state = { ...state, ...action.payload }
    },
    更新角色基础属性: (state, action: PayloadAction<角色基础属性类型>) => {
      state.角色基础属性 = { ...action.payload }
    },
    更新网络延迟: (state, action: PayloadAction<number>) => {
      state.网络延迟 = action.payload
      localStorage?.setItem(获取当前缓存映射().网络延迟, action.payload.toString())
    },
    更新团队增益轴: (state, action: PayloadAction<团队增益轴类型>) => {
      state.团队增益轴 = action.payload
      localStorage?.setItem(获取当前缓存映射().团队增益轴, JSON.stringify(action.payload))
    },
    更新副本事件方案列表: (state, action: PayloadAction<副本事件方案类型[]>) => {
      state.副本事件方案列表 = action.payload
      localStorage?.setItem(获取当前缓存映射().副本事件方案列表, JSON.stringify(action.payload))
    },
    更新当前计算结果: (state, action: PayloadAction<当前计算结果类型>) => {
      state.当前计算结果 = action.payload
    },
    更新当前自定义循环列表: (state, action: PayloadAction<循环数据[]>) => {
      state.自定义循环列表 = action.payload
      // 自定义循环按心法独立存储，写入时动态取当前心法的 key（SPA 切心法后模块常量会过期）
      const 保存信息 = {}
      action.payload.forEach((item) => {
        保存信息[item.名称] = { ...item }
      })
      try {
        localStorage.setItem(获取当前缓存映射().自定义循环, JSON.stringify(保存信息))
      } catch {
        message.error('保存循环失败，疑似数据过大导致的浏览器内存溢出')
      }
    },
    更新当前输出计算目标名称: (state, action: PayloadAction<string>) => {
      state.当前输出计算目标名称 = action.payload
      localStorage?.setItem(获取当前缓存映射().当前输出计算目标名称, action.payload)
    },
    更新增益启用: (state, action: PayloadAction<boolean>) => {
      state.增益启用 = action.payload
      localStorage?.setItem(获取当前缓存映射().增益启用, action.payload ? '1' : '0')
    },
    更新特殊配置: (state, action: PayloadAction<{ 键: string; 值: any }>) => {
      state.特殊配置 = { ...state.特殊配置, [action.payload.键]: action.payload.值 }
      localStorage.setItem(获取当前缓存映射().特殊配置, JSON.stringify(state.特殊配置))
    },
    更新团队增益: (state, action: PayloadAction<团队增益选项数据类型[]>) => {
      // 全局一份：当前心法可用的条目以本次写入为准（含清空），其它心法的条目保留
      const { 团队增益: 可用 = [] } = 获取当前数据()
      const 可用名称 = new Set(可用.map((项) => 项.增益名称))
      const 保留其它心法 = 加载缓存团队增益().filter((项) => !可用名称.has(项.增益名称))
      const 合并表 = new Map([...保留其它心法, ...action.payload].map((项) => [项.增益名称, 项]))
      const 合并 = [...合并表.values()]
      localStorage?.setItem(获取当前缓存映射().团队增益, JSON.stringify(合并))
      state.增益数据 = {
        ...state.增益数据,
        团队增益: 合并.filter((项) => 可用名称.has(项.增益名称)),
      }
    },
    /** 循环 / 奇穴 / 秘籍 / 角色增益的实时写入口：同时写角色状态。 */
    更新角色数据: (
      state,
      action: PayloadAction<{
        属性: '当前计算循环名称' | '当前奇穴信息' | '当前秘籍信息' | '角色增益' | '循环配置'
        数据: any
      }>,
    ) => {
      const { 属性, 数据 } = action.payload
      if (属性 === '循环配置') {
        state.当前计算循环名称 = 数据.当前计算循环名称
        state.当前奇穴信息 = 数据.当前奇穴信息
        state.当前秘籍信息 = 数据.当前秘籍信息
      } else if (属性 === '角色增益') {
        state.增益数据 = {
          ...state.增益数据,
          阵眼: 数据?.阵眼 || '',
          小吃: Array.isArray(数据?.小吃) ? 归一化小吃数组(数据.小吃) : [],
        }
      } else {
        state[属性] = 数据
      }
      if (!state.当前角色) return
      const 状态 = 获取角色状态(state)
      if (!状态) return
      const 新状态 = { ...状态, 更新时间: Date.now() }
      try {
        创建角色状态存储(state.当前角色.id, 新状态).保存(新状态)
      } catch (错误) {
        message.error(错误 instanceof Error ? 错误.message : '角色数据未保存，请检查浏览器存储。')
        return
      }
      state.角色更新时间 = 新状态.更新时间
    },
    /** 提交配装后的角色状态回填（配装与足迹的写入在 角色/状态.ts 完成）。 */
    应用角色状态: (state, action: PayloadAction<角色状态数据类型>) => {
      写入角色状态(state, action.payload)
    },
    加载角色: (state, action: PayloadAction<角色元数据>) => {
      读取并应用角色(state, action.payload)
    },
    加载当前角色: (state) => {
      const 心法 = 获取当前心法名()
      if (!心法) return
      if (!state.当前角色) return 获取数据默认值()
      if (state.当前角色.心法 !== 心法) {
        state.自定义循环列表 = 加载缓存自定义循环数据()
      }
      读取并应用角色(state, 解析当前角色(心法))
    },
  },
})

export const {
  更新全部数据,
  更新角色基础属性,
  更新网络延迟,
  更新团队增益轴,
  更新副本事件方案列表,
  更新当前计算结果,
  更新当前自定义循环列表,
  更新当前输出计算目标名称,
  更新增益启用,
  更新特殊配置,
  更新团队增益,
  更新角色数据,
  应用角色状态,
  加载角色,
  加载当前角色,
} = 数据模块.actions // 导出操作state的喊出

export const DataState = (state: RootState) => state

export default 数据模块.reducer // 导出当前reducer在store/index.ts中记性全局挂
