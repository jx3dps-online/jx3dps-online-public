import React from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'

const Img_Dandao = 'https://icon.jx3box.com/icon/18245.png'
const Img_Shuangdao = 'https://icon.jx3box.com/icon/17573.png'
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
          src={角色状态信息?.体态 === '单刀' ? Img_Dandao : Img_Shuangdao}
          alt=''
        />
      </Tooltip>
    </div>
  )
}

export default Titai
