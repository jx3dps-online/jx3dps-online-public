import React, { useContext, useMemo, useState } from 'react'
import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import { CloseCircleOutlined, FormOutlined, PlusCircleOutlined } from '@ant-design/icons'
import 开场Buff配置弹窗 from './开场Buff配置弹窗'
import styles from './index.module.less'
import { Buff枚举, 起手Buff } from '../../../通用框架/类型定义/Buff'
import { 每秒郭氏帧 } from '@/数据/常量'
import { Tooltip } from 'antd'

interface 开场Buff类型 {
  原始Buff数据: Buff枚举
  起手可选DOT?: string[]
}

const 开场Buff: React.FC<开场Buff类型> = (props) => {
  const { 原始Buff数据, 起手可选DOT } = props
  const { 起手Buff配置, 更新起手Buff配置 } = useContext(CycleSimulatorContext)

  const [配置弹窗展示, 设置配置弹窗展示] = useState(false)

  const noData = useMemo(() => {
    return !Object.keys(起手Buff配置)?.length
  }, [起手Buff配置])

  const 删除该buff = (data: 起手Buff) => {
    if (data?.名称) {
      const 新数据 = { ...起手Buff配置 }
      delete 新数据[data?.名称]
      更新起手Buff配置(新数据)
    }
  }

  const BuffItem = ({ data }: { data: 起手Buff }) => {
    if (!data?.名称) {
      return null
    }
    const 原始数据 = 原始Buff数据?.[data?.名称]
    const 获得秒数 = ((data?.获得时间 || 0) / 每秒郭氏帧).toFixed(2)
    return (
      <Tooltip title={原始数据?.备注}>
        <div className={styles.buff}>
          <div className={styles.buffImgWrap}>
            <img className={styles.buffImg} src={原始数据?.图标} />
            <span className={styles.buffCount}>{data?.层数}</span>
          </div>
          <span className={styles.buffName}>{data?.名称}</span>
          <span className={styles.buffTime}>
            <span className={styles.buffTimeText}>{获得秒数}</span>
            <span>秒</span>
          </span>
          <CloseCircleOutlined onClick={() => 删除该buff(data)} className={styles.close} />
        </div>
      </Tooltip>
    )
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>起手Buff</span>
      {noData ? (
        <span className={styles.empty}>无</span>
      ) : (
        <div className={styles.buffWrap}>
          {Object.keys(起手Buff配置).map((key, index) => {
            return <BuffItem key={index} data={起手Buff配置[key]} />
          })}
        </div>
      )}
      {noData ? (
        <PlusCircleOutlined className={styles.operate} onClick={() => 设置配置弹窗展示(true)} />
      ) : (
        <FormOutlined className={styles.operate} onClick={() => 设置配置弹窗展示(true)} />
      )}
      <开场Buff配置弹窗
        原始Buff数据={原始Buff数据}
        起手可选DOT={起手可选DOT}
        open={配置弹窗展示}
        onClose={() => 设置配置弹窗展示(false)}
      />
    </div>
  )
}

export default React.memo(开场Buff)
