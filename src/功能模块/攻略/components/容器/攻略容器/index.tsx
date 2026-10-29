import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Button } from 'antd'
import { FullscreenOutlined, FullscreenExitOutlined, CloseOutlined } from '@ant-design/icons'
import { 攻略展示上下文, 攻略展示模式 } from '../../../展示上下文'
import styles from './index.module.less'

interface 攻略容器类型 {
  children: React.ReactNode
  标题?: string
  标题居中?: boolean
  标题字号?: number
  /** 弹窗展示模式：全屏（默认）、对齐计算结果面板或居中小窗 */
  模式?: 攻略展示模式
}

interface 计算结果位置类型 {
  left: number
  top: number
  width: number
  height: number
}

function 攻略容器(props: 攻略容器类型) {
  const { children, 标题, 标题居中, 标题字号, 模式 = '全屏' } = props
  const { 默认全屏, 关闭, 计算结果节点 } = useContext(攻略展示上下文)
  const [全屏, 设置全屏] = useState(!!默认全屏)
  const [计算结果位置, 设置计算结果位置] = useState<计算结果位置类型>()

  const 使用计算结果尺寸 = !!默认全屏 && 模式 === '计算结果'
  const 使用居中小窗 = !!默认全屏 && 模式 === '居中小窗'

  useLayoutEffect(() => {
    if (!使用计算结果尺寸 || !计算结果节点) {
      设置计算结果位置(undefined)
      return
    }
    const 更新位置 = () => {
      const rect = 计算结果节点.getBoundingClientRect()
      设置计算结果位置({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      })
    }
    更新位置()
    const 观察器 = new ResizeObserver(更新位置)
    观察器.observe(计算结果节点)
    window.addEventListener('resize', 更新位置)
    return () => {
      观察器.disconnect()
      window.removeEventListener('resize', 更新位置)
    }
  }, [使用计算结果尺寸, 计算结果节点])

  const 退出 = () => {
    if (默认全屏) {
      关闭?.()
    } else {
      设置全屏(false)
    }
  }

  useEffect(() => {
    if (!全屏) return
    const 关闭全屏 = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (默认全屏) {
          关闭?.()
        } else {
          设置全屏(false)
        }
      }
    }
    document.addEventListener('keydown', 关闭全屏)
    return () => {
      document.removeEventListener('keydown', 关闭全屏)
    }
  }, [全屏, 默认全屏, 关闭])

  const 容器类名 = 使用居中小窗
    ? styles.居中小窗
    : 使用计算结果尺寸
      ? styles['guide-container-resultsize']
      : 全屏
        ? styles['guide-container-fullscreen']
        : ''

  const 容器样式 = 使用计算结果尺寸
    ? {
        left: 计算结果位置?.left,
        top: 计算结果位置?.top,
        width: 计算结果位置?.width,
        height: 计算结果位置?.height,
        visibility: 计算结果位置 ? undefined : ('hidden' as const),
      }
    : undefined

  return (
    <div className={`${styles['guide-container']} ${容器类名}`} style={容器样式}>
      <div
        className={`${styles['guide-container-header']} ${标题居中 ? styles['guide-container-header-center'] : ''}`}
      >
        <span
          className={`${styles['guide-container-title']} ${标题居中 ? styles['guide-container-title-center'] : ''}`}
          style={标题字号 ? { fontSize: 标题字号, lineHeight: 1.4 } : undefined}
        >
          {标题 || '攻略'}
        </span>
        {默认全屏 ? (
          <Button
            className={styles['guide-container-fullscreen-btn']}
            size='small'
            type='text'
            icon={<CloseOutlined />}
            onClick={退出}
          >
            关闭
          </Button>
        ) : (
          <Button
            className={styles['guide-container-fullscreen-btn']}
            size='small'
            type='text'
            icon={全屏 ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => 设置全屏(!全屏)}
          >
            {全屏 ? '退出全屏' : '全屏'}
          </Button>
        )}
      </div>
      <div className={styles['guide-container-scroll']}>
        <div className={styles['guide-container-content']}>{children}</div>
      </div>
    </div>
  )
}

export default 攻略容器
