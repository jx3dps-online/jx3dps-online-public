import React from 'react'
import { Select } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新网页设置 } from '@/store/system'
import { 更新网络延迟 } from '@/store/data'
import { 延迟设定 } from '@/数据/常量'
import ServerCascader from '@/组件/ServerCascader'
import 设置项 from '../设置项'

function 系统设置() {
  const dispatch = useAppDispatch()
  const 网页设置 = useAppSelector((state) => state?.system?.网页设置)
  const 网络延迟 = useAppSelector((state) => state?.data?.网络延迟)

  const 默认区服值 = 网页设置?.数据?.默认区服 ? 网页设置.数据.默认区服.split('/') : undefined

  return (
    <>
      <设置项 标题='区服默认值' 说明='交易行价格查询、账号导入时的默认区服。'>
        <ServerCascader
          style={{ width: 240 }}
          value={默认区服值}
          onChange={(e) => dispatch(更新网页设置({ 数据: { 默认区服: e?.join('/') || '' } }))}
        />
      </设置项>
      <设置项 标题='网络延迟默认值' 说明='计算循环时默认采用的网络延迟档位。'>
        <Select style={{ width: 240 }} value={网络延迟} onChange={(v) => dispatch(更新网络延迟(v))}>
          {延迟设定.map((item) => (
            <Select.Option value={item?.value} key={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </设置项>
    </>
  )
}

export default 系统设置
