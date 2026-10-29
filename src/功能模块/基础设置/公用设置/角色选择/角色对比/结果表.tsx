import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Table, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { 对比列, 对比行, 对比结果 } from './类型'
import 样式 from './index.module.less'

interface 结果表参数 {
  行: 对比行[]
  列: 对比列[]
  结果: Record<string, 对比结果>
  简易显示: boolean
}

const 结果表 = forwardRef<{ 定位最高: () => void }, 结果表参数>(function 结果表(
  { 行, 列, 结果, 简易显示 },
  ref,
) {
  const 表格元素 = useRef<HTMLDivElement>(null)
  const [定位格子, 设置定位格子] = useState<string>()
  useEffect(() => 设置定位格子(undefined), [行, 列, 结果])
  useImperativeHandle(ref, () => ({
    定位最高: () => {
      const 有效格子 = 行.flatMap((当前行) =>
        列.flatMap((当前列) => {
          const id = `${当前行.id}/${当前列.id}`
          const 秒伤 = 结果[id]?.秒伤
          return 秒伤 === undefined ? [] : [{ id, 秒伤 }]
        }),
      )
      const 最高 = Math.max(...有效格子.map((格子) => 格子.秒伤))
      const 并列 = 有效格子.filter((格子) => 格子.秒伤 === 最高)
      const 上次位置 = 并列.findIndex((格子) => 格子.id === 定位格子)
      const id = 并列[(上次位置 + 1) % 并列.length]?.id
      设置定位格子(id)
      const 单元格 = Array.from(
        表格元素.current?.querySelectorAll<HTMLElement>('[data-cell-id]') || [],
      ).find((元素) => 元素.dataset.cellId === id)
      单元格?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      单元格?.focus({ preventScroll: true })
    },
  }))
  const 表头: ColumnsType<对比行> = [
    {
      title: '名称',
      key: '名称',
      width: 160,
      fixed: 'left',
      render: (_, 行) => (
        <div className={样式.名称内容}>
          <span className={样式.行名称}>{行.名称}</span>
          <span className={样式.次要文字}>{行.来源}</span>
        </div>
      ),
    },
    {
      title: '加速概要',
      key: '加速概要',
      width: 200,
      fixed: 'left',
      render: (_, 行) =>
        行.加速概要 ? (
          <div className={样式.加速概要}>
            <div className={样式.加速数值}>
              <strong>{行.加速值}</strong>
              <span className={样式.次要文字}>加速</span>
              <span className={样式.数量标签}>小药 {行.加速概要.小药}</span>
              <span className={样式.数量标签}>酒 {行.加速概要.酒}</span>
            </div>
            <div className={样式.加速来源}>
              <span>装备</span>
              {行.加速概要.装备}
            </div>
            {行.加速概要.附魔 && (
              <div className={样式.加速来源}>
                <span>附魔</span>
                {行.加速概要.附魔}
              </div>
            )}
          </div>
        ) : (
          <Typography.Text type='secondary'>-</Typography.Text>
        ),
    },
  ]
  let 表格宽度 = 360
  for (const 当前列 of 列) {
    const 同列结果 = 行.map((行) => 结果[`${行.id}/${当前列.id}`])
    const 列已完成 = 同列结果.every(Boolean)
    const 有效秒伤 = 同列结果.flatMap((格子) => (格子?.秒伤 === undefined ? [] : [格子.秒伤]))
    const 最高秒伤 = 列已完成 && 有效秒伤.length ? Math.max(...有效秒伤) : undefined
    const 列宽 = 当前列.详情.循环加速值范围?.length ? 132 : 简易显示 ? 80 : 112
    表格宽度 += 列宽
    const 子列: ColumnsType<对比行>[number] = {
      title: 简易显示 ? (
        <Tooltip title={当前列.标题}>
          <span className={样式.简易表头}>{当前列.简易标题}</span>
        </Tooltip>
      ) : (
        <div className={样式.详情表头}>
          <span>{当前列.加速说明}</span>
          <span className={样式.次要文字}>{当前列.延迟说明}</span>
        </div>
      ),
      key: 当前列.id,
      width: 列宽,
      align: 'center',
      render: (_, 当前行) => {
        const id = `${当前行.id}/${当前列.id}`
        const 格子 = 结果[id]
        if (!格子) return <Typography.Text type='secondary'>待计算</Typography.Text>
        if (格子.原因)
          return (
            <Tooltip title={格子.原因}>
              <Typography.Text type='secondary'>-</Typography.Text>
            </Tooltip>
          )
        return (
          <span
            data-cell-id={id}
            tabIndex={-1}
            className={[
              样式.秒伤格,
              格子.秒伤 === 最高秒伤 ? 样式.最高 : '',
              定位格子 === id ? 样式.定位格 : '',
            ].join(' ')}
          >
            {格子.秒伤?.toLocaleString()}
          </span>
        )
      },
    }
    const 分组键 = 当前列.id.split(':')[0]
    const 分组 = 表头.find((项) => 项.key === `循环:${分组键}`)
    if (分组 && 'children' in 分组) 分组.children.push(子列)
    else
      表头.push({
        title: (
          <Tooltip
            title={`${当前列.循环.标题 || 当前列.循环.名称}${当前列.循环.备注 ? ` · ${当前列.循环.备注}` : ''}`}
          >
            <div className={样式.循环表头}>
              <div>{当前列.循环.标题 || 当前列.循环.名称}</div>
              {!简易显示 && 当前列.循环.备注 && (
                <div className={样式.次要文字}>{当前列.循环.备注}</div>
              )}
            </div>
          </Tooltip>
        ),
        key: `循环:${分组键}`,
        children: [子列],
      })
  }
  return (
    <div ref={表格元素} className={样式.表格}>
      <Table
        rowKey='id'
        columns={表头}
        dataSource={行}
        pagination={false}
        tableLayout='fixed'
        size='small'
        bordered
        scroll={{ x: 表格宽度, y: 'min(480px, max(180px, calc(100vh - 420px)))' }}
      />
    </div>
  )
})

export default 结果表
