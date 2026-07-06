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
  周期性忽略延迟: number | undefined
  更新周期性忽略延迟: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    起手温寒,
    更新起手温寒,
    起手内力,
    更新起手内力,
    忽略延迟技能,
    更新忽略延迟技能,
    周期性忽略延迟,
    更新周期性忽略延迟,
  } = props

  const skillOptions = [
    '商陆缀寒',
    '川乌射罔',
    '钩吻断肠',
    '香繁饮露',
    '沾衣未妨',
    '千枝绽蕊',
    '千枝伏藏',
    '易命',
    '损毁',
    // '磁雷外泄',
    '万灵丹',
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
              mode='multiple'
              onChange={(e) => 更新忽略延迟技能(e)}
              options={skillOptions.map((skill) => ({
                value: skill,
                label: skill,
              }))}
            />
          </Tooltip>
        </>
      )}
      <span className={styles.label}>周期性忽略延迟</span>
      <Tooltip
        title={
          '按固定比例周期性地跳过延迟。关闭则不跳过；0.25表示约80%技能跳过延迟；0.5表示约67%技能跳过延迟；1表示每隔1个技能跳过延迟；2表示每3个技能跳过1次延迟；数值越大跳过越少。启用时将替代按技能忽略延迟。'
        }
        placement='left'
      >
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={周期性忽略延迟}
          style={{ width: 70 }}
          showSearch
          popupMatchSelectWidth={70}
          placeholder={'关闭'}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(value) => 更新周期性忽略延迟(value ? Number(value) : 0)}
          options={[0, 0.25, 0.5, 1, 2, 3].map((num) => ({
            value: num,
            label: num === 0 ? '关闭' : String(num),
          }))}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
