import { Checkbox, Select, Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'
import 循环模拟技能基础数据 from '../../constant/skill'

interface 心法特殊配制类型 {
  会心回豆: boolean
  更新会心回豆: (值: boolean) => void
  隐藏角标: boolean
  更新隐藏角标: (值: boolean) => void
  隐藏紫气覆盖: boolean
  更新隐藏紫气覆盖: (值: boolean) => void
  起手气点: number
  更新起手气点: (数值: number) => void
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  周期性忽略延迟: number
  更新周期性忽略延迟: (e: number) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    会心回豆,
    更新会心回豆,
    隐藏角标,
    更新隐藏角标,
    隐藏紫气覆盖,
    更新隐藏紫气覆盖,
    起手气点,
    更新起手气点,
    忽略延迟技能,
    更新忽略延迟技能,
    周期性忽略延迟,
    更新周期性忽略延迟,
  } = props
  const skillOptions = 循环模拟技能基础数据.filter((技能) => 技能.是否为倒读条技能)

  return (
    <>
      <Tooltip title='勾选后两仪化形每次自动会心回豆；关闭后可在两仪化形后手动添加“回豆”。'>
        <Checkbox
          className={styles.显示开关}
          checked={会心回豆}
          onChange={(e) => 更新会心回豆(e.target.checked)}
        >
          会心回豆
        </Checkbox>
      </Tooltip>
      <Tooltip title='循环列表中，六合角标表示实际吃到紫气的跳数；破势一段和卸除飞剑角标表示卸除前最后打出的剑序，0表示尚未出剑。勾选后隐藏列表角标，悬停仍可查看详情，下方按钮角标不受影响。'>
        <Checkbox
          className={styles.显示开关}
          checked={隐藏角标}
          onChange={(e) => 更新隐藏角标(e.target.checked)}
        >
          隐藏角标
        </Checkbox>
      </Tooltip>
      <Tooltip title='紫色背景表示技能有伤害吃到紫气；六合覆盖1～3跳为红色，4～5跳为紫色，未覆盖不显示背景。勾选后只隐藏背景，不影响角标和计算。'>
        <Checkbox
          className={styles.显示开关}
          checked={隐藏紫气覆盖}
          onChange={(e) => 更新隐藏紫气覆盖(e.target.checked)}
        >
          隐藏紫气覆盖
        </Checkbox>
      </Tooltip>
      <span className={styles.label}>起手气点</span>
      <Select
        size='small'
        className={styles.起手气点选择}
        value={起手气点}
        onChange={更新起手气点}
        options={Array.from({ length: 11 }, (_, 序号) => ({
          value: 序号 / 2,
          label: String(序号 / 2),
        }))}
      />
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
