import React from 'react'
import { Tooltip } from 'antd'
import { 模拟信息类型, 角色状态信息类型 } from '../../../simulator/type'
import styles from './index.module.less'

interface TitaiProps {
  角色状态信息: 角色状态信息类型
  模拟信息: 模拟信息类型
}

function Energy(props: TitaiProps) {
  const { 角色状态信息 } = props

  const 当前能量 = 角色状态信息?.剑舞 || 0

  return (
    <div className={styles.content}>
      <div className={styles.title}>剑舞</div>
      <Tooltip title={`${当前能量}点剑舞，上限5点`}>
        <div
          className={styles.resource}
          role='meter'
          aria-label='剑舞'
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={当前能量}
          aria-valuetext={`${当前能量}点剑舞`}
        >
          <div className={styles.value} aria-hidden='true'>
            {当前能量}
            <span className={styles.maximum}>/ 5</span>
          </div>
          <div className={styles.track} aria-hidden='true'>
            {[0, 1, 2, 3, 4].map((层数) => (
              <span
                key={层数}
                className={`${styles.segment} ${层数 < 当前能量 ? styles.active : ''}`}
                style={{ backgroundPosition: `${层数 * 25}% center` }}
              />
            ))}
          </div>
        </div>
      </Tooltip>
    </div>
  )
}

export default Energy
