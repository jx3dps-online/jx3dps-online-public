import { useEffect, useRef, useState } from 'react'
import type { 桌宠尺寸 } from '../interface'

// 解析后的像素尺寸（宽/高均为数字像素）
export interface 桌宠像素尺寸 {
  宽: number
  高: number
}

const 默认尺寸: 桌宠像素尺寸 = { 宽: 160, 高: 160 }

// 尺寸数值：数字=像素；字符串（如 '30%'）=屏幕宽度百分比；纯数字字符串按像素处理
const 解析数值 = (值: number | string, 屏宽: number): number => {
  if (typeof 值 === 'number') {
    return 值
  }
  const 文本 = 值.trim()
  if (文本.endsWith('%')) {
    const 百分比 = Number.parseFloat(文本)
    return Number.isNaN(百分比) ? 0 : (屏宽 * 百分比) / 100
  }
  const 像素 = Number.parseFloat(文本)
  return Number.isNaN(像素) ? 0 : 像素
}

/**
 * 将尺寸配置解析为像素尺寸。
 * - 宽/高缺省时回退到「兜底」；
 * - 设置「比例」时，高 = 宽 × 比例，无需再填高；
 * - 显式填了「高」时，以「高」为准（优先级高于比例）。
 */
export const 解析尺寸为像素 = (
  尺寸: 桌宠尺寸 | undefined,
  屏宽: number,
  兜底: 桌宠像素尺寸 = 默认尺寸,
): 桌宠像素尺寸 => {
  if (!尺寸) {
    return 兜底
  }
  const 宽 = 尺寸.宽 !== undefined ? 解析数值(尺寸.宽, 屏宽) : 兜底.宽
  let 高 = 兜底.高
  if (尺寸.高 !== undefined) {
    高 = 解析数值(尺寸.高, 屏宽)
  } else if (尺寸.比例 !== undefined) {
    高 = 宽 * 尺寸.比例
  }
  return { 宽, 高 }
}

// 屏幕宽度，随窗口缩放实时更新
export const use屏幕宽度 = (): number => {
  const [屏宽, 设置屏宽] = useState(() => window?.innerWidth || 0)
  useEffect(() => {
    const 处理变化 = () => 设置屏宽(window?.innerWidth || 0)
    window.addEventListener('resize', 处理变化)
    return () => window.removeEventListener('resize', 处理变化)
  }, [])
  return 屏宽
}

/**
 * 解析尺寸并保持引用稳定：仅当解析出的数值发生变化时才更新引用，
 * 避免固定像素尺寸在窗口缩放时触发下游（如 use拖动）的位置重置。
 */
export const use桌宠尺寸 = (
  屏宽: number,
  尺寸配置?: 桌宠尺寸,
  兜底配置?: 桌宠尺寸,
): 桌宠像素尺寸 => {
  const 兜底 = 解析尺寸为像素(兜底配置, 屏宽)
  const 当前 = 解析尺寸为像素(尺寸配置, 屏宽, 兜底)
  const 引用 = useRef(当前)
  if (引用.current.宽 !== 当前.宽 || 引用.current.高 !== 当前.高) {
    引用.current = 当前
  }
  return 引用.current
}
