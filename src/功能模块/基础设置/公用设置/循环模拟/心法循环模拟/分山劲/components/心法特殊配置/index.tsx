import React from 'react'
import styles from './index.module.less'
import { Checkbox, Select, Tooltip } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'
interface 心法特殊配制类型 {
  起手怒气: number
  设置起手怒气: (e: number) => void
  // 起手体态: '擎盾' | '擎刀'
  // 设置起手体态: (e: '擎盾' | '擎刀') => void
  // 显示绝刀怒气: boolean
  // 更新显示绝刀怒气: (e: boolean) => void
  显示释放时援戈层数: boolean
  更新释放时援戈层数: (e: boolean) => void
  显示怒气: boolean
  设置显示怒气: (e: boolean) => void
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  // const { 显示绝刀怒气, 更新显示绝刀怒气, 起手怒气, 设置起手怒气 } = props
  const {
    显示释放时援戈层数,
    更新释放时援戈层数,
    显示怒气,
    设置显示怒气,
    起手怒气,
    设置起手怒气,
    忽略延迟技能,
    更新忽略延迟技能,
  } = props

  return (
    <>
      <span className={styles.label}>忽略延迟</span>
      <Tooltip title='以下技能计算时忽略延迟影响'>
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
          options={['血怒', '触发橙武', '特效腰坠'].map((a) => {
            return {
              value: a,
              label: a,
            }
          })}
        />
      </Tooltip>
      <Checkbox
        style={{ marginLeft: 12 }}
        // checked={显示绝刀怒气}
        // onChange={(e) => 更新显示绝刀怒气(e?.target?.checked)}
        checked={显示释放时援戈层数}
        onChange={(e) => 更新释放时援戈层数(e?.target?.checked)}
      >
        {/* <Tooltip title='显示释放绝刀消耗的怒气'>显示绝刀怒气</Tooltip> */}
        <Tooltip title='开启后显示技能释放之时的援戈层数'>显示释放时援戈层数</Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        // checked={显示绝刀怒气}
        // onChange={(e) => 更新显示绝刀怒气(e?.target?.checked)}
        checked={显示怒气}
        onChange={(e) => 设置显示怒气(e?.target?.checked)}
      >
        {/* <Tooltip title='显示释放绝刀消耗的怒气'>显示绝刀怒气</Tooltip> */}
        <Tooltip title='开启后显示技能释放之时的怒气'>显示释放时怒气</Tooltip>
      </Checkbox>
      <span className={styles.label}>设置起手怒气</span>
      <Tooltip title='起手怒气'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手怒气}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 设置起手怒气(e)}
          options={按数字生成数组(21).map((a) => {
            const value = (a - 1) * 5
            return {
              value: value,
              label: `${value} 怒气`,
            }
          })}
        />
      </Tooltip>
      {/* <span className={styles.label}>起手体态</span> */}
      {/* <Select
        size='small'
        className={'cycle-simulator-header-select'}
        value={起手体态}
        style={{ width: 120 }}
        popupMatchSelectWidth={120}
        onChange={(e) => 设置起手体态(e)}
        options={[
          { value: '擎盾', label: '擎盾' },
          { value: '擎刀', label: '擎刀' },
        ]}
      /> */}
    </>
  )
}

export default 心法特殊配置
