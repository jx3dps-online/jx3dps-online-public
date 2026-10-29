import { Button } from 'antd'
import React from 'react'
import { useAppDispatch } from '@/hooks'
import { 切换配装器弹窗显示状态 } from '@/store/system'
import { 数据埋点 } from '@/工具函数/tools/log'

/** 配装器入口按钮：左栏第一行的主入口，弹窗与草稿状态由 store.system 控制。 */
function 配装器入口() {
  const dispatch = useAppDispatch()

  return (
    <Button
      id='Guide_1'
      className='basic-set-full-btn'
      type='primary'
      onClick={() => {
        dispatch(切换配装器弹窗显示状态(true))
        数据埋点('打开配装器')
      }}
    >
      配装器
    </Button>
  )
}

export default React.memo(配装器入口)
