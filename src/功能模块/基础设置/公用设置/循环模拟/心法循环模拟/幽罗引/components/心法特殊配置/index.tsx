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

  const skillOptions = [
    '挑丝',
    '绊线',
    '勾线',
    '夹线',
    '生地狱',
    '千里急',
    '应天长',
    '障幕虚影',
    '连环慢',
    '落笼簿',
    '触发橙武',
    '特效腰坠',
  ]

  return (
    <>
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
          style={{ minWidth: 80 }}
          showSearch
          popupMatchSelectWidth={80}
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
