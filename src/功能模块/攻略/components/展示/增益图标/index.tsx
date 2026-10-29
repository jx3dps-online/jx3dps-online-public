import React from 'react'
import { Popover } from 'antd'
import { 根据增益名称获取增益数据 } from '../../../工具'
import styles from './index.module.less'

interface 增益图标类型 {
  增益名称: string
}

function 增益图标(props: 增益图标类型) {
  const { 增益名称 } = props
  const 数据 = 根据增益名称获取增益数据(增益名称)

  const 描述 = 数据?.增益描述
    ?.replaceAll('【', '<span style="color:#1677ff">')
    ?.replaceAll('】', '</span>')

  return (
    <Popover
      title={增益名称}
      content={
        <div className={styles['guide-buff-icon-content']}>
          <div dangerouslySetInnerHTML={{ __html: 描述 || '暂无描述' }} />
          {数据?.增益来源 ? (
            <div className={styles['guide-buff-icon-source']}>来源：{数据?.增益来源}</div>
          ) : null}
        </div>
      }
    >
      <span className={styles['guide-buff-icon']}>
        {数据?.增益图片 ? (
          <img className={styles['guide-buff-icon-img']} src={数据?.增益图片} alt={增益名称} />
        ) : null}
        <span className={styles['guide-buff-icon-name']}>{增益名称}</span>
      </span>
    </Popover>
  )
}

export default 增益图标
