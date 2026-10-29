import React from 'react'
import { Button, InputNumber } from 'antd'
import { 副本事件实例类型 } from '@/@types/副本事件'
import { 帧转分秒帧 } from '../utils'
import styles from '../index.module.less'

interface 实例编辑面板Props {
  实例: 副本事件实例类型
  只读?: boolean
  onUpdate释放时间: (值: number) => void
  onUpdate阶段持续时间: (阶段索引: number, 值: number) => void
  onDelete: () => void
}

const 实例编辑面板: React.FC<实例编辑面板Props> = (props) => {
  const { 实例, 只读, onUpdate释放时间, onUpdate阶段持续时间, onDelete } = props

  return (
    <div className={styles.detailPanel}>
      <span className={styles.detailTitle}>{实例.事件名称}</span>
      <span className={styles.detailItem}>
        <span>释放时间</span>
        <InputNumber
          size='small'
          min={0}
          precision={0}
          value={实例.释放时间}
          disabled={只读}
          onChange={(e) => onUpdate释放时间(e || 0)}
        />
        <span className={styles.timeText}>{帧转分秒帧(实例.释放时间).文本}</span>
      </span>
      {(实例.阶段列表 || []).map((阶段, index) => (
        <span className={styles.detailItem} key={index}>
          <span>{阶段.阶段名称} 持续时间</span>
          <InputNumber
            size='small'
            min={1}
            precision={0}
            value={阶段.持续时间}
            disabled={只读}
            onChange={(e) => onUpdate阶段持续时间(index, e || 1)}
          />
          <span className={styles.timeText}>{帧转分秒帧(阶段.持续时间).文本}</span>
        </span>
      ))}
      {只读 ? null : (
        <Button size='small' danger onClick={onDelete}>
          删除实例
        </Button>
      )}
    </div>
  )
}

export default React.memo(实例编辑面板)
