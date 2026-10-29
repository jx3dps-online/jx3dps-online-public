import { Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import 循环模拟技能基础数据 from '../../constant/skill'

interface 心法特殊配制类型 {
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  周期性忽略延迟: number
  更新周期性忽略延迟: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 忽略延迟技能, 更新忽略延迟技能, 周期性忽略延迟, 更新周期性忽略延迟 } = props
  const skillOptions = 循环模拟技能基础数据.filter((技能) => 技能.是否为倒读条技能)

  return (
    <>
      <span className={styles.label}>倒读条忽略延迟</span>
      <Tooltip title='倒读条后的衔接延迟补偿' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={忽略延迟技能}
          style={{ minWidth: 150 }}
          showSearch
          popupMatchSelectWidth={180}
          placeholder='无设置'
          mode='multiple'
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={更新忽略延迟技能}
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
          placeholder='关闭'
          filterOption={(input, option) => option?.label?.includes(input) || false}
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
