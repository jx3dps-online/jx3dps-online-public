import { Button } from 'antd'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新增益面板显示状态 } from '@/store/system'

/** 增益详情按钮：单独一行，用于展开左侧的增益面板。 */
function 增益详情入口() {
  const 增益面板显示状态 = useAppSelector((state) => state?.system?.增益面板显示状态)
  const dispatch = useAppDispatch()

  const 切换增益面板显示状态 = () => {
    dispatch(更新增益面板显示状态(!增益面板显示状态))
  }

  return (
    <Button id='Guide_12' className='basic-set-full-btn' danger onClick={切换增益面板显示状态}>
      增益详情
    </Button>
  )
}

export default React.memo(增益详情入口)
