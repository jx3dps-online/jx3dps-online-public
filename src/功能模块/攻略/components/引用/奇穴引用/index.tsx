import React from 'react'
import { Popover } from 'antd'
import { 获取奇穴数据映射, 兜底图片 } from '../../../工具'
import styles from '../引用样式.module.less'

interface 奇穴引用类型 {
  奇穴名称: string
  children: React.ReactNode
}

function 奇穴引用(props: 奇穴引用类型) {
  const { 奇穴名称, children } = props
  const 数据 = 获取奇穴数据映射()?.[奇穴名称]

  return (
    <Popover
      title={奇穴名称}
      zIndex={2200}
      trigger={['hover', 'focus']}
      content={
        数据 ? (
          <div className={styles['guide-qixue-ref-content']}>
            <img
              className={styles['guide-qixue-ref-img']}
              src={数据?.奇穴图片 || 兜底图片}
              alt={奇穴名称}
            />
            <span>{数据?.奇穴描述 || '暂无描述'}</span>
          </div>
        ) : (
          '暂无该奇穴数据'
        )
      }
    >
      <span className={styles['guide-ref']} tabIndex={0}>
        {children}
      </span>
    </Popover>
  )
}

export default 奇穴引用
