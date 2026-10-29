import React, { useEffect, useRef, useState } from 'react'
import { Button, Tooltip } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import type { 登阶建议 } from '../../领域/类型'
import type { 装备信息数据类型 } from '@/@types/装备'
import { 有效秒伤 } from '../../踏天/计算'
import { 增量 } from '../../领域/格式化'
import { 获取文案 } from '../../文案'

const 达成滑过时长 = 200
const 达成收起时长 = 240

interface 提升建议属性 {
  item: 登阶建议
  i: number
  踏天中: boolean
  当前秒伤?: number
  忙碌: boolean
  拿下: (获取装备: () => 装备信息数据类型) => boolean
  计划有变: () => void
  替换目标: (项: 登阶建议) => void
  坚持本心: (项: 登阶建议) => void
}
export default function 提升建议({
  item,
  i,
  踏天中,
  当前秒伤,
  忙碌,
  拿下,
  计划有变,
  替换目标,
  坚持本心,
}: 提升建议属性) {
  const { 名称 } = use心法数据()
  const 文案 = 获取文案(名称)
  const [达成中, 设置达成中] = useState(false)
  const 卡片 = useRef<HTMLElement>(null)
  const 计时 = useRef<number[]>([])
  useEffect(() => () => 计时.current.forEach((项) => window.clearTimeout(项)), [])
  const 触发达成 = () => {
    if (忙碌 || 达成中) return
    const 获取 = () => 拿下(() => item.装备信息)
    const 元素 = 卡片.current
    // 按钮在卡片内，正常情况下元素必然存在；缺失或不支持动画时直接达成。
    if (!元素?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      获取()
      return
    }
    设置达成中(true)
    计时.current.push(
      window.setTimeout(() => {
        // 金色铺满后原地收起：高度、内边距与透明度一起收，避免列表跳动。
        const 样式 = window.getComputedStyle(元素)
        const 收起 = 元素.animate(
          [
            {
              height: 元素.getBoundingClientRect().height + 'px',
              paddingTop: 样式.paddingTop,
              paddingBottom: 样式.paddingBottom,
              opacity: 1,
            },
            { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
          ],
          { duration: 达成收起时长, easing: 'ease-in', fill: 'forwards' },
        )
        收起.finished
          .then(() => {
            // 未更新（重算中 / 计划过期）时立刻恢复条目，避免收起后留下空白。
            if (!获取()) {
              收起.cancel()
              设置达成中(false)
              return
            }
            // 已更新时该条会被重算移除；若结果尚未刷新，1 秒后恢复兜底。
            计时.current.push(
              window.setTimeout(() => {
                if (!元素.isConnected) return
                收起.cancel()
                设置达成中(false)
              }, 1000),
            )
          })
          .catch(() => {
            if (元素.isConnected) 获取()
          })
      }, 达成滑过时长),
    )
  }
  const 负增量 = (item.提升 ?? 0) < 0
  const 可替换目标 = !踏天中 && 负增量 && (item.类别 === '装备' || item.类别 === '武器')
  const 增量文本 = 踏天中
    ? item.提升 !== undefined && 有效秒伤(当前秒伤)
      ? (item.提升 > 0 ? '+' : '') + ((item.提升 / 当前秒伤) * 100).toFixed(2) + '%'
      : 文案['通用.待评估']
    : 增量(item.提升, 文案['通用.待评估'])
  return (
    <article
      key={item.id}
      ref={卡片}
      className={`dragon-suggestion${达成中 ? ' is-achieving' : ''}`}
    >
      <span className='dragon-rank'>{String(i + 1).padStart(2, '0')}</span>
      <div className='dragon-suggestion-main'>
        <div>
          <span className='dragon-kind'>{item.类别}</span>
          <h4>{item.标题}</h4>
        </div>
        <Tooltip title={item.说明}>
          <p>{item.说明}</p>
        </Tooltip>
      </div>
      <div className={`dragon-gain ${负增量 ? 'is-negative' : ''}`}>
        {负增量 && !踏天中 ? (
          <Tooltip title={文案['建议.提示.超越计划']}>
            <b>{增量文本}</b>
          </Tooltip>
        ) : (
          <b>{增量文本}</b>
        )}
        <div className='dragon-quick-actions'>
          {踏天中 ? (
            <Tooltip title={文案['差异.提示.坚持本心']}>
              <Button
                type='text'
                size='small'
                disabled={忙碌 || 达成中}
                onClick={() => 坚持本心(item)}
              >
                {文案['差异.按钮.坚持本心']}
              </Button>
            </Tooltip>
          ) : 可替换目标 ? (
            <Tooltip title={文案['差异.提示.替换']}>
              <Button
                type='text'
                size='small'
                disabled={忙碌 || 达成中}
                onClick={() => 替换目标(item)}
              >
                {文案['差异.按钮.替换目标']}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={文案['差异.提示.计划有变']}>
              <Button type='text' size='small' onClick={计划有变}>
                {文案['差异.按钮.计划有变']}
              </Button>
            </Tooltip>
          )}
          <Tooltip title={文案['差异.提示.达成']}>
            <Button ghost size='small' disabled={忙碌 || 达成中} onClick={触发达成}>
              {文案['差异.按钮.达成目标']}
            </Button>
          </Tooltip>
        </div>
      </div>
    </article>
  )
}
