import { useEffect, useState } from 'react'
import { 读取说明目录 } from './读取'
import type { 说明目录 } from './类型'

export function 使用说明目录(启用 = true) {
  const [目录, 设置目录] = useState<说明目录>()
  const [错误, 设置错误] = useState('')
  const [重试次数, 设置重试次数] = useState(0)
  useEffect(() => {
    if (!启用) return
    let 已取消 = false
    设置错误('')
    读取说明目录()
      .then((结果) => {
        if (!已取消) 设置目录(结果)
      })
      .catch((原因) => {
        if (!已取消) 设置错误(原因 instanceof Error ? 原因.message : '功能说明加载失败，请重试。')
      })
    return () => {
      已取消 = true
    }
  }, [启用, 重试次数])
  return { 目录, 错误, 重试: () => 设置重试次数((值) => 值 + 1) }
}
