import React from 'react'
import { Popover, Tag } from 'antd'
import { 根据附魔ID获取附魔数据, 属性简写枚举 } from '../../../工具'
import styles from '../引用样式.module.less'

interface 附魔引用类型 {
  附魔ID: number
  children: React.ReactNode
}

function 附魔引用(props: 附魔引用类型) {
  const { 附魔ID, children } = props
  const 数据 = 根据附魔ID获取附魔数据(附魔ID)

  const 增益列表 = 数据?.增益集合 || []

  return (
    <Popover
      title={数据?.附魔名称}
      content={
        数据 ? (
          <div className={styles['guide-enchant-ref-content']}>
            <div className={styles['guide-enchant-ref-list']}>
              {增益列表.map((item, index) => {
                return (
                  <div className={styles['guide-enchant-ref-item']} key={`${item?.属性}_${index}`}>
                    <Tag color='blue'>{属性简写枚举?.[item?.属性] || item?.属性}</Tag>
                    <span>+{item?.值}</span>
                  </div>
                )
              })}
            </div>
            {数据?.附魔装分 ? (
              <div className={styles['guide-enchant-ref-score']}>附魔装分：{数据?.附魔装分}</div>
            ) : null}
          </div>
        ) : (
          '暂无该附魔数据'
        )
      }
    >
      <span className={styles['guide-ref']}>{children}</span>
    </Popover>
  )
}

export default 附魔引用
