import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Segmented, Space, Tag } from 'antd'
import { 生成id } from '@/工具函数/本地存储'
import type { 攻略文档 } from './类型'
import styles from './index.module.less'

export default function 预览面板({ 文档 }: { 文档: 攻略文档 }) {
  const 帧 = useRef<HTMLIFrameElement>(null)
  const 容器 = useRef<HTMLDivElement>(null)
  const [重试, 设置重试] = useState(0)
  const [宽度, 设置宽度] = useState(0)
  const [容器宽度, 设置容器宽度] = useState(600)
  const [就绪, 设置就绪] = useState(false)
  const [超时, 设置超时] = useState(false)
  const 序号 = useRef(0)
  const 最新文档 = useRef(文档)
  最新文档.current = 文档
  const 通道 = useMemo(生成id, [文档.心法, 重试])
  const 地址 = useMemo(() => {
    const 参数 = new URLSearchParams({ channel: 通道, heart: 文档.心法 })
    if (process.env.REACT_APP_BUILD_TYPE === 'local') {
      参数.set('guide-preview', '1')
      return `${window.location.pathname}?${参数}`
    }
    return `/guide-editor/preview?${参数}`
  }, [通道, 文档.心法])
  const 发送 = () =>
    帧.current?.contentWindow?.postMessage(
      { 类型: '攻略文档', 通道, 序号: ++序号.current, 文档: 最新文档.current },
      window.location.origin === 'null' ? '*' : window.location.origin,
    )
  useEffect(() => {
    设置就绪(false)
    设置超时(false)
    const 等待 = window.setTimeout(() => 设置超时(true), 20000)
    const 接收 = (事件: MessageEvent) => {
      if (
        事件.source !== 帧.current?.contentWindow ||
        事件.origin !== window.location.origin ||
        事件.data?.通道 !== 通道 ||
        事件.data?.类型 !== '攻略预览就绪'
      )
        return
      window.clearTimeout(等待)
      设置超时(false)
      设置就绪(true)
      发送()
    }
    window.addEventListener('message', 接收)
    return () => {
      window.clearTimeout(等待)
      window.removeEventListener('message', 接收)
    }
  }, [通道])
  useEffect(() => {
    if (!就绪) return
    const 定时 = window.setTimeout(发送, 250)
    return () => window.clearTimeout(定时)
  }, [文档, 就绪])
  useEffect(() => {
    const 观察 = new ResizeObserver(([结果]) => 设置容器宽度(Math.max(1, 结果.contentRect.width)))
    观察.observe(容器.current!)
    return () => 观察.disconnect()
  }, [])
  const 实际宽度 = 宽度 || 容器宽度
  const 比例 = Math.min(1, 容器宽度 / 实际宽度)
  return (
    <section className={styles.预览面板}>
      <header className={styles.面板标题}>
        <Space>
          <strong>实时预览</strong>
          <Tag color='blue'>真实组件</Tag>
        </Space>
        <Button size='small' type='text' onClick={() => 设置重试((值) => 值 + 1)}>
          重新加载
        </Button>
      </header>
      <div className={styles.预览工具}>
        <Segmented
          size='small'
          value={宽度}
          options={[
            { label: '自适应', value: 0 },
            { label: '1080px', value: 1080 },
            { label: '1920px', value: 1920 },
          ]}
          onChange={(值) => 设置宽度(Number(值))}
        />
        <span>{文档.模式 === '计算结果' ? '结果面板参考尺寸 · 只读' : '全屏弹窗 · 只读'}</span>
      </div>
      {超时 && <Alert type='warning' message='预览加载较慢或失败，可点击重新加载重试' />}
      <div ref={容器} className={styles.预览窗口}>
        <iframe
          key={通道}
          ref={帧}
          src={地址}
          title='攻略实时预览'
          allow='clipboard-write; fullscreen'
          style={{ width: 实际宽度, height: `${100 / 比例}%`, transform: `scale(${比例})` }}
        />
      </div>
    </section>
  )
}
