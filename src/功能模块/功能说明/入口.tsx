import React, { useState } from 'react'
import { Modal } from 'antd'
import type { 说明定位 } from './类型'
import 异步内容 from './异步内容'
import styles from './index.module.less'

const 加载说明 = () => import('./index')

export default function 功能说明入口({
  children = '功能说明',
  渲染入口,
  ...初始定位
}: 说明定位 & { children?: React.ReactNode; 渲染入口?: (打开: () => void) => React.ReactNode }) {
  const [打开, 设置打开] = useState(false)
  const [定位, 设置定位] = useState<说明定位>(初始定位)
  const 参数 = new URLSearchParams()
  if (初始定位.文档) 参数.set('doc', 初始定位.文档)
  if (初始定位.章节) 参数.set('section', 初始定位.章节)
  if (初始定位.心法) 参数.set('xf', 初始定位.心法)
  if (process.env.REACT_APP_BUILD_TYPE !== 'local') {
    if (渲染入口)
      return <>{渲染入口(() => window.open(`/help?${参数}`, '_blank', 'noopener,noreferrer'))}</>
    return (
      <a className={styles.entry} href={`/help?${参数}`} target='_blank' rel='noopener noreferrer'>
        {children}
      </a>
    )
  }
  return (
    <>
      {渲染入口 ? (
        渲染入口(() => {
          设置定位(初始定位)
          设置打开(true)
        })
      ) : (
        <button
          className={styles.entry}
          type='button'
          onClick={() => {
            设置定位(初始定位)
            设置打开(true)
          }}
        >
          {children}
        </button>
      )}
      <Modal
        title='功能说明'
        open={打开}
        onCancel={() => 设置打开(false)}
        footer={null}
        width={1100}
        destroyOnClose
      >
        {打开 && <异步内容 加载={加载说明} 参数={{ 定位, on定位: 设置定位 }} />}
      </Modal>
    </>
  )
}
