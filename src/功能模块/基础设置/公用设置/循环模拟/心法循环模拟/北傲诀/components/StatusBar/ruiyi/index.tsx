import React from 'react'
import { Progress } from 'antd'
import type { 角色状态信息类型 } from '../../../simulator/type'
import 样式 from './index.module.less'
export default function 资源({ 角色状态信息 }: { 角色状态信息: 角色状态信息类型 }) {
  return (
    <div className={`cycle-status-bar-content ${样式.资源列表}`}>
      {(['狂意', '刀魂', '气劲'] as const).map((名称) => (
        <div className={样式.资源行} key={名称}>
          <span className={样式.资源名称}>{名称}</span>
          <Progress className={样式.资源进度} percent={角色状态信息[名称]} showInfo={false} />
          <span className={样式.资源数值}>{角色状态信息[名称]}</span>
        </div>
      ))}
    </div>
  )
}
