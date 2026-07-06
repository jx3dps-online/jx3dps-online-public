import { Select, Tooltip, Checkbox, InputNumber } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'

interface 心法特殊配制类型 {
  起手温寒: number
  更新起手温寒: (e: number) => void
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  周期性忽略延迟: number | undefined
  更新周期性忽略延迟: (e: number) => void
  启用斩杀: boolean
  更新启用斩杀: (e: boolean) => void
  斩杀起始秒数: number
  更新斩杀起始秒数: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    起手温寒,
    更新起手温寒,
    忽略延迟技能,
    更新忽略延迟技能,
    周期性忽略延迟,
    更新周期性忽略延迟,
    启用斩杀,
    更新启用斩杀,
    斩杀起始秒数,
    更新斩杀起始秒数,
  } = props

  const skillOptions = ['唤醒', '易命', '损毁', '凌然天风·悟', '特效腰坠']
  return (
    <>
      <Checkbox checked={启用斩杀} onChange={(e) => 更新启用斩杀(e.target.checked)}>
        <b>开启斩杀</b>
      </Checkbox>
      {启用斩杀 && (
        <span className={styles.label}>
          斩杀起始秒数
          <Tooltip title='战斗开始后多少秒斩杀生效，0表示立即生效' placement='top'>
            <InputNumber
              size='small'
              min={0}
              value={斩杀起始秒数}
              onChange={(e) => 更新斩杀起始秒数(e ?? 0)}
              style={{ width: 70, marginLeft: 8 }}
            />
          </Tooltip>
        </span>
      )}
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
          options={按数字生成数组(7).map((a) => {
            const value = a - 4
            const label = value < 0 ? '寒性' : value > 0 ? '温性' : '中和'
            return {
              value: value,
              label: `${value === 0 ? '中和' : `${Math.abs(value)}点${label}`}`,
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
