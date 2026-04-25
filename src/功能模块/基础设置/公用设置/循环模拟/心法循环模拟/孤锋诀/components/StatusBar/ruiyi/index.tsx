import React, { useMemo } from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'

import { Progress } from 'antd'
import './index.css'

interface RuiyiProps {
  角色状态信息: 角色状态信息类型
  奇穴信息: string[]
}

function Ruiyi(props: RuiyiProps) {
  const { 角色状态信息, 奇穴信息 } = props

  const 是否是三倍锐意 = useMemo(() => {
    return 奇穴信息?.includes('择行')
  }, [奇穴信息])

  return (
    <div className={'cycle-status-bar-content'}>
      <div className={'cycle-status-bar-title'}>锐意</div>
      <div className={'cycle-status-bar-body cycle-status-bar-ruiyi-body'}>
        <Progress
          className={'cycle-status-bar-ruiyi'}
          percent={是否是三倍锐意 ? (角色状态信息?.锐意 || 0) / 3 : 角色状态信息?.锐意}
          format={(percent) => `${是否是三倍锐意 ? percent || 0 * 3 : percent}`}
          showInfo={false}
        />

        <span className={'cycle-status-bar-ruiyi-num'}>{角色状态信息?.锐意}</span>
      </div>
    </div>
  )
}

export default Ruiyi
