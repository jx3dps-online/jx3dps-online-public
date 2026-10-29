import React from 'react'
import { Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { 副本事件实例类型 } from '@/@types/副本事件'
import { 帧转分秒帧, 获取实例总持续时间 } from '../utils'
import styles from '../index.module.less'

interface 实例详情列表Props {
  排序实例列表: 副本事件实例类型[]
  重叠实例idSet: Set<string>
  选中实例id?: string
  只读?: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  获取图标: (事件名称: string) => string | undefined
}

const 实例详情列表: React.FC<实例详情列表Props> = (props) => {
  const { 排序实例列表, 重叠实例idSet, 选中实例id, 只读, onSelect, onDelete, 获取图标 } = props

  return (
    <div className={styles.instanceList}>
      {排序实例列表?.length ? (
        排序实例列表.map((实例) => {
          const 总持续时间 = 获取实例总持续时间(实例)
          const 结束时间 = 实例.释放时间 + 总持续时间
          const 是否重叠 = 重叠实例idSet.has(实例.id)
          const 是否选中 = 选中实例id === 实例.id
          return (
            <div
              key={实例.id}
              className={`${styles.instanceItem} ${是否选中 ? styles.instanceItemActive : ''} ${
                是否重叠 ? styles.instanceItemOverlap : ''
              }`}
              onClick={() => onSelect(实例.id)}
            >
              <img className={styles.instanceIcon} src={获取图标(实例.事件名称)} alt='' />
              <span className={styles.instanceName}>{实例.事件名称}</span>
              <span className={styles.instancePhase}>
                {(实例.阶段列表 || []).map((阶段) => 阶段.阶段名称).join('→')}
              </span>
              <span className={styles.instanceTime}>
                {帧转分秒帧(实例.释放时间).文本} ~ {帧转分秒帧(结束时间).文本}
              </span>
              <span className={styles.instanceDuration}>（{帧转分秒帧(总持续时间).文本}）</span>
              {是否重叠 ? (
                <Tag color='orange' className={styles.instanceTag}>
                  重叠
                </Tag>
              ) : null}
              {只读 ? null : (
                <DeleteOutlined
                  className={styles.instanceDelete}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(实例.id)
                  }}
                />
              )}
            </div>
          )
        })
      ) : (
        <p className={styles.instanceEmpty}>暂无事件，请在「添加事件」模块中添加</p>
      )}
    </div>
  )
}

export default React.memo(实例详情列表)
