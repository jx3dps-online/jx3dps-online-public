import React from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'

import { Progress } from 'antd'
import './index.css'

interface RageProps {
  角色状态信息: 角色状态信息类型
}

function Rage(props: RageProps) {
  const { 角色状态信息 } = props

  return (
    <div className={'cycle-status-bar-content'} style={{ width: 150 }}>
      <div className={'cycle-status-bar-title'}>怒气</div>
      <div className={'cycle-status-bar-body'}>
        <Progress
          className={'cycle-status-bar-rage'}
          percent={角色状态信息?.怒气}
          format={(percent) => `${percent}`}
        />
      </div>
    </div>
  )
}

export default Rage
