import React from 'react'
import 装备详情容器 from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择/装备详情容器'
import { 根据装备id获取装备数据 } from '../../../工具'
import styles from '../引用样式.module.less'

interface 装备引用类型 {
  /** 装备 id */
  装备id: number
  children: React.ReactNode
  当前装备信息?: any
}

function 装备引用(props: 装备引用类型) {
  const { 装备id, children, 当前装备信息 } = props
  const 装备数据 = 根据装备id获取装备数据(装备id)

  if (!装备数据) {
    return <span className={styles['guide-ref']}>{children}</span>
  }

  return (
    <装备详情容器 装备数据={装备数据} 当前装备信息={当前装备信息} wrapClassName=''>
      <span className={styles['guide-ref']}>{children}</span>
    </装备详情容器>
  )
}

export default 装备引用
