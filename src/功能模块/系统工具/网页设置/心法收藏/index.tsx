import React, { useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import { 读取收藏门派, 写入收藏门派 } from '@/工具函数/收藏心法'
import styles from './index.module.less'

const 所有心法 = Object.values(心法数据).filter((心法: any) => !心法?.邀请使用)

function 心法收藏(props: { open?: boolean }) {
  const { open } = props
  const [收藏简写, 设置收藏简写] = useState<string[]>([])
  const 收藏容器 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      设置收藏简写(读取收藏门派())
    }
  }, [open])

  const 收藏心法 = 收藏简写
    .map((简写) => 所有心法.find((心法: any) => 心法?.简写 === 简写))
    .filter(Boolean)
  const 常规心法 = 所有心法.filter((心法: any) => !收藏简写.includes(心法?.简写))

  const 切换收藏 = (简写: string) => {
    设置收藏简写((当前) => {
      const 下一份 = 当前.includes(简写) ? 当前.filter((项) => 项 !== 简写) : [...当前, 简写]
      写入收藏门派(下一份)
      return 下一份
    })
  }

  // 已收藏心法支持拖拽排序，排序结果持久化到 localStorage
  useEffect(() => {
    const 容器 = 收藏容器.current
    if (!容器) return
    const sortable = Sortable.create(容器, {
      animation: 150,
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        设置收藏简写((当前) => {
          const 下一份 = [...当前]
          const [移动项] = 下一份.splice(oldIndex, 1)
          下一份.splice(newIndex, 0, 移动项)
          写入收藏门派(下一份)
          return 下一份
        })
      },
    })
    return () => sortable.destroy()
  }, [])

  const 渲染图标 = (心法: any, 已收藏: boolean) => {
    const 名称 = 心法?.名称?.replace('_悟', '')
    return (
      <div
        key={心法?.简写}
        className={`${styles.图标项} ${已收藏 ? styles.图标项已收藏 : ''}`}
        title={已收藏 ? `点击取消收藏「${名称}」` : `点击收藏「${名称}」`}
        onClick={() => 切换收藏(心法?.简写)}
      >
        <img className={styles.图标} src={心法?.系统配置?.心法图标} alt={名称} draggable={false} />
        <span className={styles.名称}>{名称}</span>
      </div>
    )
  }

  return (
    <>
      <div className={styles.说明}>
        收藏的心法会显示在首页顶部横条最前方；在「已收藏」区域按住图标拖拽即可调整顺序。
      </div>
      <div className={styles.分组标题}>已收藏心法（拖拽排序）</div>
      <div className={styles.图标列表} ref={收藏容器}>
        {收藏心法.map((心法: any) => 渲染图标(心法, true))}
        {收藏心法.length === 0 ? (
          <div className={styles.空提示}>暂无收藏，点击下方心法添加</div>
        ) : null}
      </div>
      <div className={styles.分组标题}>未收藏心法（点击收藏）</div>
      <div className={styles.图标列表}>{常规心法.map((心法: any) => 渲染图标(心法, false))}</div>
    </>
  )
}

export default 心法收藏
