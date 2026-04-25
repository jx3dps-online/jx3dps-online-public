import React, { useMemo } from 'react'
import { 团队增益轴数据类型 } from '@/@types/团队增益'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import './index.css'
import { 每秒郭氏帧 } from '@/数据/常量'

const { 团队增益 = [] } = 获取当前数据()

interface 团队增益图标类型 {
  增益轴数据: 团队增益轴数据类型
  增益名称: string
  当前时间: number
}

const 团队增益图标: React.FC<团队增益图标类型> = (props) => {
  const { 增益轴数据, 增益名称, 当前时间, ...rest } = props
  const 图标 = useMemo(() => {
    return 团队增益?.find((item) => item?.增益名称 === 增益名称)?.增益图片
  }, [团队增益, 增益名称])

  const 剩余时间 = useMemo(() => {
    const { 持续时间 = 0, 平均间隔 = 0 } = 增益轴数据 || {}
    const 初次释放时间 = 增益轴数据?.释放时间点?.[0] || 0
    const 下次可释放时间 = 平均间隔 > 0 ? 获取最近一次释放时间(0) || 0 : 0
    const 当前剩余CD = 下次可释放时间 - 当前时间 || 0
    let 当前剩余持续时间 = 0

    if (增益名称 === '号令三军') {
      const 实际释放时间 = 初次释放时间
      const buff结束时间 = 实际释放时间 + 60 * 每秒郭氏帧
      return {
        当前剩余CD: 0,
        当前剩余持续时间: buff结束时间 - 当前时间,
        无法再次释放: 当前时间 > buff结束时间,
      }
    }

    if (下次可释放时间 >= 当前时间) {
      const 上一次释放时间 = 下次可释放时间 - 平均间隔 || 0
      if (上一次释放时间 + 持续时间 >= 当前时间) {
        当前剩余持续时间 = 上一次释放时间 + 持续时间 - 当前时间
      }
    }

    function 获取最近一次释放时间(释放次数) {
      const 实际释放时间 = 初次释放时间 + 平均间隔 * 释放次数
      if (实际释放时间 > 当前时间) {
        return 实际释放时间
      } else if (释放次数 < 1000) {
        return 获取最近一次释放时间(释放次数 + 1)
      } else {
        return 0
      }
    }

    return {
      当前剩余CD,
      当前剩余持续时间,
      无法再次释放: false,
    }
  }, [当前时间, 增益轴数据])

  return (
    <div
      className={`cycle-simulator-team-buff-img-wrap ${
        剩余时间?.无法再次释放 || (剩余时间?.当前剩余CD && !剩余时间?.当前剩余持续时间)
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
