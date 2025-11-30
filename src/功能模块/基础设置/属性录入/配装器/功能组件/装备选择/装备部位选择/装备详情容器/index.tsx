import { Popover } from 'antd'
import { memo, useMemo } from 'react'
import { 装备属性信息模型, 装备类型枚举 } from '@/@types/装备'
import 图标 from '@/数据/静态数据/图标.json'
import styles from './index.module.less'
import 装备来源 from './装备来源'
import 装备属性 from './装备属性'
import 装备镶嵌 from './装备镶嵌'
import 装备特效 from './装备特效'
import ImageComponent from '@/组件/图片展示'

interface 装备详情容器类型 {
  children: React.ReactNode
  装备数据: 装备属性信息模型
  当前装备信息?: any // 选择装备的全部信息包含附魔等
}

const 装备详情容器: React.FC<装备详情容器类型> = (props) => {
  const { children, 装备数据, 当前装备信息 } = props

  const 装备图标 = useMemo(() => {
    return `https://icon.jx3box.com/icon/${装备数据?.图标ID}.png`
  }, [装备数据])

  const 装备背景 =
    装备数据?.装备类型 === 装备类型枚举?.橙武 ? 图标?.橙色装备边框 : 图标?.紫色装备边框

  return (
    <Popover
      className={styles.wrap}
      placement='right'
      mouseEnterDelay={1}
      destroyTooltipOnHide
      // open={当前装备信息?.装备部位 === '帽子'}
      content={
        <div className={styles.content}>
          <div className={styles.equipIcon}>
            <ImageComponent
              src={装备图标}
              key={`详情图标_${装备数据?.id}`}
              fallback={'https://icon.jx3box.com/icon/13.png'}
              className={styles.icon}
            />
            <img className={styles.border} src={装备背景} />
          </div>
          <装备属性 装备数据={装备数据} 当前装备信息={当前装备信息} />
          <装备镶嵌 装备数据={装备数据} 当前装备信息={当前装备信息} />
          <装备特效 装备数据={装备数据} />
          <装备来源 装备数据={装备数据} />
        </div>
      }
    >
      {children}
    </Popover>
  )
}

export default memo(装备详情容器)
