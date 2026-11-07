import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { 桌宠资源 } from './interface'
import { 获取播放资源, 预加载资源组 } from './工具/资源加载'
import { 解析尺寸为像素 } from './工具/尺寸'
import type { 桌宠像素尺寸 } from './工具/尺寸'
import styles from './index.module.less'

interface 渲染参数 {
  资源?: 桌宠资源
  激活标识: string
  尺寸: 桌宠像素尺寸
  屏宽: number
  on加载完成: (资源: 桌宠资源, 已播放毫秒?: number) => void
  on加载失败: (资源: 桌宠资源) => void
}

const 释放媒体 = (媒体: HTMLImageElement | HTMLVideoElement) => {
  媒体.onload = null
  媒体.onerror = null
  if (媒体 instanceof HTMLVideoElement) {
    媒体.onloadeddata = null
    媒体.pause()
    媒体.removeAttribute('src')
    媒体.load()
  } else {
    媒体.removeAttribute('src')
  }
}

const 单个资源 = ({
  资源,
  激活标识,
  尺寸,
  on加载完成,
  on加载失败,
}: Omit<渲染参数, '屏宽'> & { 资源: 桌宠资源 }) => {
  const 容器Ref = useRef<HTMLSpanElement>(null)
  const 回调Ref = useRef({ on加载完成, on加载失败 })
  回调Ref.current = { on加载完成, on加载失败 }

  useLayoutEffect(() => {
    const 容器 = 容器Ref.current!
    return () => {
      const 媒体 = 容器.firstElementChild as HTMLImageElement | HTMLVideoElement | null
      if (媒体) 释放媒体(媒体)
      容器.replaceChildren()
    }
  }, [])

  useLayoutEffect(() => {
    const 容器 = 容器Ref.current!
    let 已取消 = false
    let 处理当前可见性: (() => void) | undefined
    let 清理本次 = () => {}

    const 加载 = (候选: 桌宠资源, 已用回退: boolean) => {
      if (已取消) return
      清理本次()
      let 有效 = true
      let 已就绪 = false
      let 绘制回调: number | undefined
      let 视频回调: number | undefined
      const 媒体 = 候选.类型 === 'webm' ? document.createElement('video') : new Image()
      媒体.className = styles.petImg
      媒体.draggable = false

      const 失败 = () => {
        if (已取消 || !有效) return
        清理本次()
        if (!已用回退 && 资源.兼容资源) {
          加载(资源.兼容资源, true)
        } else {
          const 旧媒体 = 容器.firstElementChild as HTMLImageElement | HTMLVideoElement | null
          if (旧媒体) 释放媒体(旧媒体)
          容器.replaceChildren()
          回调Ref.current.on加载失败(资源)
        }
      }
      let 截止定时器: number | undefined
      let 剩余等待 = 3000
      let 开始等待 = 0
      let 待显示: (() => void) | undefined
      let 恢复播放: (() => void) | undefined
      const 暂停截止 = () => {
        if (截止定时器 === undefined) return
        window.clearTimeout(截止定时器)
        截止定时器 = undefined
        剩余等待 -= performance.now() - 开始等待
      }
      const 恢复截止 = () => {
        if (已就绪 || 截止定时器 !== undefined) return
        开始等待 = performance.now()
        截止定时器 = window.setTimeout(失败, Math.max(0, 剩余等待))
      }
      处理当前可见性 = () => {
        if (已取消 || !有效) return
        if (document.hidden) {
          暂停截止()
          if (媒体 instanceof HTMLVideoElement) 媒体.pause()
        } else {
          恢复截止()
          if (待显示) {
            const 显示 = 待显示
            待显示 = undefined
            显示()
          } else if (
            媒体 instanceof HTMLVideoElement &&
            媒体 === 容器.firstElementChild &&
            !媒体.ended
          ) {
            恢复播放?.()
          }
        }
      }
      if (!document.hidden) 恢复截止()
      清理本次 = () => {
        有效 = false
        暂停截止()
        if (绘制回调 !== undefined) cancelAnimationFrame(绘制回调)
        if (媒体 instanceof HTMLVideoElement) {
          if (视频回调 !== undefined) 媒体.cancelVideoFrameCallback(视频回调)
          媒体.onloadeddata = null
          媒体.pause()
        }
        媒体.onload = null
        媒体.onerror = null
        if (媒体 !== 容器.firstElementChild) 释放媒体(媒体)
      }
      const 就绪 = (已播放毫秒 = 0) => {
        if (已取消 || !有效 || 已就绪) return
        已就绪 = true
        暂停截止()
        回调Ref.current.on加载完成(资源, 已播放毫秒)
      }
      const 替换显示 = () => {
        if (已取消 || !有效) return
        const 旧媒体 = 容器.firstElementChild as HTMLImageElement | HTMLVideoElement | null
        容器.replaceChildren(媒体)
        if (旧媒体 && 旧媒体 !== 媒体) 释放媒体(旧媒体)
      }
      媒体.onerror = 失败
      if (媒体 instanceof HTMLVideoElement) {
        媒体.muted = true
        媒体.playsInline = true
        媒体.loop = 候选.循环 ?? true
        媒体.preload = 'auto'
        媒体.setAttribute('aria-label', '桌宠')
        const 显示视频 = () => {
          if (已取消 || !有效) return
          let 已播放 = false
          let 首帧: { 媒体时间: number; 呈现时间: number } | undefined
          const 确认首帧 = () => {
            if (已播放 && 首帧) {
              就绪(首帧.媒体时间 + Math.max(0, performance.now() - 首帧.呈现时间))
            }
          }
          if (typeof 媒体.requestVideoFrameCallback === 'function') {
            视频回调 = 媒体.requestVideoFrameCallback((_, 帧) => {
              首帧 = { 媒体时间: 帧.mediaTime * 1000, 呈现时间: 帧.expectedDisplayTime }
              确认首帧()
            })
          } else {
            绘制回调 = requestAnimationFrame(() => {
              首帧 = { 媒体时间: 媒体.currentTime * 1000, 呈现时间: performance.now() }
              确认首帧()
            })
          }
          替换显示()
          恢复播放 = () => {
            媒体.play().then(
              () => {
                已播放 = true
                确认首帧()
              },
              (错误: DOMException) => {
                if (!(document.hidden && 错误.name === 'AbortError')) 失败()
              },
            )
          }
          恢复播放()
        }
        媒体.onloadeddata = () => {
          媒体.onloadeddata = null
          if (document.hidden) 待显示 = 显示视频
          else 显示视频()
        }
        媒体.src = 候选.资源
        媒体.load()
      } else {
        媒体.alt = '桌宠'
        媒体.onload = () => {
          const 显示图片 = () => {
            替换显示()
            绘制回调 = requestAnimationFrame(() => 就绪())
          }
          if (document.hidden) 待显示 = 显示图片
          else 显示图片()
        }
        媒体.src = 候选.资源
      }
    }
    获取播放资源(资源).then((候选) => 加载(候选, 候选 !== 资源))
    const 处理可见性 = () => 处理当前可见性?.()
    document.addEventListener('visibilitychange', 处理可见性)
    return () => {
      已取消 = true
      清理本次()
      document.removeEventListener('visibilitychange', 处理可见性)
    }
  }, [资源, 激活标识])

  return <span ref={容器Ref} style={{ display: 'block', width: 尺寸.宽, height: 尺寸.高 }} />
}

