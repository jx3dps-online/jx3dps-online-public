import React, { useEffect, useState } from 'react'
import { Alert, Button, Spin } from 'antd'

export default function 异步内容<参数 extends object>({
  加载,
  参数: 内容参数,
}: {
  加载: () => Promise<{ default: React.ComponentType<参数> }>
  参数: 参数
}) {
  const [组件, 设置组件] = useState<React.ComponentType<参数>>()
  const [错误, 设置错误] = useState(false)
  const [重试次数, 设置重试次数] = useState(0)
  useEffect(() => {
    let 已取消 = false
    设置错误(false)
    加载()
      .then((模块) => {
        if (!已取消) 设置组件(() => 模块.default)
      })
      .catch(() => {
        if (!已取消) 设置错误(true)
      })
    return () => {
      已取消 = true
    }
  }, [加载, 重试次数])
  if (错误)
    return (
      <Alert
        type='error'
        message='内容加载失败，请检查网络后重试。'
        action={<Button onClick={() => 设置重试次数((值) => 值 + 1)}>重试</Button>}
      />
    )
  return 组件 ? <组件 {...内容参数} /> : <Spin />
}
