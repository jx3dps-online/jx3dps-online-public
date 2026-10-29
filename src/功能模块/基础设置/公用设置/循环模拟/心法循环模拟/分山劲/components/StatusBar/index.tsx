// 当前角色状态栏，只用来展示
import React from 'react'
import { 当前计算结果类型 } from '@/@types/输出'
import { 循环日志数据类型, ShowCycleSingleSkill, 模拟信息类型 } from '../../simulator/type'

import Titai from './titai'
import Rage from './rage'
import Sun from './sun'
import Buff from './buff'
import DpsRes from './dpsRes'
import './index.css'

interface StatusBarProps {
  模拟信息: 模拟信息类型
  暴怒值上限: number
  显示暴怒值: boolean
  完整循环: ShowCycleSingleSkill[]
  日志信息: 循环日志数据类型[]
  模拟DPS结果: 当前计算结果类型
  模拟函数: (e: any) => void
  战斗曲线面板展示?: boolean
  切换战斗曲线面板?: (open?: boolean) => void
}

function StatusBar(props: StatusBarProps) {
  const {
    模拟信息,
    暴怒值上限,
    显示暴怒值,
    日志信息,
    模拟DPS结果,
    模拟函数,
    战斗曲线面板展示,
    切换战斗曲线面板,
  } = props

  return (
    <div className={'cycle-status-bar'}>
      <Titai 角色状态信息={模拟信息?.角色状态信息} />
      <Rage 角色状态信息={模拟信息?.角色状态信息} />
      {显示暴怒值 && <Sun 角色状态信息={模拟信息?.角色状态信息} 暴怒值上限={暴怒值上限} />}
      <Buff
        title='自身Buff'
        buff列表={模拟信息?.当前自身buff列表}
        当前时间点={模拟信息?.当前时间}
      />
      <Buff
        title='目标Buff'
        buff列表={模拟信息?.当前目标buff列表}
        当前时间点={模拟信息?.当前时间}
        DOT列表={模拟信息?.当前DOT运行状态}
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
