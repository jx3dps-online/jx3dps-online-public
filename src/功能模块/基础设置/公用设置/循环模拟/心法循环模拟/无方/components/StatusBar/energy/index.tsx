import React, { useMemo } from 'react'
import { Tooltip } from 'antd'
import classNames from 'classnames'
import { 按数字生成数组 } from '@/工具函数/help'
import { 模拟信息类型, 角色状态信息类型 } from '../../../simulator/type'
import styles from './index.module.less'
import { Progress } from 'antd'
interface TitaiProps {
  角色状态信息: 角色状态信息类型
  模拟信息: 模拟信息类型
}

function Enerty(props: TitaiProps) {
  const { 角色状态信息, 模拟信息 } = props

  const 当前能量 = 角色状态信息?.温寒 || 0
  const 当前内力 = 角色状态信息?.内力 || 100

  const 沾衣未妨剩余寒变化值 = useMemo(() => {
    const 待生效事件队列 = (模拟信息?.待生效事件队列 || [])?.filter(
      (a) => a?.事件名称 === '沾衣未妨',
    )
    if (!待生效事件队列.length) return []
    let 变化寒性值 = 0
    待生效事件队列.forEach((事件) => {
      const 本次值 = 事件?.事件备注?.香繁饮露触发 ? 2 : 1
      变化寒性值 += 本次值
    })
    const 最终序列: number[] = []
    for (let i = 1; i <= 变化寒性值; i++) {
      const 需要显示虚值 = Math.max(当前能量 - i, -5)
      if (!最终序列?.includes(需要显示虚值) && 需要显示虚值 !== 当前能量) {
        最终序列.push(需要显示虚值)
      }
    }
    return 最终序列
  }, [模拟信息, 当前能量])

  const 能量列表 = useMemo(() => {
    return 按数字生成数组(11)?.map((item) => {
      const value = item - 6
      return {
        值: value,
        文本: value < 0 ? '寒' : value > 0 ? '温' : '无',
        icon:
          value < 0
            ? 'https://icon.jx3box.com/icon/15642.png'
            : value > 0
              ? 'https://icon.jx3box.com/icon/15641.png'
              : '',
      }
    })
  }, [])

  const 显示文本 = useMemo(() => {
    if (当前能量 === 0) {
      return '无能量'
    } else if (当前能量 > 0) {
      return `${当前能量}点温性`
    } else {
      return `${Math.abs(当前能量)}点寒性`
    }
  }, [当前能量])
  const 内力显示文本 = useMemo(() => {
    return `当前内力：${当前内力}%`
  }, [当前内力])

  return (
    <div className={styles.content}>
      <div style={{ marginBottom: 10 }} className={styles.title}>
        药性
      </div>
      <Tooltip title={显示文本}>
        <div className={styles.wrap}>
          {能量列表?.map((能量, 索引) => {
            const 显示能量 = 能量?.值
            const 显示激活 =
              显示能量 > 0
                ? 当前能量 > 0 && 显示能量 <= 当前能量
                : 当前能量 < 0 && 显示能量 >= 当前能量
            const cls = classNames(
              styles.item,
              能量?.文本 === '温' ? styles.up : 能量?.文本 === '寒' ? styles.down : '',
              显示激活 ? styles.active : '',
              沾衣未妨剩余寒变化值?.includes(显示能量) ? styles.preZhan : '',
            )
            return 能量?.值 ? (
              <div className={cls} key={`能量_${索引}`}>
                {/* {能量?.文本} */}
                <img className={styles.icon} src={能量?.icon} />
              </div>
            ) : null
          })}
        </div>

        <div className={'cycle-status-bar-content cycle-status-energy-content'}>
          <div style={{ marginBottom: 0, marginTop: 4 }} className={'cycle-status-bar-title'}>
            内力
          </div>
          <div className={'cycle-status-bar-enerty-wrap'}>
            <div className={'cycle-status-bar-enerty-item'}>
              <Progress
                className={'cycle-status-bar-enerty'}
                percent={Math.floor(角色状态信息?.内力)}
                format={(percent) => `${percent}`}
              />
            </div>
          </div>
        </div>
      </Tooltip>
    </div>
  )
}

export default Enerty
