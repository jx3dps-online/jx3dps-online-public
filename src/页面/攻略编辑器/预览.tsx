import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Alert, Spin } from 'antd'
import { 初始化心法数据 } from '@/数据/数据工具/获取当前数据'
import type { 数据类型 } from '@/@types/数据'
import type { 攻略文档 } from '@/功能模块/攻略编辑器/类型'
import { 导入文档, 心法列表 } from '@/功能模块/攻略编辑器/文档'

const 内容 = lazy(() => import('@/功能模块/攻略编辑器/预览内容'))

class 渲染保护 extends React.Component<
  { children: React.ReactNode; 版本: number },
  { 错误: string }
> {
  state = { 错误: '' }
  static getDerivedStateFromError(错误: Error) {
    return { 错误: 错误.message }
  }
  componentDidUpdate(旧: { 版本: number }) {
    if (旧.版本 !== this.props.版本 && this.state.错误) this.setState({ 错误: '' })
  }
  render() {
    return this.state.错误 ? (
      <Alert type='error' message='此内容暂时无法预览' description={this.state.错误} />
    ) : (
      this.props.children
    )
  }
}

export default function 预览页面() {
  const [数据, 设置数据] = useState<数据类型>()
  const [文档, 设置文档] = useState<攻略文档>()
  const [错误, 设置错误] = useState('')
  const [版本, 设置版本] = useState(0)
  useEffect(() => {
    const 参数 = new URLSearchParams(window.location.search)
    const 心法 = 参数.get('heart') || ''
    const 通道 = 参数.get('channel') || ''
    if (window.parent === window || !通道 || !心法列表.includes(心法)) {
      设置错误('请从攻略编辑器打开预览')
      return
    }
    let 取消 = false
    let 序号 = 0
    const 接收 = (事件: MessageEvent) => {
      if (
        事件.source !== window.parent ||
        事件.origin !== window.location.origin ||
        事件.data?.通道 !== 通道 ||
        事件.data?.类型 !== '攻略文档' ||
        typeof 事件.data.序号 !== 'number' ||
        事件.data.序号 <= 序号
      )
        return
      序号 = 事件.data.序号
      try {
        const 新文档 = 导入文档(JSON.stringify(事件.data.文档))
        if (新文档.心法 !== 心法) throw new Error('预览心法不匹配')
        设置文档(新文档)
        设置错误('')
        设置版本(序号)
      } catch (异常) {
        设置错误((异常 as Error).message)
      }
    }
    window.addEventListener('message', 接收)
    初始化心法数据(心法)
      .then((结果) => {
        if (取消) return
        设置数据(结果)
        window.parent.postMessage(
          { 类型: '攻略预览就绪', 通道 },
          window.location.origin === 'null' ? '*' : window.location.origin,
        )
      })
      .catch((异常) => {
        if (!取消) 设置错误((异常 as Error).message)
      })
    return () => {
      取消 = true
      window.removeEventListener('message', 接收)
    }
  }, [])
  if (错误)
    return (
      <Alert
        type='error'
        showIcon
        message='请修正内容后继续预览'
        description={错误}
        style={{ margin: 20 }}
      />
    )
  return (
    <div style={{ padding: 20, height: '100vh', boxSizing: 'border-box', background: '#f4f6f9' }}>
      <Suspense fallback={<Spin tip='加载真实攻略组件…' />}>
        <渲染保护 版本={版本}>
          {数据 && 文档 ? <内容 数据={数据} 文档={文档} /> : <Spin tip='正在准备攻略预览…' />}
        </渲染保护>
      </Suspense>
    </div>
  )
}
