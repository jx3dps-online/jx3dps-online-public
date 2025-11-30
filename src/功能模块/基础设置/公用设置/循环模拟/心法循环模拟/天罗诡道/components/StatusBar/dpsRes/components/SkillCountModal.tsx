import React from 'react'
import 结果统计 from '@/功能模块/计算结果/结果统计'
import { 循环日志数据类型 } from '../../../../simulator/type'
import '../../../../index.css'
import { 计算结果技能列表类型 } from '@/@types/输出'

interface SkillCountModalProps {
  open: boolean
  onCancel: () => void
  dpsList: 计算结果技能列表类型[]
  total: number
  日志信息: 循环日志数据类型[]
}

const SkillCountModal: React.FC<SkillCountModalProps> = (props) => {
  const { open, onCancel, total, dpsList } = props

  return (
    <结果统计
      title={
        <div className={'cycle-simulator-modal-header space-between'}>
          <h1 className={'cycle-simulator-modal-title'}>技能统计</h1>
        </div>
      }
      计算结果={{
        总伤: total,
        计算结果技能列表: dpsList,
      }}
      visible={open}
      onClose={() => onCancel()}
    />
  )
}

export default SkillCountModal

export const 获取对应实际倍率 = (日志) => {
  return 日志?.其他数据?.技能等级 || 1
}
