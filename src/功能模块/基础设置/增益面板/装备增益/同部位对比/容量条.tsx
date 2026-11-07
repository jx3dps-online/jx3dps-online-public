import React from 'react'
import { Tooltip } from 'antd'
import type { 候选效用结果 } from './计算'
import styles from './index.module.less'

export const 容量分段 = [
  { 字段: '普通容量', 名称: '普通属性' },
  { 字段: '加速容量', 名称: '加速' },
  { 字段: '特效容量', 名称: '特效' },
] as const

const 格式化数值 = (值: number) => 值.toLocaleString('zh-CN', { maximumFractionDigits: 2 })

function 容量条({ 装备, 最大容量 }: { 装备: 候选效用结果; 最大容量: number }) {
  const 有效分段 = 容量分段.filter(({ 字段 }) => 装备[字段] !== 0)
  return (
    <Tooltip
      title={
        <>
          <div>总容量（含加速）：{格式化数值(装备.总容量)}</div>
          <div>非加速容量：{格式化数值(装备.非加速容量)}</div>
          {容量分段.map(({ 字段, 名称 }) => (
            <div key={字段}>
              {名称}：{格式化数值(装备[字段])}
            </div>
          ))}
        </>
      }
    >
      <div className={styles.容量条}>
        <div className={styles.容量底色} aria-hidden='true'>
          {有效分段.map(({ 字段 }) => (
            <span
              key={字段}
              className={styles[字段]}
              style={{ width: `${(装备[字段] / 最大容量) * 100}%` }}
            />
          ))}
        </div>
        <span className={styles.容量数值}>
          {格式化数值(装备.总容量)}
          {有效分段.length > 1 &&
            ` = ${有效分段.map(({ 字段 }) => 格式化数值(装备[字段])).join(' + ')}`}
        </span>
      </div>
    </Tooltip>
  )
}

export default 容量条
