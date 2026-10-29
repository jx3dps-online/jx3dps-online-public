import React, { ComponentType, Suspense } from 'react'
import { Spin } from 'antd'
import { 攻略展示上下文 } from './展示上下文'
import './攻略弹窗.css'

interface 攻略弹窗类型 {
  攻略组件?: ComponentType
  打开: boolean
  关闭: () => void
  计算结果节点?: HTMLElement | null
}

function 攻略弹窗(props: 攻略弹窗类型) {
  const { 攻略组件, 打开, 关闭, 计算结果节点 } = props
  if (!打开 || !攻略组件) return null
  const 组件 = 攻略组件
  return (
    <攻略展示上下文.Provider value={{ 默认全屏: true, 关闭, 计算结果节点 }}>
      <div className='jx3-guide-modal-backdrop' onClick={关闭} />
      <Suspense
        fallback={
          <div className='jx3-guide-modal-loading'>
            <Spin size='large' />
          </div>
        }
      >
        <组件 />
      </Suspense>
    </攻略展示上下文.Provider>
  )
}

export default 攻略弹窗
