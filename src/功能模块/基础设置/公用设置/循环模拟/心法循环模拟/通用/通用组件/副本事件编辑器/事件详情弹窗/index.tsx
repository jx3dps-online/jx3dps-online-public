import React from 'react'
import { Popover } from 'antd'
import { 副本事件定义类型 } from '@/@types/副本事件'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 帧转分秒帧 } from '../utils'
import styles from './index.module.less'

interface 事件详情弹窗Props {
  children: React.ReactNode
  事件定义: 副本事件定义类型
}

const 事件详情弹窗: React.FC<事件详情弹窗Props> = (props) => {
  const { children, 事件定义 } = props

  const 总持续 = (事件定义.阶段列表 || []).reduce((s, a) => s + a.持续时间, 0)

  return (
    <Popover
      placement='right'
      mouseEnterDelay={0.2}
      destroyTooltipOnHide
      content={
        <div className={styles.content}>
          <div className={styles.header}>
            <img className={styles.icon} src={事件定义.图标} alt='' />
            <span className={styles.name}>{事件定义.事件名称}</span>
          </div>
          {事件定义.描述 ? <div className={styles.desc}>{事件定义.描述}</div> : null}
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>CD</span>
              <span className={styles.infoValue}>
                {事件定义.默认CD > 0 ? 帧转分秒帧(事件定义.默认CD).文本 : '一次性'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>持续</span>
              <span className={styles.infoValue}>{(总持续 / 每秒郭氏帧).toFixed(1)} 秒</span>
            </div>
            {事件定义.来源 ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>来源</span>
                <span className={styles.infoValue}>{事件定义.来源}</span>
              </div>
            ) : null}
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  )
}

export default React.memo(事件详情弹窗)
