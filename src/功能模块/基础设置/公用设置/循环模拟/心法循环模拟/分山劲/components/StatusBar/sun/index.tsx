import React from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'

import { Progress } from 'antd'

interface SunProps {
  角色状态信息: 角色状态信息类型
  暴怒值上限: number
}

function Sun(props: SunProps) {
  const { 角色状态信息, 暴怒值上限 } = props
  const 当前暴怒值 = 角色状态信息?.暴怒值 || 0

  return (
    <div className={'cycle-status-bar-content'} style={{ width: 150 }}>
      <div className={'cycle-status-bar-title'}>武烈值</div>
      <div className={'cycle-status-bar-body'}>
        <Progress
          className={'cycle-status-bar-rage'}
          percent={(当前暴怒值 / (暴怒值上限 || 40)) * 100}
          format={() => `${当前暴怒值}`}
        />
      </div>
    </div>
  )
}

export default Sun
