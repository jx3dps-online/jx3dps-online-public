import { Checkbox, Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'

interface 心法特殊配制类型 {
  显示标鹄层数: boolean
  更新显示标鹄层数: (e: boolean) => void
  显示领胡覆盖: boolean
  更新显示领胡覆盖: (e: boolean) => void
  显示连珠覆盖: boolean
  更新显示连珠覆盖: (e: boolean) => void
  起手唤灵印数量: number
  更新起手唤灵印数量: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    显示标鹄层数,
    更新显示标鹄层数,
    显示领胡覆盖,
    更新显示领胡覆盖,
    显示连珠覆盖,
    更新显示连珠覆盖,
    起手唤灵印数量,
    更新起手唤灵印数量,
  } = props

  return (
    <>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示连珠覆盖}
        onChange={(e) => 更新显示连珠覆盖(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的连珠'>显示连珠覆盖</Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示领胡覆盖}
        onChange={(e) => 更新显示领胡覆盖(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的领胡'>显示领胡覆盖</Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示标鹄层数}
        onChange={(e) => 更新显示标鹄层数(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的标鹄层数'>显示标鹄层数</Tooltip>
      </Checkbox>
      <span className={styles.label}>起手唤灵印</span>
      <Tooltip title='起手唤灵印' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手唤灵印数量}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 更新起手唤灵印数量(e)}
          options={按数字生成数组(7).map((a) => {
            return {
              value: a - 1,
              label: `${a - 1} 个`,
            }
          })}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
