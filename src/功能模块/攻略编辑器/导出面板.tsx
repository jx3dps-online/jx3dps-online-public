import React, { useMemo } from 'react'
import { Alert, Button, Input, message, Modal, Space, Tabs, Typography } from 'antd'
import type { 攻略文档 } from './类型'
import { 生成TSX, 下载文件, 交接说明 } from './导出'

export default function 导出面板({ 文档, 关闭 }: { 文档: 攻略文档; 关闭: () => void }) {
  const 结果 = useMemo(() => {
    try {
      return { tsx: 生成TSX(文档), 错误: '' }
    } catch (错误) {
      return { tsx: '', 错误: (错误 as Error).message }
    }
  }, [文档])
  const json = JSON.stringify(文档, null, 2)
  const 说明 = 交接说明(文档)
  const 文件名 = `${文档.心法}-${文档.攻略名 || '未命名'}`
  const 复制 = async (文本: string) => {
    try {
      await navigator.clipboard.writeText(文本)
      message.success('已复制')
    } catch {
      message.error('浏览器无法复制，请使用下载')
    }
  }
  return (
    <Modal
      open
      title='导出攻略稿件'
      onCancel={关闭}
      width={820}
      footer={<Button onClick={关闭}>返回编辑</Button>}
    >
      <Typography.Paragraph type='secondary'>
        下载 JSON 以便继续编辑；把 JSON、TSX 与交接说明交给开发者审核入库。
      </Typography.Paragraph>
      {结果.错误 && (
        <Alert
          type='warning'
          showIcon
          message={结果.错误}
          description='可先下载 JSON 保存草稿，修正后再导出 TSX。'
        />
      )}
      <Space wrap style={{ margin: '16px 0' }}>
        <Button type='primary' onClick={() => 下载文件(`${文件名}.json`, json, 'application/json')}>
          下载 JSON
        </Button>
        <Button disabled={!结果.tsx} onClick={() => 下载文件(`${文件名}.tsx`, 结果.tsx)}>
          下载 TSX
        </Button>
        <Button onClick={() => 下载文件(`${文件名}-交接说明.txt`, 说明)}>下载交接说明</Button>
        <Button onClick={() => 复制(json)}>复制 JSON</Button>
        <Button onClick={() => 复制(说明)}>复制交接说明</Button>
      </Space>
      <Tabs
        items={[
          {
            key: '说明',
            label: '交接说明',
            children: <Input.TextArea readOnly rows={12} value={说明} />,
          },
          {
            key: 'tsx',
            label: 'TSX 源码',
            children: <Input.TextArea readOnly rows={16} value={结果.tsx} />,
          },
          {
            key: 'json',
            label: 'JSON 稿件',
            children: <Input.TextArea readOnly rows={16} value={json} />,
          },
        ]}
      />
    </Modal>
  )
}
