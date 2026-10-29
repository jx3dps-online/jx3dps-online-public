import { Select, Tooltip, Checkbox, InputNumber } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'
import 循环模拟技能基础数据 from '../../constant/skill'

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

  const skillOptions = 循环模拟技能基础数据.filter((技能) => 技能.是否为倒读条技能)
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
