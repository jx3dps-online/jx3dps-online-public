import { Select, Tooltip, Checkbox } from 'antd'
import styles from './index.module.less'
import React from 'react'

interface 心法特殊配制类型 {
  五十血以下: boolean
  更新五十血以下: (e: boolean) => void
  显示龙牙龙驭层数: boolean
  更新显示龙牙龙驭层数: (e: boolean) => void
  周期性忽略延迟: number | undefined
  更新周期性忽略延迟: (e: number) => void
  显示无龙驭马上龙牙: boolean
  更新显示无龙驭马上龙牙: (e: boolean) => void
  显示雷覆盖: boolean
  更新显示雷覆盖: (e: boolean) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    五十血以下,
    更新五十血以下,
    显示龙牙龙驭层数,
    更新显示龙牙龙驭层数,
    周期性忽略延迟,
    更新周期性忽略延迟,
    显示无龙驭马上龙牙,
    更新显示无龙驭马上龙牙,
    显示雷覆盖,
    更新显示雷覆盖,
  } = props
  return (
    <>
      <Checkbox checked={显示雷覆盖} onChange={(e) => 更新显示雷覆盖(e.target.checked)}>
        更新显示雷覆盖
      </Checkbox>
      <Checkbox checked={显示龙牙龙驭层数} onChange={(e) => 更新显示龙牙龙驭层数(e.target.checked)}>
        显示龙牙龙驭层数
      </Checkbox>
      <Checkbox checked={五十血以下} onChange={(e) => 更新五十血以下(e.target.checked)}>
        <b>自身</b>
        血量低于50%
      </Checkbox>
      <Checkbox
        checked={显示无龙驭马上龙牙}
        onChange={(e) => 更新显示无龙驭马上龙牙(e.target.checked)}
      >
        显示无龙驭马上龙牙
      </Checkbox>
      <span className={styles.label}>周期免延迟比例</span>
      <Tooltip title='有效GCD衔接的基础免延迟比例' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={周期性忽略延迟}
          style={{ width: 90 }}
          showSearch
          popupMatchSelectWidth={90}
          placeholder={'关闭'}
          filterOption={(input, option) => {
            return option?.label?.includes(input) || false
          }}
          onChange={(value) => 更新周期性忽略延迟(value ? Number(value) : 0)}
          options={[0, 0.25, 0.5, 1, 2, 3].map((num) => ({
            value: num,
            label: num === 0 ? '关闭' : `${Number((100 / (num + 1)).toFixed(1))}%`,
          }))}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
