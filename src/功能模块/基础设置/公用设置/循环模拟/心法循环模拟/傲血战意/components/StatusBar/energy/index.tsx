import React from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'
import { Progress } from 'antd'
import './index.css'

interface TitaiProps {
  角色状态信息: 角色状态信息类型
}

function Enerty(props: TitaiProps) {
  const { 角色状态信息 } = props

  return (
    <div className={'cycle-status-bar-content cycle-status-energy-content'}>
      <div className={'cycle-status-bar-title'}>能量</div>
      <div className={'cycle-status-bar-enerty-wrap'}>
        <div className={'cycle-status-bar-enerty-item'}>
          <span>战意</span>
          <Progress
            className={'ax-cycle-status-bar-enerty'}
            percent={Math.floor(角色状态信息?.战意 * 20)}
            format={(percent) => `${percent}`}
            size={26}
            steps={5}
            strokeColor={'rgb(245, 34, 45)'}
          />
        </div>
      </div>
    </div>
  )
}

export default Enerty
