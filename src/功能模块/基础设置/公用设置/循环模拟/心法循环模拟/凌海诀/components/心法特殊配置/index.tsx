import { Checkbox, Popover } from 'antd'
import React from 'react'

interface 心法特殊配制类型 {
  自动鸟啄: boolean
  更新自动鸟啄: (e: boolean) => void
  显示翼绝云天覆盖: boolean
  更新显示翼绝云天覆盖: (e: boolean) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const { 自动鸟啄, 更新自动鸟啄, 显示翼绝云天覆盖, 更新显示翼绝云天覆盖 } = props

  return (
    <>
      <Popover title='显示翼绝云天覆盖' content={<div>开启后高亮显示翼绝云天覆盖技能</div>}>
        <Checkbox
          checked={显示翼绝云天覆盖}
          onChange={(e) => 更新显示翼绝云天覆盖(e.target.checked)}
        >
          显示翼绝云天覆盖
        </Checkbox>
      </Popover>
      <Popover
        title='自动鸟啄'
        content={
          <div>
            <p>使用宏命令 {`/cast [buff:游仙] 翼绝云天`} 实现</p>
            <p>开启后会跳过下方技能序列中的翼绝云天执行</p>
          </div>
        }
      >
        <Checkbox checked={自动鸟啄} onChange={(e) => 更新自动鸟啄(e.target.checked)}>
          自动鸟啄
        </Checkbox>
      </Popover>
    </>
  )
}

export default 心法特殊配置
