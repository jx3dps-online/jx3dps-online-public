import { Button, Modal, Space } from 'antd'
import { lazy, Suspense, useEffect, useState } from 'react'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取心法加速阈值 } from '@/数据/加速阈值'
import 加速阈值选择 from '@/组件/加速阈值选择'

const 加速阈值详情 = lazy(() => import('@/组件/加速阈值详情'))

function 加速值参考弹窗({ open, onCancel, 设置目标加速 }) {
  const 心法 = use心法数据()
  const 阈值列表 = 获取心法加速阈值(心法)
  const [选中, 设置选中] = useState<string>()
  const [详情展示, 设置详情展示] = useState(false)
  useEffect(() => {
    设置选中(undefined)
    设置详情展示(false)
  }, [心法.名称, open])
  const 选项 = 阈值列表.flatMap((组) => 组.档位).find((项) => 项.标识 === 选中)
  return (
    <Modal
      title='加速值参考'
      open={open}
      onCancel={onCancel}
      width={670}
      footer={null}
      destroyOnClose
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        <加速阈值选择 阈值列表={阈值列表} value={选中} onChange={设置选中} />
        <Space>
          <Button
            type='primary'
            disabled={!选项}
            onClick={() => {
              if (选项) {
                设置目标加速(选项.加速值)
                onCancel()
              }
            }}
          >
            设为目标
          </Button>
          <Button type='link' onClick={() => 设置详情展示(true)}>
            查看详细阈值
          </Button>
        </Space>
      </Space>
      {详情展示 && (
        <Suspense fallback={null}>
          <加速阈值详情
            key={心法.名称}
            当前加速={选项?.加速值 ?? 0}
            onCancel={() => 设置详情展示(false)}
          />
        </Suspense>
      )}
    </Modal>
  )
}
export default 加速值参考弹窗
