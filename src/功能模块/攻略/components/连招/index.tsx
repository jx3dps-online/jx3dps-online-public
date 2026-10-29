import React from 'react'
import { Tooltip } from 'antd'
import { 兜底图片 } from '../../工具'
import { 从循环解析技能序列, 获取技能图标地址, 解析技能序列项 } from './工具'
import styles from './index.module.less'

interface 连招类型 {
  /**
   * 方式一：直接传入技能名称数组（可含 `技能名%{额外信息}` 与「换行」标记）
   */
  技能序列?: string[]
  /**
   * 方式二：传入本地模拟器的内置循环 JSON（读取其中的 技能序列）
   */
  循环?: { 技能序列?: string[] } | null
  /**
   * 心法名称，用于解析模拟器短名/特殊技能（如孤锋诀的「行」「停」）
   */
  心法?: string
  /**
   * 换行控制：每行最多显示的技能数量；缺省仅按「换行」标记换行
   */
  每行数量?: number
  /**
   * 图标边长（像素），默认 22
   */
  图标大小?: number
  /**
   * 是否在图标旁显示技能名称，默认 false（悬停图标显示名称）
   */
  显示名称?: boolean
}

function 连招(props: 连招类型) {
  const { 技能序列: 传入技能序列, 循环, 心法, 每行数量, 图标大小 = 32, 显示名称 = false } = props

  const 技能序列 = 传入技能序列 ?? 从循环解析技能序列(循环)
  const 技能列表 = (技能序列 || []).map(解析技能序列项)

  // 先按「换行」标记切分，再按「每行数量」切分
  const 行们: { 技能名称: string; 额外信息: Record<string, any> | null }[][] = []
  let 当前行: { 技能名称: string; 额外信息: Record<string, any> | null }[] = []
  for (const 技能 of 技能列表) {
    if (技能.是否为换行) {
      if (当前行.length) 行们.push(当前行)
      当前行 = []
      continue
    }
    if (!技能.技能名称) continue
    当前行.push({ 技能名称: 技能.技能名称, 额外信息: 技能.额外信息 })
    if (每行数量 && 当前行.length >= 每行数量) {
      行们.push(当前行)
      当前行 = []
    }
  }
  if (当前行.length) 行们.push(当前行)

  if (!行们.length) return null

  return (
    <div className={styles['guide-combo']}>
      {行们.map((行, 行索引) => (
        <div className={styles['guide-combo-row']} key={行索引}>
          {行.map((技能, 技能索引) => {
            const 图标 = 获取技能图标地址(技能.技能名称, 心法)
            const 延迟 = 技能.额外信息?.延迟
            const 提示 = 延迟 != null ? `${技能.技能名称}（延迟 ${延迟}）` : 技能.技能名称
            return (
              <Tooltip title={提示} key={`${技能.技能名称}_${技能索引}`}>
                <span className={styles['guide-combo-item']}>
                  <img
                    className={styles['guide-combo-img']}
                    src={图标 || 兜底图片}
                    alt={技能.技能名称}
                    style={{ width: 图标大小, height: 图标大小 }}
                  />
                  {显示名称 ? (
                    <span className={styles['guide-combo-name']}>{技能.技能名称}</span>
                  ) : null}
                </span>
              </Tooltip>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default 连招
