import React from 'react'
import { Tooltip } from 'antd'
import type { 候选效用结果 } from './计算'
import styles from './index.module.less'

export const 秒伤分段 = [
  { 字段: '普通属性秒伤', 名称: '本体属性秒伤' },
  { 字段: '特效秒伤', 名称: '特效属性秒伤' },
] as const

function 秒伤条({ 装备, 范围 }: { 装备: 候选效用结果; 范围: { 最小: number; 最大: number } }) {
  let 正向累计 = 0
  let 负向累计 = 0
  const 分段 = 秒伤分段.map(({ 字段, 名称 }) => {
    const 值 = 装备[字段]
    const 起点 = 值 < 0 ? 负向累计 : 正向累计
    if (值 < 0) 负向累计 += 值
    else 正向累计 += 值
    return { 字段, 名称, 值, 起点: Math.min(起点, 起点 + 值) }
  })
  return (
    <Tooltip
      title={
        <>
          <div>属性秒伤（合计）：{装备.属性秒伤贡献.toLocaleString()} DPS</div>
          {分段.map(({ 字段, 名称, 值 }) => (
            <div key={字段}>
              {名称}：{值.toLocaleString()} DPS
            </div>
          ))}
          <div>
            固定当前循环与总加速，先计入本体属性，再计入可折算属性特效；不含无法折算容量或数值待确认的特效，不代表实际换装后的总
            DPS。
          </div>
        </>
      }
    >
      <div className={styles.容量条}>
        <div className={styles.容量底色} aria-hidden='true'>
          {分段.map(({ 字段, 值, 起点 }) => (
            <span
              key={字段}
              className={`${styles[字段]} ${styles.秒伤分段}`}
              style={{
                left: `${((起点 - 范围.最小) / (范围.最大 - 范围.最小)) * 100}%`,
                width: `${(Math.abs(值) / (范围.最大 - 范围.最小)) * 100}%`,
              }}
            />
          ))}
          {范围.最小 < 0 && (
            <span
              className={styles.秒伤零线}
              style={{ left: `${(-范围.最小 / (范围.最大 - 范围.最小)) * 100}%` }}
            />
          )}
        </div>
        <span className={styles.容量数值}>
          {装备.属性秒伤贡献.toLocaleString()}
          {装备.特效秒伤 !== 0 &&
            ` = ${装备.普通属性秒伤.toLocaleString()} ${装备.特效秒伤 > 0 ? '+' : '−'} ${Math.abs(装备.特效秒伤).toLocaleString()}`}
        </span>
      </div>
    </Tooltip>
  )
}

export default 秒伤条
