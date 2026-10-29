import React from 'react'
import { Tooltip } from 'antd'
import { 获取奇穴数据映射, 兜底图片 } from '../../../工具'
import styles from './index.module.less'

interface 奇穴图标类型 {
  奇穴名称: string
}

function 奇穴图标(props: 奇穴图标类型) {
  const { 奇穴名称 } = props
  const 数据 = 获取奇穴数据映射()?.[奇穴名称]

  return (
    <Tooltip title={数据?.奇穴描述 || 奇穴名称}>
      <span className={styles['guide-qixue-icon']}>
        <img
          className={styles['guide-qixue-icon-img']}
          src={数据?.奇穴图片 || 兜底图片}
          alt={奇穴名称}
        />
        <span className={styles['guide-qixue-icon-name']}>{奇穴名称}</span>
      </span>
    </Tooltip>
  )
}

export default 奇穴图标
