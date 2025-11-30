import { memo } from 'react'
import styles from './index.module.less'
import { 属性简写枚举 } from '@/@types/枚举'
import 图标 from '@/数据/静态数据/图标.json'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

interface 装备镶嵌类型 {
  当前装备信息: any
  装备数据: any
}

const { 镶嵌孔: 镶嵌孔数据 } = 获取当前数据()

const 装备镶嵌: React.FC<装备镶嵌类型> = (props) => {
  const { 装备数据, 当前装备信息 } = props

  return (
    <div className={styles.data}>
      <h1 className={styles.title}>镶嵌</h1>
      <div className={styles.stoneContent}>
        {装备数据?.镶嵌孔数组?.map((镶嵌孔, index) => {
          const 图标信息 = 图标?.五行石?.[镶嵌孔?.镶嵌宝石等级 || 8]
          const 该镶嵌孔 = 镶嵌孔数据.find(
            (b) =>
              镶嵌孔.镶嵌类型 &&
              (镶嵌孔.镶嵌类型 === b.镶嵌类型 || b.镶嵌索引?.includes(镶嵌孔.镶嵌类型)),
          )
          const 等级数据 = 当前装备信息?.镶嵌孔数组?.[index]?.镶嵌宝石等级 || 8

          return (
            <div key={index} className={styles.stomeItem}>
              <img className={styles.stoneImg} src={图标信息} />
              <span className={styles.stomeLabel}>
                {镶嵌孔.镶嵌类型 ? 属性简写枚举[镶嵌孔.镶嵌类型] || '未知' : '未知'}
              </span>
              <div className={styles.stomeValue}>
                +{该镶嵌孔?.各等级增益数据[等级数据]?.增益数值}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(装备镶嵌)
