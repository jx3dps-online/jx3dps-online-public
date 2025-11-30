import { Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'

interface 心法特殊配制类型 {
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 忽略延迟技能, 更新忽略延迟技能 } =
    props

  return (
    <>
      <span className={styles.label}>忽略延迟</span>
      <Tooltip title='以下技能计算时忽略延迟影响' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={忽略延迟技能}
          style={{ minWidth: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          placeholder={'无设置'}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          mode={'multiple'}
          onChange={(e) => 更新忽略延迟技能(e)}
          options={['天绝地灭','星离雨散','暗藏杀机','蚀肌弹','飞星遁影'].map((a) => {
            return {
              value: a,
              label: a,
            }
          })}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
