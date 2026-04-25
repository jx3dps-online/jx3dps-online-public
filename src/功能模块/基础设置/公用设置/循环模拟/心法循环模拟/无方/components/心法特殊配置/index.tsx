import { Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'

interface 心法特殊配制类型 {
  起手温寒: number
  更新起手温寒: (e: number) => void
  起手内力: number
  更新起手内力: (e: number) => void
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 起手温寒, 更新起手温寒, 起手内力, 更新起手内力, 忽略延迟技能, 更新忽略延迟技能 } = props

  const skillOptions = [
    '商陆缀寒',
    '川乌射罔',
    '钩吻断肠',
    '香繁饮露',
    '千枝绽蕊',
    '千枝伏藏',
    '唤醒',
    '损毁',
    '触发橙武',
    '特效腰坠',
  ]
  return (
    <>
      <span className={styles.label}>起手温寒</span>
      <Tooltip title='起手温寒' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手温寒}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 更新起手温寒(e)}
          options={按数字生成数组(11).map((a) => {
            const value = a - 6
            const label = value < 0 ? '寒性' : value > 0 ? '温性' : '中和'
            return {
              value: value,
              label: `${value === 0 ? '中和' : `${Math.abs(value)}点${label}`}`,
            }
          })}
        />
      </Tooltip>
      <span className={styles.label}>起手内力</span>
      <Tooltip title='起手内力' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手内力}
          style={{ width: 70 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={更新起手内力}
          options={Array.from({ length: 101 }, (v, i) => i).map((a) => {
            const value = 100 - a
            return {
              value: value,
              label: `${value}`,
            }
          })}
        />
      </Tooltip>
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
          mode='multiple'
          onChange={(e) => 更新忽略延迟技能(e)}
          options={skillOptions.map((skill) => ({
            value: skill,
            label: skill,
          }))}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
