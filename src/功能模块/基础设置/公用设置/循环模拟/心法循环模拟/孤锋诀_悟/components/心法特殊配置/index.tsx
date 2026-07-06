import React from 'react'
import styles from './index.module.less'
import { Checkbox, Select, Tooltip } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'
interface 心法特殊配制类型 {
  显示锐意: boolean
  设置显示锐意: (e: boolean) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 显示锐意, 设置显示锐意 } = props

  return (
    <>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示锐意}
        onChange={(e) => 设置显示锐意(e?.target?.checked)}
      >
        <Tooltip
          styles={{ body: { width: 350 } }}
          title={
            <div>
              <p>开启后显示技能释放前锐意</p>
            </div>
          }
        >
          显示锐意
        </Tooltip>
      </Checkbox>
    </>
  )
}

export default 心法特殊配置
