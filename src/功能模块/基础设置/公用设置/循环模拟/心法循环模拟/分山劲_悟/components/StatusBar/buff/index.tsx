import React from 'react'

import { Space, Tooltip } from 'antd'
import { Buff枚举, DOT列表 } from '../../../simulator/type'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 原始Buff数据 } from '../../../constant/skill'
import './index.css'

interface BuffProps {
  title: string
  buff列表: Buff枚举
  DOT列表?: DOT列表
  当前时间点: number
}

function Buff(props: BuffProps) {
  const { title, buff列表, DOT列表 = {}, 当前时间点 } = props
  const 需要隐藏的BUFF列表 = [
    '盾刀贰式标记',
    '盾刀叁式标记',
    '闪刀贰式标记',

    '闪刀增伤',
    '闪刀无双',
    '闪刀无双·2',
    '闪刀无双·3',
    '闪刀无双·4',
    '斩杀时间预估',
  ]
  const 当前buff列表 = Object.keys(buff列表)
    .map((item) => buff列表[item])
    .filter((item) => !需要隐藏的BUFF列表.includes(item.名称))

  const 当前Dot列表 = Object.keys(DOT列表)
    .map((item) => {
      const 原始数据 = 原始Buff数据?.[item]
      return {
        ...DOT列表[item],
        ...原始数据,
      }
    })
    ?.filter((item) => item?.待生效数据?.length)
    ?.map((item) => {
      const 最后一跳 = item.待生效数据?.[item.待生效数据.length - 1] || {}
      const 应该消失时间 = 最后一跳?.生效时间 || 0
      const 剩余时间 = 应该消失时间 - 当前时间点 || 0
      const 剩余时间秒 = (剩余时间 / 每秒郭氏帧).toFixed(1)
      const 层数 = 最后一跳.当前层数 || 0
      return {
        ...item,
        层数,
        剩余时间秒,
        剩余时间,
      }
    })
    ?.filter((a) => a?.剩余时间 && a?.剩余时间 >= 0)

  return (
    <div className={'cycle-status-bar-content cycle-status-bar-buff-content'}>
      <div className={'cycle-status-bar-title'}>{title}</div>
      <Space className={'cycle-status-bar-buff-list'} size={[8, 8]} wrap>
        {当前buff列表?.length
          ? 当前buff列表.map((item) => {
              const 应该消失时间 = (item.刷新时间 || 0) + (item.最大持续时间 || 0)
              const 剩余时间 = 应该消失时间 - 当前时间点 || 0
              const 剩余时间秒 = (剩余时间 / 每秒郭氏帧).toFixed(1)
              const 层数 = item.当前层数 || 0
              return (
                <div className={'cycle-status-bar-buff'} key={item.名称}>
                  <div className={'cycle-status-bar-buff-item'}>
                    <Tooltip title={`${item.名称}${层数 > 1 ? `${层数}层` : ''}`}>
                      <img className={'cycle-status-bar-buff-img'} src={item.图标} />
                    </Tooltip>
                    {层数 > 1 ? (
                      <span className={'cycle-status-bar-buff-count'}>{item.当前层数}</span>
                    ) : null}
                  </div>
                  <p
                    className={`cycle-status-bar-buff-second ${
                      剩余时间 < 每秒郭氏帧 * 2 ? 'cycle-status-bar-buff-second-limit' : ''
                    }`}
                  >
                    {剩余时间秒}
                  </p>
                </div>
              )
            })
          : null}
        {当前Dot列表?.length
          ? 当前Dot列表.map((item) => {
              const 剩余时间秒 = item?.剩余时间秒
              const 层数 = item?.层数
              return (
                <div className={'cycle-status-bar-buff'} key={item.名称}>
                  <div className={'cycle-status-bar-buff-item'}>
                    <Tooltip
                      title={
                        <div>
                          <p>{`${item.名称}${层数 > 1 ? `${层数}层` : ''}`}</p>
                          <p>{item.备注}</p>
                        </div>
                      }
                    >
                      <img className={'cycle-status-bar-buff-img'} src={item.图标} />
                    </Tooltip>
                    {层数 > 1 ? (
                      <span className={'cycle-status-bar-buff-count'}>{层数}</span>
                    ) : null}
                  </div>
                  <p
                    className={`cycle-status-bar-buff-second ${
                      item?.剩余时间 < 每秒郭氏帧 * 2 ? 'cycle-status-bar-buff-second-limit' : ''
                    }`}
                  >
                    {剩余时间秒}
                  </p>
                </div>
              )
            })
          : null}
        {!当前buff列表?.length && !当前Dot列表?.length ? (
          <p className={'cycle-buff-empty'}>无</p>
        ) : null}
      </Space>
    </div>
  )
}

export default Buff
