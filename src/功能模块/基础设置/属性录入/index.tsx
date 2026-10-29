import React, { useEffect } from 'react'
import { 获取页面参数 } from '@/工具函数/help'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 切换配装器弹窗显示状态 } from '@/store/system'

import 配装器 from './配装器'

function 属性录入() {
  const 配装器弹窗显示状态 = useAppSelector((state) => state.system.配装器弹窗显示状态)
  const 配装器入口 = useAppSelector((state) => state.system.配装器入口)
  const dispatch = useAppDispatch()

  const urlServer = 获取页面参数('server')
  const urlName = 获取页面参数('name')

  useEffect(() => {
    if (urlServer && urlName) {
      dispatch(切换配装器弹窗显示状态(true))
    }
  }, [urlServer, urlName])

  return (
    <配装器
      key={
        配装器入口
          ? `${配装器入口.角色id}:${配装器入口.类型 === '目标' ? 配装器入口.目标id : ''}`
          : 'normal'
      }
      open={配装器弹窗显示状态}
      onCancel={() => {
        dispatch(切换配装器弹窗显示状态(false))
      }}
    />
  )
}

export default React.memo(属性录入)
