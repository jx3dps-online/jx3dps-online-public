import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'

import { 团队增益轴类型, 增益选项数据类型 } from '@/@types/团队增益'
import { 角色基础属性类型 } from '@/@types/角色'
import { 装备信息数据类型 } from '@/@types/装备'
import { 当前计算结果类型 } from '@/@types/输出'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 全部方案数据, 更新方案数据入参 } from '@/@types/方案'
import { 循环数据 } from '@/@types/循环'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取数据默认值 } from '@/工具函数/init'

const { 缓存映射 } = 获取当前数据()

export interface 数据模块类型 {
  // 当前方案名称
  当前方案名称: string
  // 全部方案数据
  全部方案数据: 全部方案数据
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
  // 秘籍保存数据
  当前秘籍信息: 选中秘籍信息
  // 团队增益轴
  团队增益轴: 团队增益轴类型
}

const 数据默认值 = 获取数据默认值()

const 默认值: 数据模块类型 = {
  ...数据默认值,
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
      localStorage?.setItem(缓存映射.网络延迟, action.payload.toString())
    },
    更新团队增益轴: (state, action: PayloadAction<团队增益轴类型>) => {
      state.团队增益轴 = action.payload
      localStorage?.setItem(缓存映射.团队增益轴, JSON.stringify(action.payload))
    },
    更新当前计算结果: (state, action: PayloadAction<当前计算结果类型>) => {
      state.当前计算结果 = action.payload
    },
    更新当前自定义循环列表: (state, action: PayloadAction<循环数据[]>) => {
      state.自定义循环列表 = action.payload
    },
    更新当前输出计算目标名称: (state, action: PayloadAction<string>) => {
      state.当前输出计算目标名称 = action.payload
      localStorage?.setItem(缓存映射.当前输出计算目标名称, action.payload)
    },
    更新当前秘籍信息: (state, action: PayloadAction<选中秘籍信息>) => {
      state.当前秘籍信息 = { ...action.payload }
      localStorage.setItem(缓存映射.当前秘籍信息, JSON.stringify(action.payload))
    },
    更新当前方案名称: (state, action: PayloadAction<string>) => {
      state.当前方案名称 = action.payload
      localStorage.setItem(缓存映射.当前方案名称, action.payload)
    },
    更新全部方案数据: (state, action: PayloadAction<全部方案数据>) => {
      state.全部方案数据 = action.payload
      localStorage.setItem(缓存映射.全部方案数据, JSON.stringify(action.payload))
    },
    更新方案数据: (state, action: PayloadAction<更新方案数据入参>) => {
      const 目标属性 = action?.payload?.属性
      if (目标属性) {
        // 更新当前正在使用的属性
        state[目标属性] = action?.payload?.数据
        const 当前方案名称 = state.当前方案名称
        // 更新全部方案内对应的属性
        if (state.全部方案数据?.[当前方案名称]) {
          state.全部方案数据[当前方案名称][目标属性] = action?.payload?.数据
          // 更新浏览器缓存
          localStorage.setItem(缓存映射.全部方案数据, JSON.stringify(state.全部方案数据))
        }
      }
    },
    更新选中的方案数据: (state, action: PayloadAction<string>) => {
      const 切换的目标方案名称 = action?.payload
      const 目标方案 = state.全部方案数据?.[切换的目标方案名称]

      if (目标方案) {
        state.当前方案名称 = 切换的目标方案名称
        localStorage.setItem(缓存映射.当前方案名称, action.payload)
        state.装备信息 = 目标方案.装备信息
        state.增益启用 = 目标方案.增益启用
        state.增益数据 = 目标方案.增益数据
        state.当前奇穴信息 = 目标方案.当前奇穴信息
        state.当前计算循环名称 = 目标方案.当前计算循环名称
        if (目标方案.当前秘籍信息) {
          state.当前秘籍信息 = 目标方案.当前秘籍信息
        }
      }
    },
  },
})

export const {
  更新全部数据,
  更新角色基础属性,
  更新网络延迟,
  更新团队增益轴,
  更新当前计算结果,
  更新当前自定义循环列表,
  更新当前输出计算目标名称,
  更新当前秘籍信息,
  更新当前方案名称,
  更新全部方案数据,
  更新方案数据,
  更新选中的方案数据,
} = 数据模块.actions // 导出操作state的喊出

export const DataState = (state: RootState) => state

export default 数据模块.reducer // 导出当前reducer在store/index.ts中记性全局挂
