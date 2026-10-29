import React from 'react'
import type { 角色状态信息类型 } from '../../../simulator/type'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 样式 from './index.module.less'
export default function Titai({ 角色状态信息 }: { 角色状态信息: 角色状态信息类型 }) {
  const 体态技能 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === 角色状态信息.体态)
  return (
    <div className={`cycle-status-bar-content ${样式.体态}`}>
      <div className='cycle-status-bar-title'>体态</div>
      <img className={样式.图标} src={体态技能?.图标} alt={角色状态信息.体态} />
      <span>{角色状态信息.体态}</span>
    </div>
  )
}
