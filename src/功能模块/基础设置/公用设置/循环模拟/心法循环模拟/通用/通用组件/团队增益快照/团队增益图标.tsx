import React, { useMemo } from 'react'
import { 副本事件实例类型 } from '@/@types/副本事件'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 获取实例总持续时间 } from '../副本事件编辑器/utils'
import './index.css'

interface 团队增益图标类型 {
  实例列表: 副本事件实例类型[]
  图标: string
  事件名称: string
  当前时间: number
}

const 团队增益图标: React.FC<团队增益图标类型> = (props) => {
  const { 实例列表, 图标, 事件名称, 当前时间, ...rest } = props

  const 剩余时间 = useMemo(() => {
    const 该事件实例 = (实例列表 || []).filter((实例) => 实例?.事件名称 === 事件名称)
    if (!该事件实例?.length) {
      return { 当前剩余CD: 0, 当前剩余持续时间: 0, 无法再次释放: true }
    }
    let 剩余覆盖 = 0
    const 覆盖中 = 该事件实例.some((实例) => {
      const 结束 = 实例.释放时间 + 获取实例总持续时间(实例)
      if (实例.释放时间 <= 当前时间 && 当前时间 < 结束) {
        剩余覆盖 = Math.max(剩余覆盖, 结束 - 当前时间)
        return true
      }
      return false
    })
    if (覆盖中) {
      return { 当前剩余CD: 0, 当前剩余持续时间: 剩余覆盖, 无法再次释放: false }
    }
    const 未来释放时间 = 该事件实例
      .map((实例) => 实例.释放时间)
      .filter((时间) => 时间 > 当前时间)
      .sort((a, b) => a - b)[0]
    if (未来释放时间 !== undefined) {
      return {
        当前剩余CD: 未来释放时间 - 当前时间,
        当前剩余持续时间: 0,
        无法再次释放: false,
      }
    }
    return { 当前剩余CD: 0, 当前剩余持续时间: 0, 无法再次释放: true }
  }, [当前时间, 实例列表, 事件名称])

  return (
    <div
      className={`cycle-simulator-team-buff-img-wrap ${
        剩余时间?.无法再次释放 || 剩余时间?.当前剩余CD > 0
          ? 'cycle-simulator-team-buff-img-disabled'
          : ''
      }`}
      {...rest}
    >
      <img src={图标} className={'cycle-simulator-team-buff-img'} />
      {剩余时间?.当前剩余持续时间 > 0 ? (
        <div className={'cycle-simulator-team-buff-limit-time'}>
          {(剩余时间?.当前剩余持续时间 / 每秒郭氏帧)?.toFixed(1)}
        </div>
      ) : 剩余时间?.当前剩余CD > 0 && !剩余时间?.无法再次释放 ? (
        <div className={'cycle-simulator-team-buff-limit-time'}>
          {(剩余时间?.当前剩余CD / 每秒郭氏帧)?.toFixed(1)}
        </div>
      ) : null}
    </div>
  )
}

export default React.memo(团队增益图标)
