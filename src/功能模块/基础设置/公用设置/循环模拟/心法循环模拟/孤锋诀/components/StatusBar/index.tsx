// 当前角色状态栏，只用来展示
import React from 'react'
import { 当前计算结果类型 } from '@/@types/输出'
import { 循环日志数据类型, ShowCycleSingleSkill, 模拟信息类型 } from '../../simulator/type'

import Titai from './titai'
import Ruiyi from './ruiyi'
import Buff from './buff'
import DpsRes from './dpsRes'
import './index.css'

interface StatusBarProps {
  模拟信息: 模拟信息类型
  完整循环: ShowCycleSingleSkill[]
  日志信息: 循环日志数据类型[]
  模拟DPS结果: 当前计算结果类型
  模拟函数: (e: any) => void
  奇穴信息: string[]
}

function StatusBar(props: StatusBarProps) {
  const { 模拟信息, 奇穴信息, 日志信息, 模拟DPS结果, 模拟函数 } = props

  return (
    <div className={'cycle-status-bar'}>
      <Titai 角色状态信息={模拟信息?.角色状态信息} />
      <Ruiyi 角色状态信息={模拟信息?.角色状态信息} 奇穴信息={奇穴信息} />
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
      />
    </div>
  )
}

export default StatusBar
