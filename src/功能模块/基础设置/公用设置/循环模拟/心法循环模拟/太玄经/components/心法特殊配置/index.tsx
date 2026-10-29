import { Checkbox, Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新特殊配置 } from '@/store/data'

interface 心法特殊配制类型 {
  起手星运: number
  星运上限: number
  更新起手星运: (e: number) => void
  断御前星延迟: number
  更新断御前星延迟: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 起手星运, 星运上限, 更新起手星运, 断御前星延迟, 更新断御前星延迟 } = props
  const dispatch = useAppDispatch()
  const 武器切换功能启用 = useAppSelector((state) => state.data.特殊配置.武器切换功能启用 ?? true)

  return (
    <>
      <Checkbox
        checked={武器切换功能启用}
        onChange={(e) => dispatch(更新特殊配置({ 键: '武器切换功能启用', 值: e.target.checked }))}
      >
        武器切换
      </Checkbox>
      <span className={styles.label}>断御前星延迟</span>
      <Tooltip title='断前人为延迟损失' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={断御前星延迟}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 更新断御前星延迟(e)}
          options={按数字生成数组(5).map((a) => {
            return {
              value: a - 1,
              label: a - 1,
            }
          })}
        />
      </Tooltip>
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
          options={按数字生成数组(星运上限 / 5 + 1).map((a) => {
            const value = (a - 1) * 5
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
