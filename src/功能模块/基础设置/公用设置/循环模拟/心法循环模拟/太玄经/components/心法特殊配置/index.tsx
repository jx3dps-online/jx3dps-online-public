import { Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'

interface 心法特殊配制类型 {
  起手星运: number
  更新起手星运: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 起手星运, 更新起手星运 } = props

  return (
    <>
      <span className={styles.label}>起手星运</span>
      <Tooltip title='起手星运' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手星运}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 更新起手星运(e)}
          options={按数字生成数组(101).map((value) => {
            return {
              value: value,
              label: `${value}星运`,
            }
          })}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
