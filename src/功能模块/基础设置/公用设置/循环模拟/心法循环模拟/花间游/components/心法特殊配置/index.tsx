import { Checkbox, Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'

interface 心法特殊配制类型 {
  显示涓流层数: boolean
  更新显示涓流层数: (e: boolean) => void
  断快雪延迟: number
  更新断快雪延迟: (e: number) => void
  起手临源: number
  更新起手临源: (e: number) => void
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    显示涓流层数,
    更新显示涓流层数,
    断快雪延迟,
    更新断快雪延迟,
    起手临源,
    更新起手临源,
    忽略延迟技能,
    更新忽略延迟技能,
  } = props

  return (
    <>
      <span className={styles.label}>断快雪延迟</span>
      <Tooltip title='断快雪人为延迟损失' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={断快雪延迟}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 更新断快雪延迟(e)}
          options={按数字生成数组(5).map((a) => {
            return {
              value: a - 1,
              label: a - 1,
            }
          })}
        />
      </Tooltip>
      <Checkbox checked={显示涓流层数} onChange={(e) => 更新显示涓流层数(e.target.checked)}>
        显示涓流层数
      </Checkbox>
      <span className={styles.label}>起手临源</span>
      <Tooltip title='起手临源' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手临源}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 更新起手临源(e)}
          options={按数字生成数组(20).map((a) => {
            return {
              value: a - 1,
              label: a - 1,
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
          mode={'multiple'}
          onChange={(e) => 更新忽略延迟技能(e)}
          options={['商阳指', '阳明指', '钟林毓秀', '兰摧玉折', '玉石俱焚'].map((a) => {
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