const 渲染资源 = ({ 资源, 激活标识, 尺寸, 屏宽, ...回调 }: 渲染参数) => {
  const [播放位置, 设置播放位置] = useState({ 资源, 激活标识, 帧: 0 })
  const 帧序号 = 播放位置.资源 === 资源 && 播放位置.激活标识 === 激活标识 ? 播放位置.帧 : 0
  const 序列 = 资源?.类型 === '序列帧' ? 资源.序列帧 : undefined

  useEffect(() => {
    设置播放位置({ 资源, 激活标识, 帧: 0 })
    if (!序列 || 序列.帧.length <= 1) return
    const 定时器 = setInterval(() => {
      设置播放位置((当前位置) => ({
        资源,
        激活标识,
        帧:
          当前位置.帧 + 1 < 序列.帧.length
            ? 当前位置.帧 + 1
            : 序列.循环 !== false
              ? 0
              : 当前位置.帧,
      }))
    }, 序列.间隔毫秒)
    return () => clearInterval(定时器)
  }, [资源, 激活标识, 序列])

  useEffect(() => {
    if (序列) return 预加载资源组([序列.帧[帧序号 + 1]])
  }, [序列, 帧序号])

  const 当前资源 = useMemo(() => {
    const 当前项 = 序列 ? 序列.帧[帧序号] : 资源
    return typeof 当前项 === 'string' ? { 资源: 当前项 } : 当前项
  }, [序列, 帧序号, 资源])
  if (!当前资源) return null
  const 实际尺寸 = 解析尺寸为像素(当前资源.尺寸 || 资源?.尺寸, 屏宽, 尺寸)
  return <单个资源 资源={当前资源} 激活标识={激活标识 + ':' + 帧序号} 尺寸={实际尺寸} {...回调} />
}

export default 渲染资源
