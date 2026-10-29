import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'
import { 获取当前心法名 } from '@/数据/数据工具/获取当前数据'
import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 获取系统默认值 } from '@/工具函数/init'
import { 加载缓存网页设置 } from '@/工具函数/init/缓存函数'
import { 合并网页设置 } from '@/工具函数/init/默认数据'
import type { 网页设置类型, 部分网页设置类型 } from '@/@types/配装指导'
import type { 装备信息数据类型 } from '@/@types/装备'
import type { 配装循环 } from '@/角色/类型'

// 动态取当前心法的缓存映射（切心法后 localStorage key 前缀变化）
const 获取当前缓存映射 = () => 获取缓存映射(获取当前心法名())

export type 配装器入口 =
  | { 类型: '配装'; 角色id: string }
  | { 类型: '目标'; 角色id: string; 目标id: string; 新建?: boolean }

export interface 配装器草稿 {
  名称?: string
  装备: 装备信息数据类型
  循环?: 配装循环
}

export interface 系统模块类型 {
  增益面板显示状态: boolean
  背景图片显示状态: boolean
  背景图选择: string[]
  自定义背景图: string[]
  新手引导流程状态: boolean
  当前引导步骤: number
  配装器弹窗显示状态: boolean
  配装器入口?: 配装器入口
  配装器草稿?: 配装器草稿
  网页设置: 网页设置类型
}

const 数据默认值 = 获取系统默认值()

const 默认值: 系统模块类型 = {
  ...数据默认值,
}

export const 系统模块 = createSlice({
  name: 'system',
  initialState: 默认值,
  reducers: {
    更新全部系统数据: (state, action: PayloadAction<Partial<系统模块类型>>) => {
      state = { ...state, ...action.payload }
    },
    更新背景图片显示状态: (state, action: PayloadAction<boolean>) => {
      state.背景图片显示状态 = action.payload
      state.网页设置 = 合并网页设置(state.网页设置, {
        外观: { 背景图片显示: action.payload },
      })
      const newData = action.payload ? '1' : '0'
      localStorage.setItem(获取当前缓存映射().背景图片显示状态, newData)
      localStorage.setItem(获取当前缓存映射().网页设置, JSON.stringify(state.网页设置))
    },
    更新网页设置: (state, action: PayloadAction<部分网页设置类型>) => {
      state.网页设置 = 合并网页设置(state.网页设置, action.payload)
      localStorage.setItem(获取当前缓存映射().网页设置, JSON.stringify(state.网页设置))
    },
    更新背景图选择: (state, action: PayloadAction<string[]>) => {
      state.背景图选择 = action.payload
      localStorage.setItem(获取当前缓存映射().背景图选择, JSON.stringify(action.payload))
    },
    更新自定义背景图: (state, action: PayloadAction<string[]>) => {
      state.自定义背景图 = action.payload
      localStorage.setItem(获取当前缓存映射().自定义背景图, JSON.stringify(action.payload))
    },
    更新增益面板显示状态: (state, action: PayloadAction<boolean>) => {
      state.增益面板显示状态 = action.payload
    },
    更新新手引导流程状态: (state, action: PayloadAction<boolean>) => {
      state.新手引导流程状态 = action.payload
    },
    更新当前引导步骤: (state, action: PayloadAction<number>) => {
      state.当前引导步骤 = action.payload
    },
    切换配装器弹窗显示状态: (state, action: PayloadAction<boolean>) => {
      state.配装器弹窗显示状态 = action.payload
      if (!action.payload) {
        state.配装器入口 = undefined
        state.配装器草稿 = undefined
      }
    },
    打开配装器: (state, action: PayloadAction<{ 入口?: 配装器入口; 草稿?: 配装器草稿 }>) => {
      state.配装器入口 = action.payload.入口
      state.配装器草稿 = action.payload.草稿
      state.配装器弹窗显示状态 = true
    },
    重置背景图相关: (state) => {
      // 切心法后按新心法重新读取背景图选择/自定义背景图（这两项按心法分 localStorage key）
      const 缓存映射 = 获取当前缓存映射()
      try {
        const 值 = JSON.parse(localStorage.getItem(缓存映射.背景图选择) || 'null')
        state.背景图选择 = Array.isArray(值) ? 值 : []
      } catch {
        state.背景图选择 = []
      }
      try {
        const 值 = JSON.parse(localStorage.getItem(缓存映射.自定义背景图) || 'null')
        state.自定义背景图 = Array.isArray(值) ? 值 : []
      } catch {
        state.自定义背景图 = []
      }
    },
    重新加载网页设置: (state) => {
      // 网页设置为全局缓存，但 store 初始化时心法尚未就绪、读不到缓存，
      // 因此在心法数据初始化完成后重新读取一次
      const 网页设置 = 加载缓存网页设置()
      state.网页设置 = 网页设置
      state.背景图片显示状态 = 网页设置.外观.背景图片显示
    },
  },
})

export const {
  更新全部系统数据,
  更新背景图片显示状态,
  更新网页设置,
  更新背景图选择,
  更新自定义背景图,
  更新增益面板显示状态,
  更新新手引导流程状态,
  更新当前引导步骤,
  切换配装器弹窗显示状态,
  打开配装器,
  重置背景图相关,
  重新加载网页设置,
} = 系统模块.actions // 导出操作state的喊出

export const SystemState = (state: RootState) => state

export default 系统模块.reducer // 导出当前reducer在store/index.ts中记性全局挂
