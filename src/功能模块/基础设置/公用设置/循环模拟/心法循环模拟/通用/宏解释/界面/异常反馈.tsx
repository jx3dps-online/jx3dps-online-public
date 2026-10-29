import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Input, Space, Typography } from 'antd'
import type { 生成进度 } from '../生成/类型'
import { 创建异常检测, type 生成异常 } from '../生成/异常检测'
import type { 生成任务诊断 } from '../生成/任务协议'
import { 生成异常摘要 } from '../工具/异常摘要'

export default function 异常反馈({
  请求文本,
  进度,
  运行中,
  暂停,
  停止中,
  错误,
  诊断,
}: {
  请求文本: string
  进度?: 生成进度
  运行中: boolean
  暂停: boolean
  停止中: boolean
  错误: string
  诊断?: 生成任务诊断
}) {
  const [异常, 设置异常] = useState<{ 检测: 生成异常; 时间: string; 进度?: 生成进度 }>()
  const [复制状态, 设置复制状态] = useState('')
  const [手动复制内容, 设置手动复制内容] = useState('')
  const 最新进度 = useRef(进度)
  const 检测 = useRef(创建异常检测())
  const 上次请求 = useRef(请求文本)
  最新进度.current = 进度
  useEffect(() => {
    检测.current = 创建异常检测()
    if (运行中 || 上次请求.current !== 请求文本) {
      设置异常(undefined)
      设置复制状态('')
      设置手动复制内容('')
    }
    上次请求.current = 请求文本
  }, [请求文本, 运行中])
  useEffect(() => {
    检测.current = 创建异常检测()
    if (!运行中 || 暂停 || 停止中) return
    const 计时器 = setInterval(() => {
      const 当前 = 最新进度.current
      if (!当前) return
      const 发现 = 检测.current(当前, performance.now())
      if (发现) 设置异常((旧) => 旧 ?? { 检测: 发现, 时间: new Date().toISOString(), 进度: 当前 })
    }, 1000)
    return () => clearInterval(计时器)
  }, [运行中, 暂停, 停止中])
  useEffect(() => {
    if (错误) {
      设置异常({ 检测: { 类型: '生成失败', 说明: 错误 }, 时间: new Date().toISOString(), 进度 })
      return
    }
    if (诊断?.结束原因 === 'cancelled') {
      设置异常(undefined)
      return
    }
    if (!进度) return
    if (进度.状态 === '成功') {
      设置异常(undefined)
      return
    }
    const 当前检测 = 运行中 && !暂停 && !停止中 ? 检测.current : 创建异常检测()
    const 发现 = 当前检测(进度, performance.now())
    if (发现) 设置异常((旧) => 旧 ?? { 检测: 发现, 时间: new Date().toISOString(), 进度 })
  }, [进度, 运行中, 暂停, 停止中, 错误, 诊断?.结束原因])
  useEffect(() => {
    if (!进度 || 异常?.检测.类型 !== '持续无进展') return
    if (
      进度.匹配数 > (异常.进度?.匹配数 ?? -1) ||
      (进度.状态 === '压缩' &&
        进度.压缩 &&
        进度.压缩.最佳字符 < (异常.进度?.压缩?.最佳字符 ?? Infinity))
    )
      设置异常(undefined)
  }, [进度, 异常])
  if (!异常) return null
  const 获取反馈内容 = () =>
    生成异常摘要({
      时间: 异常.时间,
      异常: 异常.检测,
      请求文本,
      首次异常进度: 异常.进度,
      当前进度: 进度,
      错误,
      诊断,
    })
  return (
    <Alert
      type='warning'
      message={`检测到${异常.检测.类型}`}
      description={
        <Space direction='vertical' style={{ width: '100%' }}>
          <Typography.Text>{异常.检测.说明}</Typography.Text>
          <Typography.Text>
            {异常.检测.类型 === '生成失败'
              ? '请复制异常信息，粘贴到反馈表单中提交。'
              : '请复制异常信息，粘贴到反馈表单中提交。搜索不会因此停止。'}
          </Typography.Text>
          <Space>
            <Button
              onClick={async () => {
                const 反馈内容 = 获取反馈内容()
                try {
                  await navigator.clipboard.writeText(反馈内容)
                  设置复制状态('异常信息已复制')
                } catch {
                  设置手动复制内容(反馈内容)
                  设置复制状态('复制失败，请手动复制下方信息')
                }
              }}
            >
              复制异常信息
            </Button>
            <Button
              href='https://docs.qq.com/form/page/DZFdVeWFITkNodEJB'
              target='_blank'
              rel='noopener noreferrer'
            >
              提交反馈
            </Button>
          </Space>
          {复制状态 && <Typography.Text>{复制状态}</Typography.Text>}
          {复制状态.startsWith('复制失败') && (
            <Input.TextArea aria-label='异常反馈信息' value={手动复制内容} rows={6} readOnly />
          )}
        </Space>
      }
    />
  )
}
