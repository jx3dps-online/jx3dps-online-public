import { Popover, Tag } from 'antd'
import { memo, useMemo } from 'react'
import { 装备属性信息模型, 装备类型枚举 } from '@/@types/装备'
import 图标 from '@/数据/静态数据/图标.json'
import styles from './index.module.less'
import 装备来源 from './装备来源'
import 装备属性 from './装备属性'
import 装备镶嵌 from './装备镶嵌'
import 装备特效 from './装备特效'
import ImageComponent from '@/组件/图片展示'
import use移动端 from '@/hooks/use移动端'

interface 装备详情容器类型 {
  children: React.ReactNode
  装备数据: 装备属性信息模型
  当前装备信息?: any // 选择装备的全部信息包含附魔等
  属性差?: Record<string, number>
  /** 触发器（包裹 children 的 Popover）自定义 className，缺省为占满宽度的 wrap */
  wrapClassName?: string
}

const 装备属性变化 = ({ 属性差 }: { 属性差: Record<string, number> }) => {
  const 属性列表 = [
    '攻击',
    '装分',
    '会心',
    '破防',
    '无双',
    '主属性',
    '会效',
    '加速',
    '全能',
    '武伤',
  ].filter((名称) => 属性差[名称])

  return (
    <div className={styles.data}>
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>更换后属性变化</h1>
      </div>
      <div className={styles.属性变化列表}>
        {属性列表.map((名称) => {
          const 值 = 属性差[名称]
          const 是提升 = 值 > 0
          return (
            <div key={名称} className={styles.属性变化项}>
              <Tag className={styles.attrLabel}>{名称}</Tag>
              <span className={是提升 ? 'dps-up-color' : 'dps-low-color'}>
                {是提升 ? `+${值}` : 值}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const 装备详情容器: React.FC<装备详情容器类型> = (props) => {
  const { children, 装备数据, 当前装备信息, 属性差, wrapClassName } = props

  const 装备图标 = useMemo(() => {
    return `https://icon.jx3box.com/icon/${装备数据?.图标ID}.png`
  }, [装备数据])

  const 移动端 = use移动端()

  const 装备背景 =
    装备数据?.装备类型 === 装备类型枚举?.橙武 ? 图标?.橙色装备边框 : 图标?.紫色装备边框

  return (
    <Popover
      className={wrapClassName !== undefined ? wrapClassName : styles.wrap}
      placement='right'
      mouseEnterDelay={1}
      destroyTooltipOnHide
      open={移动端 ? false : undefined}
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
          {属性差 && Object.keys(属性差)?.length ? <装备属性变化 属性差={属性差} /> : null}
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
