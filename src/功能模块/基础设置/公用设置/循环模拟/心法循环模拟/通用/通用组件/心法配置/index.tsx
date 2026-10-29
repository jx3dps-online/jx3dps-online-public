import React, { useContext } from 'react'
import CycleSimulatorContext from '../../../../context'
import { Buff枚举 } from '../../通用框架/类型定义/Buff'
import 开场Buff from './开场Buff'
import styles from './index.module.less'

interface 心法配置区类型 {
  配置区?: React.ReactNode
  起手配置区?: React.ReactNode
  原始Buff数据: Buff枚举
  起手可选DOT?: string[]
}

const 心法配置区: React.FC<心法配置区类型> = (props) => {
  const { 配置区, 起手配置区, 原始Buff数据, 起手可选DOT } = props
  const { 设置团队快照容器 } = useContext(CycleSimulatorContext)
  return (
    <div className={styles.wrap}>
      <div className={styles.起手配置}>
        <div className={styles.团队快照容器} ref={设置团队快照容器} />
        {原始Buff数据 ? (
          <开场Buff 原始Buff数据={原始Buff数据} 起手可选DOT={起手可选DOT} />
        ) : null}
        {起手配置区}
      </div>
      {配置区 ? <div className={styles.config}>{配置区}</div> : null}
    </div>
  )
}

export default React.memo(心法配置区)
