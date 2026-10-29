// 当前角色状态栏，只用来展示
import React from 'react'
import { Progress, Tooltip } from 'antd'
import styles from './index.module.less'
import { 当前计算结果类型 } from '@/@types/输出'
import { 循环日志数据类型, ShowCycleSingleSkill, 模拟信息类型 } from '../../simulator/type'

import Buff from './buff'
import Titai from './titai'
import DpsRes from './dpsRes'
import './index.css'

interface StatusBarProps {
  模拟信息: 模拟信息类型
  完整循环: ShowCycleSingleSkill[]
  日志信息: 循环日志数据类型[]
  模拟DPS结果: 当前计算结果类型
  模拟函数: (e: any) => void
  奇穴信息: string[]
  战斗曲线面板展示?: boolean
  切换战斗曲线面板?: (open?: boolean) => void
}

function StatusBar(props: StatusBarProps) {
  const { 模拟信息, 日志信息, 模拟DPS结果, 模拟函数, 战斗曲线面板展示, 切换战斗曲线面板 } = props

  return (
    <div className={'cycle-status-bar'}>
      <Titai 角色状态信息={模拟信息.角色状态信息} />
      <div className={`cycle-status-bar-content ${styles.角色状态}`}>
        <div className='cycle-status-bar-title'>角色状态</div>
        <div className={styles.内力}>
          <span>内力</span>
          <Progress
            percent={模拟信息.角色状态信息.内力}
            showInfo={false}
            className={styles.进度条}
          />
          <span>{模拟信息.角色状态信息.内力}%</span>
        </div>
        <Tooltip title={`${模拟信息.角色状态信息.醉意}点醉意，上限3点`}>
          <div
            className={styles.醉意}
            role='meter'
            aria-label='醉意'
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={模拟信息.角色状态信息.醉意}
          >
            <span>醉意</span>
            {[0, 1, 2].map((层数) => (
              <span
                key={层数}
                className={styles.圆点}
                aria-hidden='true'
                style={{
                  background:
                    模拟信息.角色状态信息.醉意 > 层数
                      ? 'var(--ant-primary-color)'
                      : 'rgba(0,0,0,0.08)',
                }}
              />
            ))}
          </div>
        </Tooltip>
      </div>
      {props.奇穴信息.includes('坚冰') ? (
        <div className={`cycle-status-bar-content ${styles.连击}`}>
          <div className='cycle-status-bar-title'>连击</div>
          <div className='cycle-status-bar-body'>
            {模拟信息.当前自身buff列表.连击?.当前层数 || 0}
          </div>
        </div>
      ) : null}
      <Buff
        title='自身Buff'
        buff列表={模拟信息?.当前自身buff列表}
        当前时间点={模拟信息?.当前时间}
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
  )
}

export default StatusBar
