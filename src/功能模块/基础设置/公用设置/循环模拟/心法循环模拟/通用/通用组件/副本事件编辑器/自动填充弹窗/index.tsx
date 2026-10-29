import React from 'react'
import { InputNumber, Modal } from 'antd'
import { 副本事件定义类型 } from '@/@types/副本事件'
import 事件定义原始 from '../事件定义.json'
import { 帧转分秒帧, 获取事件定义 } from '../utils'
import styles from '../index.module.less'

const 事件定义列表 = 事件定义原始 as 副本事件定义类型[]

interface 自动填充弹窗Props {
  open: boolean
  事件名称?: string
  首次施放时间: number
  on首次施放时间变化: (值: number) => void
  onCancel: () => void
  onOk: () => void
}

const 自动填充弹窗: React.FC<自动填充弹窗Props> = (props) => {
  const { open, 事件名称, 首次施放时间, on首次施放时间变化, onCancel, onOk } = props

  const 定义 = 获取事件定义(事件名称 || '', 事件定义列表)
  const CD文本 = 定义?.默认CD && 定义.默认CD > 0 ? 帧转分秒帧(定义.默认CD).文本 : '一次性'

  return (
    <Modal
      open={open}
      title='自动填充'
      okText='确认'
      cancelText='取消'
      onCancel={onCancel}
      onOk={onOk}
    >
      <div className={styles.autoFillBody}>
        <p>
          事件：
          {事件名称}（CD {CD文本}）
        </p>
        <p>首次施放时间（帧）</p>
        <InputNumber
          min={0}
          precision={0}
          value={首次施放时间}
          onChange={(e) => on首次施放时间变化(e || 0)}
        />
        <span className={styles.timeText}>{帧转分秒帧(首次施放时间).文本}</span>
      </div>
    </Modal>
  )
}

export default React.memo(自动填充弹窗)
