import { 获取页面参数 } from '@/工具函数/help'
import { useRequest } from 'ahooks'
import { Cascader } from 'antd'
import React from 'react'


function ServerCascader(props) {
  const { callback, ...options } = props

  const data = []

  return (
    <Cascader
      showSearch
      placeholder={'请选择服务器'}
      options={data || []}
      expandTrigger='hover'
      {...options}
    />
  )
}

export default ServerCascader
