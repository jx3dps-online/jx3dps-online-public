import { Alert, Tabs } from 'antd'
import React from 'react'
import { useAppSelector } from '@/hooks'
import 识别装备对比 from './识别装备对比'
import 无封助手 from './无封助手'
import './index.css'

function 装备助手() {
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)

  const items = [
    {
      key: '识别装备对比',
      label: '识别装备对比',
      children: <识别装备对比 />,
    },
    {
      key: '无封助手',
      label: '无封助手',
      children: <无封助手 />,
    },
  ]

  return (
    <div className={'equip-assistant'}>
      <Alert className={'equip-assistant-dps'} message={`当前秒伤：${当前计算结果?.秒伤}`} />
      <Tabs items={items} destroyInactiveTabPane />
    </div>
  )
}

export default React.memo(装备助手)
