import React, { useContext, useMemo } from 'react'
import { Divider, Tooltip } from 'antd'
import { useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import 团队增益图标 from '@/功能模块/基础设置/增益面板/团队增益选择/团队增益图标'
import useCycle from '@/hooks/use-cycle'
import { 阵眼数据类型 } from '@/数据/阵眼/interface'
import { 延迟设定 } from '@/数据/常量'
import { 小药小吃数据类型 } from '@/@types/小药小吃'
import 配装推荐 from './配装推荐'
import styles from './index.module.less'
import ExportContext from '../context'

const 秒伤区 = () => {
  const { 团队增益 = [], 阵眼, 小药小吃 } = use心法数据()
  const { 更换装备后秒伤, 是否展示伤害 } = useContext(ExportContext)

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 当前输出计算目标名称 = useAppSelector((state) => state?.data?.当前输出计算目标名称)
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)

  const { 当前循环信息, 计算循环详情 } = useCycle()

  const 显示团队增益 = useMemo(() => {
    return (
      团队增益
        .filter((item) => {
          return (
            (增益数据?.团队增益 || []).find((a) => item?.增益名称 === a?.增益名称)?.启用 || false
          )
        })
        .map((item) => {
          const 当前数据 = (增益数据?.团队增益 || []).find((a) => item?.增益名称 === a?.增益名称)
          return {
            ...item,
            当前数据: 当前数据,
          }
        }) || []
    )
  }, [团队增益, 增益数据])

  const 当前阵眼: 阵眼数据类型 | false = useMemo(() => {
    if (!增益启用) {
      return false
    } else {
      const 数据 = 阵眼?.find((a) => a?.阵眼名称 === 增益数据?.阵眼)
      return 数据 || false
    }
  }, [增益数据, 增益启用, 阵眼])

  const 小吃小药数据: 小药小吃数据类型[] = useMemo(() => {
    if (!增益启用) {
      return [] as any
    } else {
      const 已见 = new Set<string>()
      const 数据: 小药小吃数据类型[] = []
      ;(增益数据?.小吃 || []).forEach((item) => {
        const 小吃 = 小药小吃?.find((a) => a?.小吃名称 === item)
        if (小吃 && !已见.has(小吃?.小吃名称)) {
          已见.add(小吃?.小吃名称)
          数据.push(小吃)
        }
      })
      return 数据
    }
  }, [增益数据, 增益启用, 阵眼, 小药小吃])

  const 延迟数据 = useMemo(() => {
    if (计算循环详情?.循环延迟要求 !== undefined) {
      const 标签 = 延迟设定?.find((item) => item?.value === 计算循环详情?.循环延迟要求)?.label
      return 标签?.replace(/[（(][^）)]*[）)]/g, '')
    } else {
      return undefined
    }
  }, [计算循环详情, 延迟设定])

  return (
    <div className={`${styles.dpsWrap} ${!增益启用 ? styles.dpsWrapNoGain : ''}`}>
      <div className={styles.header}>
        <div className={styles.dps}>
          <h1 className={styles.dpsNum}>
            {是否展示伤害 ? (更换装备后秒伤 ?? 当前计算结果?.秒伤) : '-------'}
          </h1>
          <span className={styles.dpsTip}>数值仅供参考</span>
        </div>
        <div className={styles.info}>
          <div className={styles.dpsInfo}>
            <span className={styles.label}>{当前输出计算目标名称}</span>
            <span className={styles.label}>
              {当前循环信息?.标题 || 当前循环信息?.名称 || 当前计算循环名称}
            </span>
            {延迟数据 !== undefined ? <span className={styles.label}>{延迟数据}</span> : null}
            <span className={styles.label}>{当前计算结果?.秒伤计算时间?.toFixed(0)}秒</span>
          </div>
          {增益启用 ? (
            <div className={styles.baseInfo}>
              {当前阵眼 ? (
                <div className={styles.zhenyanInfo}>
                  <img src={当前阵眼?.图标} />
                  <span>{当前阵眼?.阵眼标题 || 当前阵眼?.阵眼名称}</span>
                </div>
              ) : null}
              {小吃小药数据?.length ? (
                <div className={styles.xiaoyaoInfo}>
                  {小吃小药数据.map((数据) => {
                    return (
                      <div key={数据?.小吃名称}>
                        <Tooltip title={数据?.小吃名称}>
                          <img className={styles.xiaoyaoInfoIcon} src={数据?.图标} />
                        </Tooltip>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {增益启用 && 显示团队增益?.length ? (
        <div className={styles.content}>
          {显示团队增益.map((item) => {
            return (
              <团队增益图标
                className={styles.gainImg}
                data={item}
                key={item?.增益名称}
                当前数据={item?.当前数据}
              />
            )
          })}
        </div>
      ) : null}
      {增益启用 ? (
        <>
          <Divider className={styles.divider} />
          <配装推荐 />
        </>
      ) : null}
    </div>
  )
}

export default 秒伤区
