import React, { useState } from 'react'
import { Collapse, Radio, Space, Tabs, Typography } from 'antd'
import type { 心法说明 } from '../类型'
import { 宏编辑内容, 读取编辑分页, 更新编辑分页 } from '../工具/分页编辑'
import 宏文本输入, { 宏字数 } from './宏文本输入'
import 样式 from './样式.module.less'

function 体态分页编辑({
  文本,
  分页,
  当前页,
  设置选中,
  更新文本,
  禁用,
}: {
  文本: string
  分页: ReturnType<typeof 读取编辑分页>
  当前页: ReturnType<typeof 读取编辑分页>[number] | undefined
  设置选中: (键: string) => void
  更新文本: (文本: string) => void
  禁用: boolean
}) {
  const 输入框 = (内容: string, 更新: (内容: string) => void, 名称: string) => (
    <宏文本输入
      aria-label={名称}
      value={内容}
      显示字数={名称 === '分页文本'}
      onChange={(事件) => 更新(事件.target.value)}
      rows={14}
      disabled={禁用}
      spellCheck={false}
      placeholder='/cast [条件] 技能名'
    />
  )
  return (
    <>
      <Tabs
        activeKey={当前页?.键}
        onChange={设置选中}
        items={分页.map((页, 索引) => ({
          key: 页.键,
          label:
            页.名称 +
            (分页.some((前页, 位置) => 位置 < 索引 && 前页.名称 === 页.名称)
              ? '（' + (索引 + 1) + '）'
              : ''),
        }))}
      />
      {当前页 &&
        输入框(
          当前页.文本,
          (内容) => {
            if (当前页.新增页名 && 内容)
              设置选中('页-' + (分页.filter((页) => !页.新增页名).length + 1))
            更新文本(更新编辑分页(文本, 当前页, 内容))
          },
          当前页.名称 + '页宏',
        )}
      <Typography.Text type='secondary'>
        按实际体态自动翻页，标签只选择编辑的页。切态技能的效果由原模拟器执行。
      </Typography.Text>
      <Collapse
        size='small'
        items={[
          {
            key: '分页文本',
            label: '编辑分页文本',
            children: (
              <>
                <Typography.Paragraph type='secondary'>
                  可粘贴带 #page 的多页宏；错误行号按此处的完整文本计算。
                </Typography.Paragraph>
                {输入框(文本, 更新文本, '分页文本')}
              </>
            ),
          },
        ]}
      />
    </>
  )
}

export default function 分页编辑器({
  宏信息,
  编辑,
  说明,
  更新编辑,
  禁用,
}: {
  宏信息: React.ReactNode
  编辑: 宏编辑内容
  说明: 心法说明
  更新编辑: (内容: 宏编辑内容) => void
  禁用: boolean
}) {
  const [选中, 设置选中] = useState<string>()
  const 分页 = 读取编辑分页(编辑.翻页, 说明)
  const 当前页 = 分页.find((页) => 页.键 === 选中) || 分页[0]
  return (
    <Space direction='vertical' size={12} style={{ display: 'flex' }}>
      <div className={样式.宏信息}>
        {宏信息}
        <div className={样式.字数}>
          <宏字数 文本={编辑.模式 === '单页' ? 编辑.单页 : 当前页?.文本 || ''} />
        </div>
      </div>
      <div className={样式.模式栏}>
        <Space wrap>
          <span>宏模式</span>
          <Radio.Group
            value={编辑.模式}
            disabled={禁用}
            optionType='button'
            buttonStyle='solid'
            options={[
              { label: '单页宏（不翻页）', value: '单页' },
              { label: '体态翻页', value: '翻页' },
            ]}
            onChange={(事件) => 更新编辑({ ...编辑, 模式: 事件.target.value })}
          />
        </Space>
      </div>
      {编辑.模式 === '单页' ? (
        <>
          <宏文本输入
            aria-label='单页宏'
            value={编辑.单页}
            显示字数={false}
            onChange={(事件) => 更新编辑({ ...编辑, 单页: 事件.target.value })}
            rows={14}
            disabled={禁用}
            spellCheck={false}
            placeholder='/cast [条件] 技能名'
          />
          <Typography.Text type='secondary'>所有体态共用同一宏，不自动翻页。</Typography.Text>
        </>
      ) : (
        <体态分页编辑
          文本={编辑.翻页}
          分页={分页}
          当前页={当前页}
          设置选中={设置选中}
          禁用={禁用}
          更新文本={(文本) => 更新编辑({ ...编辑, 翻页: 文本 })}
        />
      )}
      <Typography.Text type='secondary'>
        两种模式的输入分别保留，生成只使用当前模式。
      </Typography.Text>
    </Space>
  )
}
