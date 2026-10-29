import React from 'react'
import { Alert, Form, Input, Select } from 'antd'
import type { 数据类型 } from '@/@types/数据'
import type { 攻略文档 } from './类型'
import { 心法列表 } from './文档'

export default function 稿件设置({
  文档,
  更新,
  数据,
}: {
  文档: 攻略文档
  更新: (值: 攻略文档) => void
  数据?: 数据类型
}) {
  const 修改 = (键: keyof 攻略文档, 值: unknown) => 更新({ ...文档, [键]: 值 })
  const 循环 = 数据?.计算循环.map((项) => ({ value: 项.名称, label: 项.标题 || 项.名称 })) || []
  const 未匹配 = 文档.绑定循环.filter((项) => !循环.some((循环) => 循环.value === 项))
  return (
    <Form layout='vertical'>
      <Form.Item label='心法'>
        <Select
          showSearch
          value={文档.心法}
          options={心法列表.map((名称) => ({ value: 名称 }))}
          onChange={(心法) => 更新({ ...文档, 心法, 预览循环: '' })}
        />
      </Form.Item>
      <Form.Item
        label='攻略目录名'
        extra={`攻略 key：${文档.心法}/${文档.攻略名 || '待填写'}`}
        required
      >
        <Input
          value={文档.攻略名}
          onChange={(事件) => 修改('攻略名', 事件.target.value)}
          placeholder='例如：紫武一键宏'
        />
      </Form.Item>
      <Form.Item label='攻略标题' required>
        <Input value={文档.标题} onChange={(事件) => 修改('标题', 事件.target.value)} />
      </Form.Item>
      <Form.Item label='发布后的展示模式'>
        <Select
          value={文档.模式}
          options={['计算结果', '全屏'].map((value) => ({
            value,
            label: value === '计算结果' ? '对齐计算结果面板' : '全屏',
          }))}
          onChange={(值) => 修改('模式', 值)}
        />
      </Form.Item>
      {(['作者', '原文', '循环署名'] as const).map((键) => (
        <Form.Item key={键} label={键 === '原文' ? '原文链接' : 键}>
          <Input value={文档[键]} onChange={(事件) => 修改(键, 事件.target.value)} />
        </Form.Item>
      ))}
      <Form.Item label='待绑定循环' extra='随稿件导出，由开发者核对后绑定；不会修改线上循环。'>
        <Select
          mode='multiple'
          showSearch
          optionFilterProp='label'
          value={文档.绑定循环}
          options={[...循环, ...未匹配.map((value) => ({ value, label: `${value}（待核对）` }))]}
          onChange={(值) => 修改('绑定循环', 值)}
        />
      </Form.Item>
      <Form.Item
        label='预览使用的循环'
        extra='用于展示未显式指定的奇穴和秘籍，与待绑定循环分别选择。'
      >
        <Select
          allowClear
          showSearch
          optionFilterProp='label'
          value={文档.预览循环 || undefined}
          options={循环}
          onChange={(值) => 修改('预览循环', 值 || '')}
        />
      </Form.Item>
      {!!未匹配.length && (
        <Alert type='warning' message='部分旧绑定无法匹配当前心法，已保留原值并标为待核对。' />
      )}
    </Form>
  )
}
