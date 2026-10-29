import React from 'react'
import { Popover } from 'antd'
import { useAppSelector } from '@/hooks'
import { 获取当前职业的所有秘籍信息 } from '@/功能模块/基础设置/公用设置/秘籍选择/utils'
import styles from '../引用样式.module.less'

interface 秘籍引用类型 {
  技能名称: string
  秘籍名称: string
  /** 原文与计算器枚举名称不同时显式指定，不改动原文。 */
  计算器秘籍名称?: string
  children: React.ReactNode
}

function 秘籍引用({ 技能名称, 秘籍名称, 计算器秘籍名称 = 秘籍名称, children }: 秘籍引用类型) {
  const 当前秘籍信息 = useAppSelector((state) => state.data.当前秘籍信息)
  const 技能 = 获取当前职业的所有秘籍信息().find((item) => item.技能名称 === 技能名称)
  const 可选 = 技能?.技能秘籍列表.includes(计算器秘籍名称)
  const 已选 = 当前秘籍信息?.[技能名称]?.includes(计算器秘籍名称)

  return (
    <Popover
      title={`${技能名称} · ${秘籍名称}`}
      zIndex={2200}
      trigger={['hover', 'focus']}
      content={
        可选
          ? `计算器条目：${计算器秘籍名称}；${已选 ? '当前已选' : '当前未选'}。可在秘籍设置中调整。`
          : '计算器秘籍设置未收录此项；保留攻略原文，不自动写入计算配置。'
      }
    >
      <span className={styles['guide-ref']} style={{ color: 'inherit' }} tabIndex={0}>
        {children}
      </span>
    </Popover>
  )
}

export default 秘籍引用
