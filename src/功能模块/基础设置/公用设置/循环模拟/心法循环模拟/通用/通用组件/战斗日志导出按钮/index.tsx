import { Button } from 'antd'
import React from 'react'
import { 循环日志数据类型 } from '../../../../typs'
import { 每秒郭氏帧 } from '@/数据/常量'
import './index.css'

interface 战斗日志导出按钮 {
  日志信息: 循环日志数据类型[]
}

/**
 * 将单个单元格值转为安全的 CSV 字段（处理逗号、引号、换行）
 */
function escapeCsvField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return ''
  }
  const str = String(value)
  // 如果包含逗号、双引号或换行符，需要用双引号包裹并转义内部双引号
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * 将日志数组转为 CSV 字符串
 */
function convertLogsToCsv(logs: 循环日志数据类型[]): string {
  // CSV 表头
  const headers = [
    '序号',
    '日志',
    '日志类型',
    '日志时间(帧)',
    '日志时间(秒)',
    'Buff列表',
    '伤害次数',
    '战斗日志描述',
  ]

  const rows: string[] = [headers.join(',')]

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    const row = [
      escapeCsvField(i + 1),
      escapeCsvField(log.日志),
      escapeCsvField(log.日志类型),
      escapeCsvField(log.日志时间),
      escapeCsvField(log.日志时间 !== undefined ? (log.日志时间 / 每秒郭氏帧).toFixed(3) : ''),
      escapeCsvField(log.buff列表?.join(';') ?? ''),
      escapeCsvField(log.其他数据?.伤害次数),
      escapeCsvField(log.战斗日志描述),
    ]
    rows.push(row.join(','))
  }

  return rows.join('\n')
}

/**
 * 触发 CSV 文件下载
 */
function downloadCsv(csvContent: string, filename: string) {
  // 添加 BOM 以确保 Excel 正确识别中文编码
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const 战斗日志导出按钮 = (props: 战斗日志导出按钮) => {
  const { 日志信息 } = props

  const handleExport = () => {
    const csv = convertLogsToCsv(日志信息)
    // 文件名包含时间戳，便于区分
    const now = new Date()
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '_',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('')
    downloadCsv(csv, `战斗日志_${timestamp}.csv`)
  }

  return (
    <Button type='primary' style={{ marginLeft: 12 }} onClick={handleExport}>
      导出日志
    </Button>
  )
}

export default 战斗日志导出按钮
