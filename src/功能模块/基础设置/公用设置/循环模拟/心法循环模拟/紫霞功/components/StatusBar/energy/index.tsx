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

  const 当前能量 = (角色状态信息?.气点 || 0) / 2

  return (
    <div className={styles.content}>
      <div className={styles.title}>气点</div>
      <Tooltip title={`${当前能量}点气点，上限5点`}>
        <div
          className={styles.resource}
          role='meter'
          aria-label='气点'
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={当前能量}
          aria-valuetext={`${当前能量}点气点`}
        >
          <div className={styles.value} aria-hidden='true'>
            {当前能量}
            <span className={styles.maximum}>/ 5</span>
          </div>
          <div className={styles.track} aria-hidden='true'>
            {[0, 1, 2, 3, 4].map((层数) => (
              <span
                key={层数}
                className={styles.圆点}
                style={{
                  background: `linear-gradient(to right, var(--ant-primary-color) ${Math.min(1, Math.max(0, 当前能量 - 层数)) * 100}%, rgba(0,0,0,0.08) 0)`,
                }}
              />
            ))}
          </div>
        </div>
      </Tooltip>
    </div>
  )
}

export default Energy
