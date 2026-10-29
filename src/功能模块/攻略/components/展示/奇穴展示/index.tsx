import React from 'react'
import { Tooltip } from 'antd'
import { useAppSelector } from '@/hooks'
import { 获取奇穴数据映射, 兜底图片 } from '../../../工具'
import styles from './index.module.less'

interface 奇穴展示类型 {
  /** 奇穴名称列表，缺省使用当前循环的奇穴 */
  奇穴?: string[]
}

function 奇穴展示(props: 奇穴展示类型) {
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 奇穴列表 = props?.奇穴?.length ? props?.奇穴 : 当前奇穴信息
  const 奇穴数据映射 = 获取奇穴数据映射()

  if (!奇穴列表?.length) return null

  return (
    <div className={styles['guide-qixue']}>
      {奇穴列表.map((名称, index) => {
        const 数据 = 奇穴数据映射?.[名称]
        return (
          <Tooltip key={`${名称}_${index}`} title={数据?.奇穴描述 || 名称} zIndex={2200}>
            <div className={styles['guide-qixue-item']}>
              <img
                className={styles['guide-qixue-img']}
                src={数据?.奇穴图片 || 兜底图片}
                alt={名称}
              />
              <span className={styles['guide-qixue-name']}>{名称}</span>
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

export default 奇穴展示
