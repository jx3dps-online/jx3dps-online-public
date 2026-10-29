import React from 'react'
import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import styles from './index.module.less'

function 设置项(props) {
  const { 标题, 说明, children } = props
  return (
    <div className={styles.设置项}>
      <div className={styles.标题}>
        <span>{标题}</span>
        {说明 ? (
          <Tooltip title={说明}>
            <QuestionCircleOutlined className={styles.说明图标} />
          </Tooltip>
        ) : null}
      </div>
      <div className={styles.控件}>{children}</div>
    </div>
  )
}

export default 设置项
