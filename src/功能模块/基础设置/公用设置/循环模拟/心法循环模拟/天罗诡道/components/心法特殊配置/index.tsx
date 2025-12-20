import { Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'

interface 心法特殊配制类型 {
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 忽略延迟技能, 更新忽略延迟技能 } = props

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
          options={[
            '鬼斧神工',
            '暗藏杀机',
            '飞星遁影',
            '连弩',
            '心无旁骛',
            '触发橙武',
            '特效腰坠',
          ].map((a) => {
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
