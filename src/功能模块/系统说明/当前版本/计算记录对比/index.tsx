import React, { useMemo } from 'react'
import styles from './index.module.less'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 计算记录类型 } from '@/@types/计算'
import { useAppSelector } from '@/hooks'
import useCycle from '@/hooks/use-cycle'
import { Divider } from 'antd'

const enum 记录对比状态 {
  伤害变更 = '伤害变更',
  循环变更 = '循环变更',
}

const 计算记录对比 = () => {
  const { 缓存映射 } = use心法数据()
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const { 全部循环 = [] } = useCycle()

  const 计算记录差异 = useMemo(() => {
    let 差异对比: any = null
    try {
      const 当前计算记录: 计算记录类型 = JSON.parse(localStorage.getItem(缓存映射.计算记录) || '{}')
      const 当前记录 = 当前计算记录?.当前记录
      if (当前记录?.秒伤) {
        // 记录循环是否存在
        const 循环是否存在 = 全部循环?.find((循环) => 循环?.名称 === 当前记录?.计算循环)
        if (循环是否存在) {
          if (当前计算结果?.秒伤 !== 当前记录?.秒伤) {
            差异对比 = {
              状态: 记录对比状态.伤害变更,
              循环信息: 循环是否存在?.标题,
              变更前秒伤: 当前记录?.秒伤,
              变动幅度: 当前计算结果?.秒伤 / 当前记录?.秒伤 - 1,
            }
          }
        } else {
          差异对比 = {
            状态: 记录对比状态.循环变更,
            循环信息: 当前记录?.计算循环,
          }
        }
      }
    } catch (e) {
      console.error(e, '获取计算记录失败')
    }
    return 差异对比
  }, [当前计算结果, 全部循环, 缓存映射])

  const 循环变更组件 = () => {
    return (
      <div>
        <h1 className={styles.title}>循环变更提示</h1>
        <p className={styles.text}>
          您曾经使用计算的循环
          <span className={styles.cycleTip}>{计算记录差异?.循环信息}</span>
          已经删除，请注意更换循环
        </p>
      </div>
    )
  }

  const 伤害变更组件 = () => {
    return (
      <div>
        <h1 className={styles.title}>伤害变更提示</h1>
        <p className={styles.text}>
          本次版本发布后，您使用的循环
          <span className={styles.cycleTip}>{计算记录差异?.循环信息}</span>
          的伤害期望发生变化，变动如下：
        </p>
        <div className={styles.content}>
          <div className={styles.contentItem}>
            <h1 className={styles.diffTitle}>替换前</h1>
            <h1 className={styles.diffNum}>{计算记录差异?.变更前秒伤}</h1>
          </div>
          <div className={styles.contentItem}>
            <h1 className={styles.diffTitle}>替换后</h1>
            <h1
              className={`${styles.diffNum} ${
                计算记录差异?.变动幅度 > 0 ? 'dps-up-color' : 'dps-low-color'
              }`}
            >
              {当前计算结果?.秒伤}
            </h1>
          </div>
          <div className={styles.contentItem}>
            <h1 className={styles.diffTitle}>变化比例</h1>
            <h1
              className={`${styles.diffNum} ${
                计算记录差异?.变动幅度 > 0 ? 'dps-up-color' : 'dps-low-color'
              }`}
            >
              {(计算记录差异?.变动幅度 * 100)?.toFixed(2)}%
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dpsLog}>
      {计算记录差异 ? (
        <>
          <Divider style={{ margin: '12px 0' }} />
          {计算记录差异?.状态 === 记录对比状态.循环变更 ? <循环变更组件 /> : <伤害变更组件 />}
        </>
      ) : null}
    </div>
  )
}

export default 计算记录对比
