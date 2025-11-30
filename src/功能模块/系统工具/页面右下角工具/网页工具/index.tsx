import { Modal, Tabs } from 'antd'
import React, { useMemo, useState } from 'react'
import './index.css'

// const JCL技能序列导入 = React.lazy(() => import('./JCL技能序列导入'))
const Generator解析 = React.lazy(() => import('./Generator解析'))
const JCL战斗记录解析 = React.lazy(() => import('./JCL战斗记录解析'))
const 循环设置 = React.lazy(() => import('./循环设置'))
const 装备速查 = React.lazy(() => import('./装备速查'))
const 触发率分析 = React.lazy(() => import('./触发率分析'))

function DeveloperModal({ visible, onClose }) {
  const [activeKey, setActiveKey] = useState<string>('Generator解析')

  const CycleComponent = useMemo(() => {
    return activeKey === 'JCL战斗记录解析' ? (
      <JCL战斗记录解析 />
    ) : activeKey === 'Generator解析' ? (
      <Generator解析 />
    ) : activeKey === '循环设置' ? (
      <循环设置 />
    ) : activeKey === '装备速查' ? (
      <装备速查 />
    ) : activeKey === '触发率分析' ? (
      <触发率分析 />
    ) : (
      ''
    )
  }, [activeKey])

  const hrefDev = location.href?.includes('localhost')
  const DEV = hrefDev

  const items = [
    {
      label: 'Generator解析',
      key: 'Generator解析',
      children: <React.Suspense>{CycleComponent}</React.Suspense>,
    },
    {
      label: '循环设置',
      key: '循环设置',
      children: <React.Suspense>{CycleComponent}</React.Suspense>,
    },
    {
      label: '装备速查',
      key: '装备速查',
      children: <React.Suspense>{CycleComponent}</React.Suspense>,
    },
    {
      label: 'JCL战斗记录解析',
      key: 'JCL战斗记录解析',
      children: <React.Suspense>{CycleComponent}</React.Suspense>,
    },
    ...(DEV
      ? [
          {
            label: '触发率分析',
            key: '触发率分析',
            children: <React.Suspense>{CycleComponent}</React.Suspense>,
          },
        ]
      : []),
  ]

  return (
    <Modal
      className='tools-modal'
      title={'网页工具'}
      centered
      width={'100%'}
      open={visible}
      onCancel={() => onClose(false)}
      footer={null}
      destroyOnClose
    >
      <Tabs
        activeKey={activeKey}
        onChange={(e) => setActiveKey(e)}
        items={items}
        destroyInactiveTabPane
      />
    </Modal>
  )
}

export default DeveloperModal
