import React, { useMemo } from 'react'
import 结果统计 from '@/功能模块/计算结果/结果统计'
import { 循环日志数据类型 } from '../../../../simulator/type'
import { Divider, Popover } from 'antd'
import '../../../../index.css'
import { 计算结果技能列表类型 } from '@/@types/输出'

interface SkillCountModalProps {
  open: boolean
  onCancel: () => void
  dpsList: 计算结果技能列表类型[]
  total: number
  日志信息: 循环日志数据类型[]
}

const SkillCountModal: React.FC<SkillCountModalProps> = (props) => {
  const { open, onCancel, total, dpsList, 日志信息 } = props

  const { 引窍总倍率, 绝脉总倍率, 引窍统计数组, 绝脉统计数组 } = useMemo(() => {
    const 引窍数组 = (日志信息 || [])?.filter((item) => {
      return item?.日志?.includes('引窍') && item?.日志类型?.includes('造成伤害')
    })
    const 绝脉数组 = (日志信息 || [])?.filter((item) => {
      return item?.日志?.includes('绝脉') && item?.日志类型?.includes('造成伤害')
    })
    const { 总倍率: 引窍总倍率, 统计数组: 引窍统计数组 } = 获取总倍率数组(引窍数组)
    const { 总倍率: 绝脉总倍率, 统计数组: 绝脉统计数组 } = 获取总倍率数组(绝脉数组)
    return {
      引窍总倍率,
      引窍统计数组,
      绝脉总倍率,
      绝脉统计数组,
    }
  }, [日志信息])

  return (
    <结果统计
      title={
        <div className={'cycle-simulator-modal-header space-between'}>
          <h1 className={'cycle-simulator-modal-title'}>技能统计</h1>
          <Popover
            content={
              <div className='ztg-cycle-simulator-skill-count-warp'>
                <div className='ztg-cycle-simulator-skill-count-item'>
                  <p>引窍倍率：{引窍总倍率}</p>
                  <Divider style={{ margin: '4px 0' }} />
                  {Object.keys(引窍统计数组).map((item) => {
                    return (
                      <p key={`引窍统计${item}`}>
                        引窍·{item}：{引窍统计数组[item]}次
                      </p>
                    )
                  })}
                </div>
                <div className='ztg-cycle-simulator-skill-count-item'>
                  <p>绝脉倍率：{绝脉总倍率}</p>
                  <Divider style={{ margin: '4px 0' }} />
                  {Object.keys(绝脉统计数组).map((item) => {
                    return (
                      <p key={`绝脉统计${item}`}>
                        绝脉·{item}：{绝脉统计数组[item]}次
                      </p>
                    )
                  })}
                </div>
              </div>
            }
          >
            <span className={'cycle-simulator-help'}>技能细节</span>
          </Popover>
        </div>
      }
      计算结果={{
        总伤: total,
        计算结果技能列表: dpsList,
      }}
      visible={open}
      onClose={() => onCancel()}
    />
  )
}

export default SkillCountModal

export const 获取对应实际倍率 = (日志) => {
  return 日志?.其他数据?.技能等级 || 1
}

const 获取总倍率数组 = (数组) => {
  let 倍率 = 0

  const 统计完整数据 = 数组
    .map((item) => {
      const 本次倍率 = 获取对应实际倍率(item)
      倍率 = 倍率 + 本次倍率
      return 本次倍率
    })
    .filter((item) => item !== -1)

  const 统计数组 = 获取出现次数(统计完整数据)
  return {
    总倍率: 倍率,
    统计数组,
  }
}

function 获取出现次数(arr) {
  return arr.reduce((acc, curr) => {
    acc[curr] ? acc[curr]++ : (acc[curr] = 1)
    return acc
  }, {})
}
