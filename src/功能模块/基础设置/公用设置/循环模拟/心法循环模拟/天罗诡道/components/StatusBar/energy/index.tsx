import React from 'react'
import { Tooltip } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'
import { 模拟信息类型, 角色状态信息类型 } from '../../../simulator/type'
import styles from './index.module.less'

interface TitaiProps {
  角色状态信息: 角色状态信息类型
  模拟信息: 模拟信息类型
}

function Enerty(props: TitaiProps) {
  const { 角色状态信息 } = props

  return (
    <div className={styles.content}>
      <div className={styles.wrap}>
        <div className={styles.title}>神机值</div>
        <Tooltip title={`神机值${角色状态信息?.神机值}点`}>
          <div className={styles.moyiWrap}>
            {按数字生成数组(10)?.map((a) => {
              return (
                <span
                  className={`${styles.moyiItem} ${
                    角色状态信息?.神机值 / 10 >= a ? styles.active : null
                  }`}
                  key={`神机值Key_${a}`}
                />
              )
            })}
            <span className={styles.moyiNum}>{角色状态信息?.神机值}</span>
          </div>
        </Tooltip>
      </div>
    </div>
  )
}

export default Enerty
