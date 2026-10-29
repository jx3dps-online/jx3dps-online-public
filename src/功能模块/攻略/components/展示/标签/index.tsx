import React, { CSSProperties } from 'react'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import styles from './index.module.less'

interface 标签类型 {
  左?: React.ReactNode
  右?: React.ReactNode
  /** 缺省使用当前心法主题色 */
  色?: '绿色' | '蓝色'
}

function 标签(props: 标签类型) {
  const { 左, 右, 色 } = props
  const 主题色 = 获取当前数据()?.系统配置?.主题色

  if (!左 && !右) return null

  return (
    <span
      className={[
        styles['guide-tag'],
        色 === '绿色' ? styles['guide-tag-green'] : '',
        色 === '蓝色' ? styles['guide-tag-blue'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={!色 && 主题色 ? ({ '--guide-tag-color': 主题色 } as CSSProperties) : undefined}
    >
      {左 ? <span className={styles['guide-tag-left']}>{左}</span> : null}
      {右 ? <span className={styles['guide-tag-right']}>{右}</span> : null}
    </span>
  )
}

export default 标签
