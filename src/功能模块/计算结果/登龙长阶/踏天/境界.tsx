import React from 'react'
import { Button } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取文案, 填充文案 } from '../文案'
import { 踏天阶位 } from './类型'

interface 属性 {
  比例?: number
  门槛秒伤?: number
  门槛循环: string
  已完成: boolean
  主动完成时间?: number
  历史完成时间?: number
  可完成: boolean
  on完成: () => void
}
export default function 踏天境界({
  比例,
  门槛秒伤,
  门槛循环,
  已完成,
  主动完成时间,
  历史完成时间,
  可完成,
  on完成,
}: 属性) {
  const { 名称 } = use心法数据()
  const 文案 = 获取文案(名称)
  const 阶序 = 比例 === undefined ? -1 : Math.min(3, Math.floor(比例 / 25))
  const 阶 = 踏天阶位[阶序]
  return (
    <section className='dragon-realm' aria-label={文案['踏天.境界.aria']}>
      <div className='dragon-realm-heading'>
        <div>
          <span>{文案['踏天.境界.眉题']}</span>
          <h3>
            {已完成
              ? 文案['踏天.境界.归真']
              : 阶
                ? 文案[`踏天.阶位.${阶.键}.名称`]
                : 文案['踏天.境界.待评估']}
          </h3>
          <p>
            {已完成
              ? 文案['踏天.境界.达成语']
              : 阶
                ? 文案[`踏天.阶位.${阶.键}.说明`]
                : 文案['踏天.境界.待就绪']}
          </p>
        </div>
        {可完成 && (
          <Button type='primary' onClick={on完成}>
            {文案['踏天.境界.按钮.我已踏天']}
          </Button>
        )}
        {主动完成时间 && (
          <span>
            {填充文案(文案['踏天.境界.已主动完成'], {
              日期: new Date(主动完成时间).toLocaleDateString('zh-CN'),
            })}
          </span>
        )}
      </div>
      <ol className='dragon-realm-stages'>
        {踏天阶位.map((项, i) => (
          <li
            key={项.键}
            className={i <= 阶序 ? 'is-reached' : ''}
            aria-current={i === 阶序 ? 'step' : undefined}
          >
            <b>{文案[`踏天.阶位.${项.键}.名称`]}</b>
            <small>{项.阈值 * 100}%</small>
          </li>
        ))}
      </ol>
      {可完成 && <p className='dragon-realm-note'>{文案['踏天.境界.可完成说明']}</p>}
      {历史完成时间 && (
        <p className='dragon-realm-note'>
          {填充文案(文案['踏天.境界.历史完成'], {
            日期: new Date(历史完成时间).toLocaleDateString('zh-CN'),
          })}
        </p>
      )}
    </section>
  )
}
