import React from 'react'
import { Tooltip } from 'antd'
import { 属性类型, type 属性加成 } from '@/@types/属性'
import type { 增益收益条目 } from './收益计算'
import styles from './index.module.less'

const 属性名称 = Object.fromEntries(Object.entries(属性类型).map(([名称, 属性]) => [属性, 名称]))

export const 格式化增益效果 = ({ 属性, 值 }: 属性加成) => {
  const 名称 = 属性名称[属性]
  if (typeof 值 === 'function') return `${名称}：按技能机制计算`
  if (属性 === 属性类型.系数增伤) return `${名称}：×${值}`
  const 郭氏 = 名称.startsWith('郭氏')
  const 百分比 =
    郭氏 || 名称.includes('百分比') || 名称.includes('增伤') || 属性 === 属性类型.全局伤害因子
  const 数值 = 郭氏 ? 值 / 1024 : 值
  const 符号 = 数值 > 0 ? '+' : 数值 < 0 ? '−' : ''
  const 展示名称 = 郭氏 ? 名称.replace('郭氏', '').replace('等级', '') : 名称
  const 展示值 = Number((Math.abs(数值) * (百分比 ? 100 : 1)).toFixed(4))
  return `${展示名称} ${符号}${展示值}${百分比 ? '%' : ''}`
}

function 增益效果({ 条目 }: { 条目: 增益收益条目 }) {
  return (
    <div className={styles.效果}>
      {条目.效果列表.map((效果, 索引) => (
        <Tooltip key={索引} title={`适用技能：${效果.适用技能.join('、')}`}>
          <span>
            {条目.效果列表.length > 1 &&
              `${效果.适用技能.slice(0, 3).join('、')}${效果.适用技能.length > 3 ? '…' : ''}：`}
            {效果.属性列表.length ? 效果.属性列表.map(格式化增益效果).join('；') : '无属性加成'}
          </span>
        </Tooltip>
      ))}
    </div>
  )
}
export default 增益效果
