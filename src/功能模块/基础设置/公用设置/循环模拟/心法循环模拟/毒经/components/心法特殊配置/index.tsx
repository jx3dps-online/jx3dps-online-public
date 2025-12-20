import { Select, Tooltip } from 'antd'
import styles from './index.module.less'
import React from 'react'

interface 心法特殊配制类型 {
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  周期性忽略延迟: number | undefined
  更新周期性忽略延迟: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 忽略延迟技能, 更新忽略延迟技能, 周期性忽略延迟, 更新周期性忽略延迟 } = props

  const numericOptions = ['0', 1 / 4, 1 / 2, '1', '2', '3']
  const skillOptions = [
    '蝎心',
    '蛇影',
    '百足',
    '千丝',
    '蟾啸',
    '蛊虫献祭',
    '灵蛊',
    '凤凰蛊',
    '降厄',
    '连缘蛊',
    '触发橙武',
    '特效腰坠',
  ]

  return (
    <>
      <span className={styles.label}>周期性忽略延迟</span>
      <Tooltip
        title='每间隔 x 个技能，忽略一次延迟，当低于 1 时，将连续间隔多个技能。当启用时将不再支持按技能忽略延迟。部分情况（如降厄连蝎）下忽略指定技能将造成部分技能的期望收益偏高，使用此功能来避免这一情况。'
        placement='left'
      >
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={周期性忽略延迟}
          style={{ minWidth: 80 }}
          showSearch
          popupMatchSelectWidth={80}
          placeholder={'无设置'}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(value) => 更新周期性忽略延迟(value ? Number(value) : 0)}
          options={numericOptions.map((num) => ({
            value: num,
            label: num,
          }))}
        />
      </Tooltip>

      {/* 只在周期性延迟为0时显示技能忽略延迟 */}
      {(!周期性忽略延迟 || 周期性忽略延迟 <= 0) && (
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
              options={skillOptions.map((skill) => ({
                value: skill,
                label: skill,
              }))}
            />
          </Tooltip>
        </>
      )}
    </>
  )
}

export default 心法特殊配置
