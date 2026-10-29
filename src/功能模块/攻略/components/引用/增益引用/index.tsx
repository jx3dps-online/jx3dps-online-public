import React from 'react'
import { Popover } from 'antd'
import { 根据增益名称获取增益数据 } from '../../../工具'
import styles from '../引用样式.module.less'

interface 增益引用类型 {
  增益名称: string
  children: React.ReactNode
}

function 增益引用(props: 增益引用类型) {
  const { 增益名称, children } = props
  const 数据 = 根据增益名称获取增益数据(增益名称)

  const 描述 = 数据?.增益描述
    ?.replaceAll('【', '<span style="color:#1677ff">')
    ?.replaceAll('】', '</span>')

  return (
    <Popover
      title={增益名称}
      content={
        数据 ? (
          <div className={styles['guide-buff-ref-content']}>
            {数据?.增益图片 ? (
              <img className={styles['guide-buff-ref-img']} src={数据?.增益图片} alt={增益名称} />
            ) : null}
            <div
              className={styles['guide-buff-ref-desc']}
              dangerouslySetInnerHTML={{ __html: 描述 || '暂无描述' }}
            />
            {数据?.增益来源 ? (
              <div className={styles['guide-buff-ref-source']}>来源：{数据?.增益来源}</div>
            ) : null}
          </div>
        ) : (
          '暂无该增益数据'
        )
      }
    >
      <span className={styles['guide-ref']}>{children}</span>
    </Popover>
  )
}

export default 增益引用
