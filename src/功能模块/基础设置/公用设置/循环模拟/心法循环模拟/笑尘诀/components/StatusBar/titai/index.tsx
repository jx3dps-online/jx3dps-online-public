import React from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'

const 常态图标 = 'https://icon.jx3box.com/icon/4892.png'
const 逍遥图标 = 'https://icon.jx3box.com/icon/4601.png'
import { Tooltip } from 'antd'
import './index.css'

interface TitaiProps {
  角色状态信息: 角色状态信息类型
}

function Titai(props: TitaiProps) {
  const { 角色状态信息 } = props

  return (
    <div className={'cycle-status-bar-content'}>
      <div className={'cycle-status-bar-title'}>体态</div>
      <Tooltip title={角色状态信息?.体态}>
        <img
          className={'cycle-status-bar-titai-img'}
          src={角色状态信息?.体态 === '常态' ? 常态图标 : 逍遥图标}
          alt=''
        />
      </Tooltip>
    </div>
  )
}

export default Titai
