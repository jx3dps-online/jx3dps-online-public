import React from 'react'
import { InputNumber, Select } from 'antd'
import styles from './index.module.less'

interface 心法特殊配置属性 {
  起手内力: number
  设置起手内力: (值: number) => void
  起手醉意: number
  设置起手醉意: (值: number) => void
}

function 心法特殊配置({ 起手内力, 设置起手内力, 起手醉意, 设置起手醉意 }: 心法特殊配置属性) {
  return (
    <>
      <span className={styles.label}>起手内力（%）</span>
      <InputNumber
        size='small'
        min={0}
        max={100}
        value={起手内力}
        onChange={(值) => 设置起手内力(值 ?? 100)}
      />
      <span className={styles.label}>起手醉意</span>
      <Select
        size='small'
        value={起手醉意}
        onChange={设置起手醉意}
        options={[0, 1, 2, 3].map((值) => ({ value: 值, label: `${值} 层` }))}
      />
    </>
  )
}

export default 心法特殊配置
