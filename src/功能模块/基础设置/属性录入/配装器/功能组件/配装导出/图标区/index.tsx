import React, { useContext } from 'react'
import { use心法数据 } from '@/心法模块/心法上下文'
import styles from './index.module.less'
import ExportContext from '../context'

const 图标区 = () => {
  const { 系统配置 } = use心法数据()
  const { 显示数据 } = useContext(ExportContext)

  return (
    <div className={styles.logoWrap}>
      <img className={styles.logo} src={系统配置?.心法图标} />
      <div className={styles.score}>{显示数据?.装分}</div>
    </div>
  )
}

export default 图标区
