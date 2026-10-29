import { useCallback, useEffect, useRef, useState } from 'react'
import type { 拖拽方向 } from '../interface'

export interface 桌宠位置 {
  x: number
  y: number
}

interface Use拖动参数 {
  心法: string
  尺寸: { 宽: number; 高: number }
  默认位置?: { x?: number; y?: number }
  启用?: boolean
  on拖动开始?: () => void
  on拖动结束?: () => void
  on拖拽方向变化?: (方向: 拖拽方向) => void
  on点击?: () => void
}

const 位置存储前缀 = '桌宠位置_'
const 边距 = 16
const 避让右下角工具高度 = 120
const 点击阈值 = 5

export const 获取持久化位置 = (心法: string): 桌宠位置 | null => {
  try {
    const 原始值 = localStorage.getItem(`${位置存储前缀}${心法}`)
    if (原始值) {
      const 解析 = JSON.parse(原始值)
      if (typeof 解析?.x === 'number' && typeof 解析?.y === 'number') {
        return 解析
      }
    }
  } catch {
    // 忽略
  }
  return null
}

const 持久化位置 = (心法: string, 位置: 桌宠位置) => {
  try {
    localStorage.setItem(`${位置存储前缀}${心法}`, JSON.stringify(位置))
  } catch {
    // 忽略
  }
}

const 计算默认右下位置 = (尺寸: { 宽: number; 高: number }): 桌宠位置 => {
  const 宽 = 尺寸?.宽 || 160
  const 高 = 尺寸?.高 || 160
  return {
    x: (window?.innerWidth || 0) - 宽 - 边距,
    y: (window?.innerHeight || 0) - 高 - 边距 - 避让右下角工具高度,
  }
}

const 限制范围 = (值: number, 尺寸: number, 最大范围: number) => {
  const 上限 = 最大范围 - 尺寸
  return Math.max(0, Math.min(值, Math.max(0, 上限)))
}

// 将位置修正到当前视口内：切换分辨率 / 换屏后，持久化位置可能超出屏幕
const 修正到视口 = (位置: 桌宠位置, 尺寸: { 宽: number; 高: number }): 桌宠位置 => {
  const 宽 = 尺寸?.宽 || 160
  const 高 = 尺寸?.高 || 160
  return {
    x: 限制范围(位置.x, 宽, window?.innerWidth || 0),
    y: 限制范围(位置.y, 高, window?.innerHeight || 0),
  }
}

const 计算初始位置 = (
  心法: string,
  尺寸: { 宽: number; 高: number },
  默认位置?: { x?: number; y?: number },
): 桌宠位置 => {
  const 持久化 = 获取持久化位置(心法)
  if (持久化) {
    return 修正到视口(持久化, 尺寸)
  }
  if (默认位置?.x !== undefined && 默认位置?.y !== undefined) {
    return 修正到视口({ x: 默认位置.x, y: 默认位置.y }, 尺寸)
  }
  return 修正到视口(计算默认右下位置(尺寸), 尺寸)
}

export const use拖动 = ({
  心法,
  尺寸,
  默认位置,
  启用 = true,
  on拖动开始,
  on拖动结束,
  on拖拽方向变化,
  on点击,
}: Use拖动参数) => {
  const [位置, 设置位置] = useState(() => 计算初始位置(心法, 尺寸, 默认位置))
  const [是否拖拽中, 设置是否拖拽中] = useState(false)

  // 回调使用 ref 保存，避免闭包捕获过期值
  const 开始回调 = useRef(on拖动开始)
  const 结束回调 = useRef(on拖动结束)
  const 拖拽方向变化回调 = useRef(on拖拽方向变化)
  const 点击回调 = useRef(on点击)
  开始回调.current = on拖动开始
  结束回调.current = on拖动结束
  拖拽方向变化回调.current = on拖拽方向变化
  点击回调.current = on点击

  const 位置Ref = useRef(位置)
  位置Ref.current = 位置

  // 心法/尺寸切换时重置位置
  useEffect(() => {
    设置位置(计算初始位置(心法, 尺寸, 默认位置))
  }, [心法, 尺寸, 默认位置])

  // 窗口尺寸变化时，将位置限制在新范围内，避免桌宠跑到可视区域外
  useEffect(() => {
    const 处理窗口变化 = () => {
      设置位置((当前位置) => ({
        x: 限制范围(当前位置.x, 尺寸?.宽 || 160, window?.innerWidth || 0),
        y: 限制范围(当前位置.y, 尺寸?.高 || 160, window?.innerHeight || 0),
      }))
    }
    window.addEventListener('resize', 处理窗口变化)
    return () => window.removeEventListener('resize', 处理窗口变化)
  }, [尺寸])

  const onPointerDown = useCallback(
    (事件: React.PointerEvent) => {
      if (!启用) {
        return
      }
      // 忽略右键，仅处理左键（右键交给右键菜单）
      if (事件.button !== 0) {
        return
      }
      // 忽略气泡内部的点击
      if ((事件.target as HTMLElement)?.closest?.('[data-pet-bubble]')) {
        return
      }
      事件.preventDefault()

      const 起始指针X = 事件.clientX
      const 起始指针Y = 事件.clientY
      const 起始位置X = 位置Ref.current.x
      const 起始位置Y = 位置Ref.current.y
      let 是否移动过 = false
      let 方向判定基准X = 起始指针X

      const onPointerMove = (移动事件: PointerEvent) => {
        const 位移X = 移动事件.clientX - 起始指针X
        const 位移Y = 移动事件.clientY - 起始指针Y

        if (!是否移动过) {
          if (Math.abs(位移X) + Math.abs(位移Y) < 点击阈值) {
            return
          }
          是否移动过 = true
          设置是否拖拽中(true)
          开始回调.current?.()
        }

        const 水平位移 = 移动事件.clientX - 方向判定基准X
        if (Math.abs(水平位移) >= 2) {
          const 新方向: 拖拽方向 = 水平位移 < 0 ? '左' : '右'
          方向判定基准X = 移动事件.clientX
          拖拽方向变化回调.current?.(新方向)
        }

        const 新X = 限制范围(起始位置X + 位移X, 尺寸?.宽 || 160, window?.innerWidth || 0)
        const 新Y = 限制范围(起始位置Y + 位移Y, 尺寸?.高 || 160, window?.innerHeight || 0)
        设置位置({ x: 新X, y: 新Y })
      }

      const onPointerUp = () => {
        if (是否移动过) {
          设置位置((当前位置) => {
            持久化位置(心法, 当前位置)
            return 当前位置
          })
          设置是否拖拽中(false)
          结束回调.current?.()
        } else {
          点击回调.current?.()
        }
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [启用, 尺寸, 心法],
  )

  return { 位置, 是否拖拽中, onPointerDown }
}
