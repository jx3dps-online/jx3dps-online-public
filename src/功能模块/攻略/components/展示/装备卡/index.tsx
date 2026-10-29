import React from 'react'
import { Tag } from 'antd'
import 装备详情容器 from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择/装备详情容器'
import { 装备类型枚举 } from '@/@types/装备'
import 图标 from '@/数据/静态数据/图标.json'
import {
  根据装备id获取装备数据,
  兜底图片,
  属性简写枚举,
  属性颜色映射,
  装备不展示属性,
} from '../../../工具'
import styles from './index.module.less'

interface 装备卡类型 {
  装备id: number
  当前装备信息?: any
}

function 装备卡(props: 装备卡类型) {
  const { 装备id, 当前装备信息 } = props
  const 装备数据 = 根据装备id获取装备数据(装备id)

  if (!装备数据) return null

  const 装备图标地址 = `https://icon.jx3box.com/icon/${装备数据?.图标ID}.png`
  const 装备背景 =
    装备数据?.装备类型 === 装备类型枚举?.橙武 ? 图标?.橙色装备边框 : 图标?.紫色装备边框

  const 属性标签列表 = Array.from(
    new Set(
      (装备数据?.装备增益 || [])
        .map((增益) => 属性简写枚举[增益?.属性])
        .filter((名称) => 名称 && !装备不展示属性.has(名称)),
    ),
  )

  return (
    <装备详情容器 装备数据={装备数据} 当前装备信息={当前装备信息} wrapClassName=''>
      <div className={styles['guide-equip-card']}>
        <div className={styles['guide-equip-card-icon']}>
          <img
            className={styles['guide-equip-card-icon-img']}
            src={装备图标地址 || 兜底图片}
            alt={装备数据?.装备名称}
          />
          <img className={styles['guide-equip-card-icon-border']} src={装备背景} alt='' />
        </div>
        <div className={styles['guide-equip-card-info']}>
          <div className={styles['guide-equip-card-name-row']}>
            <div className={styles['guide-equip-card-name']}>{装备数据?.装备名称}</div>
            <span className={styles['guide-equip-card-level']}>{装备数据?.装备品级}品</span>
          </div>
          <div className={styles['guide-equip-card-meta']}>
            {属性标签列表.map((名称) => (
              <Tag color={属性颜色映射[名称] || 'blue'} key={名称} style={{ margin: 0 }}>
                {名称}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </装备详情容器>
  )
}

export default 装备卡
