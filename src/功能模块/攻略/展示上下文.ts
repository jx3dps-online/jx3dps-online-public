import { createContext } from 'react'

export type 攻略展示模式 = '全屏' | '计算结果' | '居中小窗'

export interface 攻略展示上下文类型 {
  只读预览?: boolean
  默认全屏?: boolean
  关闭?: () => void
  /** 「计算结果」模式下用于对齐尺寸的结果面板节点 */
  计算结果节点?: HTMLElement | null
}

// 攻略容器读取此上下文判断当前是否处于「弹窗全屏」展示模式；
// 弹窗模式下默认进入全屏状态，并把「退出全屏」按钮替换为「关闭」。
export const 攻略展示上下文 = createContext<攻略展示上下文类型>({})
