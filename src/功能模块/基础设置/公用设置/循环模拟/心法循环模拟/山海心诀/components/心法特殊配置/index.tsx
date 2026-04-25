import { Checkbox, Tooltip } from 'antd'
import React from 'react'

interface 心法特殊配制类型 {
  显示标鹄层数: boolean
  更新显示标鹄层数: (e: boolean) => void
  显示领胡覆盖: boolean
  更新显示领胡覆盖: (e: boolean) => void
  显示连珠覆盖: boolean
  更新显示连珠覆盖: (e: boolean) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    显示标鹄层数,
    更新显示标鹄层数,
    显示领胡覆盖,
    更新显示领胡覆盖,
    显示连珠覆盖,
    更新显示连珠覆盖,
  } = props

  return (
    <>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示连珠覆盖}
        onChange={(e) => 更新显示连珠覆盖(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的连珠'>显示连珠覆盖</Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示领胡覆盖}
        onChange={(e) => 更新显示领胡覆盖(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的领胡'>显示领胡覆盖</Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示标鹄层数}
        onChange={(e) => 更新显示标鹄层数(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的标鹄层数'>显示标鹄层数</Tooltip>
      </Checkbox>
    </>
  )
}

export default 心法特殊配置
