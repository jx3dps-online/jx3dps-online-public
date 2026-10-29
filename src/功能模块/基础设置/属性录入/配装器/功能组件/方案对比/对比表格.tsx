import React from 'react'
import { Table, Tag } from 'antd'
import { 方案对比结果 } from '@/@types/配装指导'
import { 统一属性面板键 } from './属性diff工具'
import styles from './index.module.less'

interface 对比表格入参 {
  对比结果: 方案对比结果
  仅看差异: boolean
}

const 维度列表 = ['秒伤', ...统一属性面板键]

function 对比表格(props: 对比表格入参) {
  const { 对比结果, 仅看差异 } = props
  const { 基准id, 列表 } = 对比结果

  const 基准条目 = 列表?.find((条目) => 条目?.快照?.id === 基准id)

  const 取值 = (条目, 维度) => {
    if (维度 === '秒伤') {
      return 条目?.秒伤
    }
    return 条目?.属性面板?.[维度]
  }

  const 基准值 = (维度) => 取值(基准条目, 维度)

  const 渲染单元格 = (维度: string, 条目, 值: number | undefined) => {
    if (维度 === '秒伤' && 条目?.加速不匹配) {
      return <span className={styles.加速不匹配}>加速不匹配</span>
    }
    const 是基准 = 条目?.快照?.id === 基准id
    const 基准数值 = 基准值(维度)
    if (是基准 || 基准数值 === undefined || 值 === undefined) {
      return <span>{值 ?? '-'}</span>
    }
    const 差 = 值 - 基准数值
    if (差 === 0) {
      return <span>{值}</span>
    }
    return <span className={差 > 0 ? styles.升 : styles.降}>{值}</span>
  }

  const columns: any[] = [
    {
      title: '维度',
      dataIndex: '维度',
      fixed: 'left',
      width: 90,
    },
    ...列表.map((条目) => ({
      title: (
        <div className={styles.列头}>
          <span className={styles.列头名称文本}>{条目?.快照?.名称}</span>
          {条目?.快照?.id === 基准id ? (
            <Tag color='blue' style={{ marginInlineEnd: 0 }}>
              基准
            </Tag>
          ) : null}
        </div>
      ),
      dataIndex: 条目?.快照?.id,
      width: 130,
      render: (值, row) => 渲染单元格(row?.维度, 条目, 值),
    })),
  ]

  const data = 维度列表.map((维度) => {
    const row: Record<string, any> = { 维度 }
    列表.forEach((条目) => {
      row[条目?.快照?.id] = 取值(条目, 维度)
    })
    return row
  })

  const 显示数据 = 仅看差异
    ? data.filter((row) => {
        const 维度 = row?.维度
        const 基 = 基准值(维度)
        return 列表.some((条目) => 条目?.快照?.id !== 基准id && 取值(条目, 维度) !== 基)
      })
    : data

  return (
    <Table
      rowKey='维度'
      columns={columns}
      dataSource={显示数据}
      pagination={false}
      size='small'
      scroll={{ x: 'max-content' }}
    />
  )
}

export default 对比表格
