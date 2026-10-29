import { Button, Checkbox, Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'
import 循环模拟技能基础数据 from '../../constant/skill'

interface 心法特殊配制类型 {
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  周期性忽略延迟: number | undefined
  更新周期性忽略延迟: (e: number) => void
  启用回蓝五彩石: boolean
  更新启用回蓝五彩石: (启用: boolean) => void
  已手动调整回蓝五彩石: boolean
  恢复跟随配装: () => void
}

interface 起手配置类型 {
  起手温寒: number
  更新起手温寒: (e: number) => void
  起手内力: number
  更新起手内力: (e: number) => void
}

export function 起手配置(props: 起手配置类型) {
  const { 起手温寒, 更新起手温寒, 起手内力, 更新起手内力 } = props
  return (
    <>
      <span className={styles.label}>起手药性</span>
      <Tooltip title='起手药性' placement='left'>
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
    </>
  )
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    忽略延迟技能,
    更新忽略延迟技能,
    周期性忽略延迟,
    更新周期性忽略延迟,
    启用回蓝五彩石,
    更新启用回蓝五彩石,
    已手动调整回蓝五彩石,
    恢复跟随配装,
  } = props

  const skillOptions = 循环模拟技能基础数据.filter((技能) => 技能.是否为倒读条技能)
  return (
    <>
      <Checkbox
        className={styles.潮生}
        checked={启用回蓝五彩石}
        onChange={(e) => 更新启用回蓝五彩石(e.target.checked)}
      >
        潮生（{已手动调整回蓝五彩石 ? '已手动覆盖' : '跟随配装'}）
      </Checkbox>
      {已手动调整回蓝五彩石 && (
        <Button type='link' size='small' onClick={恢复跟随配装}>
          恢复跟随配装
        </Button>
      )}
      <span className={styles.label}>倒读条忽略延迟</span>
      <Tooltip title='完整倒读条后的衔接延迟补偿' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={忽略延迟技能}
          style={{ minWidth: 150 }}
          showSearch
          popupMatchSelectWidth={180}
          placeholder={'无设置'}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          mode='multiple'
          onChange={(e) => 更新忽略延迟技能(e)}
          options={skillOptions.map((skill) => ({
            value: skill.技能名称,
            label: skill.技能名称,
          }))}
        />
      </Tooltip>
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
