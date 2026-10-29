// 当前角色状态栏，只用来展示
import React, { useId, useState } from 'react'
import { Button } from 'antd'
import { 循环日志数据类型, ShowCycleSingleSkill, 模拟信息类型 } from '../../simulator/type'

import Energy from './energy'
import Buff from './buff'
import DpsRes from './dpsRes'
import './index.css'
import styles from './index.module.less'
import { 当前计算结果类型 } from '@/@types/输出'
import { 装备信息数据类型 } from '@/@types/装备'
import { 获取武器名称 } from '../../武器切换'
import 面板展示 from '@/功能模块/基础设置/属性录入/配装器/功能组件/面板展示'

interface StatusBarProps {
  模拟信息: 模拟信息类型
  完整循环: ShowCycleSingleSkill[]
  日志信息: 循环日志数据类型[]
  模拟DPS结果: 当前计算结果类型
  奇穴信息: string[]
  模拟函数: (e: any) => void
  战斗曲线面板展示?: boolean
  切换战斗曲线面板?: (open?: boolean) => void
  当前装备?: 装备信息数据类型
}

function StatusBar(props: StatusBarProps) {
  const [展开, 设置展开] = useState(true)
  const [固定, 设置固定] = useState(false)
  const 内容编号 = useId()
  const {
    模拟信息,
    日志信息,
    模拟DPS结果,
    奇穴信息,
    模拟函数,
    战斗曲线面板展示,
    切换战斗曲线面板,
    当前装备,
  } = props

  return (
    <section className={`${styles.状态区域} ${固定 ? styles.固定 : ''}`} aria-label='战斗状态'>
      <div className={styles.操作栏}>
        <span className={styles.标题}>战斗状态</span>
        <Button
          size='small'
          type='text'
          aria-expanded={展开}
          aria-controls={内容编号}
          onClick={() => 设置展开(!展开)}
        >
          {展开 ? '收起' : '展开'}
        </Button>
        <Button
          size='small'
          type={固定 ? 'primary' : 'default'}
          aria-pressed={固定}
          onClick={() => 设置固定(!固定)}
        >
          {固定 ? '取消固定' : '固定至顶端'}
        </Button>
      </div>
      <div id={内容编号} className={styles.内容} hidden={!展开}>
        {当前装备 ? (
          <details className={styles.武器面板}>
            <summary>当前武器：{获取武器名称(模拟信息.当前武器ID)} · 查看装备面板</summary>
            <面板展示
              当前装备信息={当前装备}
              对比装备信息={null}
              循环覆盖={{ 更新奇穴数据: 奇穴信息 }}
            />
          </details>
        ) : null}
        <div className={`cycle-status-bar ${styles.状态栏}`}>
          <Energy
            角色状态信息={模拟信息?.角色状态信息}
            起卦次数={
              模拟信息?.技能释放记录?.filter((记录) =>
                ['起卦', '起水卦', '起山卦', '起火卦'].includes(记录.技能名称),
              ).length || 0
            }
          />
          <Buff
            title='自身Buff'
            buff列表={模拟信息?.当前自身buff列表}
            当前时间点={模拟信息?.当前时间}
            奇穴信息={奇穴信息 || []}
          />
          <Buff
            title='目标Buff'
            buff列表={模拟信息?.当前目标buff列表}
            DOT列表={模拟信息?.当前DOT运行状态}
            当前时间点={模拟信息?.当前时间}
          />
          <DpsRes
            模拟信息={模拟信息}
            日志信息={日志信息}
            模拟DPS结果={模拟DPS结果}
            模拟函数={模拟函数}
            战斗曲线面板展示={战斗曲线面板展示}
            切换战斗曲线面板={切换战斗曲线面板}
          />
        </div>
      </div>
    </section>
  )
}

export default StatusBar
