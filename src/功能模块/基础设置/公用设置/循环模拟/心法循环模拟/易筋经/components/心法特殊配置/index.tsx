import { Checkbox } from 'antd'
import React from 'react'

interface 心法特殊配制类型 {
  显示消贪层数: boolean
  设置显示消贪层数: (e: boolean) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 显示消贪层数, 设置显示消贪层数 } = props

  return (
    <>
      <Checkbox checked={显示消贪层数} onChange={(e) => 设置显示消贪层数(e.target.checked)}>
        显示消贪层数
      </Checkbox>
    </>
  )
}

export default 心法特殊配置
