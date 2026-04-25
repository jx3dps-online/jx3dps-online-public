import React, { useMemo } from 'react'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { useAppSelector } from '@/hooks'
import styles from './index.module.less'

const { 奇穴数据 } = 获取当前数据()

const 兜底图片 = 'https://icon.jx3box.com/icon/13.png'

const 奇穴区 = () => {
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)

  const 完整样式显示 = !增益启用

  const 全部奇穴数据 = useMemo(() => {
    const 奇穴列表: any[] = []
    奇穴数据?.forEach((item) => {
      item?.奇穴列表?.forEach((a) => {
        奇穴列表.push(a)
      })
    })
    return 奇穴列表
  }, [奇穴数据])

  return (
    <div className={`${styles.qixueWrap} ${完整样式显示 ? styles.full : ''}`}>
      {完整样式显示 ? <div className={styles.qixueTitle}>奇 穴</div> : null}
      <div className={styles.qixueContent}>
        {当前奇穴信息.map((item) => {
          const 图片 = 全部奇穴数据?.find((a) => a?.奇穴名称 === item)?.奇穴图片
          const 前两位 = item?.substring(0, 2)
          return (
            <div className={styles.item} key={`export_qixue_${item}`}>
              <img className={styles.img} src={图片 || 兜底图片} />
              <h1 className={styles.title}>{前两位}</h1>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default 奇穴区
