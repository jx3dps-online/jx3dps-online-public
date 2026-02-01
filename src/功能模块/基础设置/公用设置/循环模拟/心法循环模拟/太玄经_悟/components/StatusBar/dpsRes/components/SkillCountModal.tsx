import React from 'react'
import 结果统计 from '@/功能模块/计算结果/结果统计'
import { 计算结果技能列表类型 } from '@/@types/输出'
import '../../../../index.css'

interface SkillCountModalProps {
  open: boolean
  onCancel: () => void
  dpsList: 计算结果技能列表类型[]
  total: number
}

const SkillCountModal: React.FC<SkillCountModalProps> = (props) => {
  const { open, onCancel, total, dpsList } = props

  return (
    <结果统计
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
