import { createContext, useContext } from 'react'
import type { 数据类型 } from '@/@types/数据'

// 心法上下文：承载「当前心法」的完整数据。
// 由页面入口（计算器/index.tsx 的 Web 主页面）在初始化心法数据后注入，
// 切心法时 Provider 值变化，消费组件（use心法数据）自动重渲染，
// 从而替代旧「模块级 const {...} = 获取当前数据()」的一次性快照。
const 心法上下文 = createContext<数据类型 | null>(null)

export const 心法Provider = 心法上下文.Provider

export const use心法数据 = (): 数据类型 => {
  return useContext(心法上下文) || ({} as 数据类型)
}
