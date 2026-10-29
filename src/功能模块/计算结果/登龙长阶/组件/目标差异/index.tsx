import React, { useEffect, useRef, useState } from 'react'
import { Button, Tooltip } from 'antd'
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 属性简写枚举 } from '@/@types/枚举'
import { 装备类型枚举 } from '@/@types/装备'
import ImageComponent from '@/组件/图片展示/index'
import 图标 from '@/数据/静态数据/图标.json'
import { 有效秒伤 } from '../../踏天/计算'
import { 增量 } from '../../领域/格式化'
import { 获取文案, 填充文案 } from '../../文案'
import type { 登阶差异 } from '../../领域/类型'
import './index.less'

const 属性色 = (名称: string) => {
  if (/会效/.test(名称)) return 'critical-power'
  if (/会心/.test(名称)) return 'critical'
  if (/破防/.test(名称)) return 'overcome'
  if (/无双/.test(名称)) return 'strain'
  if (/加速/.test(名称)) return 'haste'
  if (/攻击|外功|内功/.test(名称)) return 'attack'
  return 'neutral'
}
const 次级属性 = new Set(['会心', '会效', '破防', '无双', '全能', '加速'])

function 差异内容({ item, 侧 }: { item: 登阶差异; 侧: '当前' | '目标' }) {
  const { 名称, 装备数据 } = use心法数据()
  const 文案 = 获取文案(名称)
  const 文本 = item[侧]
  const 选择 = 侧 === '当前' ? item.当前装备 : item.目标装备
  const 装备 = 选择 && 装备数据?.[选择.装备部位]?.find((x) => x.id === 选择.id)
  const 等级 = 侧 === '当前' ? item.当前等级 : item.目标等级
  const 是精炼 = item.类别 === '精炼'
  const 精炼等级 = Math.max(0, Math.min(8, Number(等级) || 0))
  const 精炼上限 = 装备 ? (装备.装备类型 === 装备类型枚举.橙武 ? 8 : 6) : undefined
  const 精炼已满 = 是精炼 && 精炼上限 !== undefined && 精炼等级 >= 精炼上限
  const 属性 = [
    ...new Set(
      (装备?.装备增益 || []).map((x) => 属性简写枚举[x.属性]).filter((x) => 次级属性.has(x)),
    ),
  ]
  let 图片: string | undefined
  if (item.类别 === '装备' && 装备?.图标ID) 图片 = `https://icon.jx3box.com/icon/${装备.图标ID}.png`
  if (item.类别 === '镶嵌' && 等级) 图片 = (图标.五行石 as Record<number, string>)[等级]
  if (item.类别 === '附魔' && 文本 !== 文案['通用.未附魔']) 图片 = 图标.附魔
  if (item.类别 === '大附魔' && 文本 !== 文案['通用.未启用']) 图片 = 图标.大附魔
  if (item.类别 === '五彩石') {
    if (文本.includes('陆')) 图片 = 图标.六级五彩石
    else if (文本.includes('伍')) 图片 = 图标.五级五彩石
  }
  const 空缺文本 = [
    文案['通用.未装备'],
    文案['通用.未附魔'],
    文案['通用.未设置'],
    文案['通用.未启用'],
  ]
  const 空缺 = 空缺文本.some((空) => 文本.includes(空)) || (item.类别 === '镶嵌' && !等级)
  return (
    <div
      className={`dragon-diff-card ${侧 === '目标' ? 'is-target' : 'is-current'} ${空缺 ? 'is-empty' : ''}`}
    >
      <span
        className={`dragon-diff-icon ${是精炼 ? `dragon-refine-icon refine-level-${精炼等级} ${精炼已满 ? 'is-full' : ''}` : 装备?.装备类型 === 装备类型枚举.橙武 ? 'is-orange' : ''}`}
      >
        {是精炼 ? (
          <span className='dragon-refine-number' aria-hidden='true'>
            {精炼等级}
          </span>
        ) : 图片 ? (
          <ImageComponent
            key={图片}
            src={图片}
            fallback='https://icon.jx3box.com/icon/13.png'
            alt={
              item.类别 === '镶嵌' ? 填充文案(文案['差异.五行石.alt'], { 等级: 等级 ?? '' }) : 文本
            }
          />
        ) : (
          <span aria-hidden='true'>
            {空缺 ? <PlusOutlined /> : item.类别 === '精炼' ? '◆' : '◇'}
          </span>
        )}
      </span>
      <div className='dragon-diff-card-copy'>
        <b className={item.类别 === '附魔' || item.类别 === '镶嵌' ? `attr-${属性色(文本)}` : ''}>
          {是精炼
            ? !选择?.id
              ? 文案['通用.未装备']
              : 精炼等级
                ? 填充文案(文案['差异.精炼值'], {
                    等级: 精炼等级,
                    上限: 精炼上限 ? ' / ' + 精炼上限 : '',
                  })
                : 文案['差异.未精炼']
            : 文本}
        </b>
        {item.类别 === '装备' ? (
          <div className='dragon-diff-attributes'>
            <span>
              {装备
                ? 填充文案(文案['差异.品级'], { 品级: 装备.装备品级 })
                : 空缺
                  ? 文案['差异.尚未取得']
                  : 文案['差异.装备数据不可用']}
            </span>
            {属性.map((x) => (
              <em key={x} className={`attr-${属性色(x)}`}>
                {x}
              </em>
            ))}
          </div>
        ) : 是精炼 ? (
          <div className={`dragon-refine-detail ${精炼已满 ? 'is-full' : ''}`}>
            {精炼上限 && (
              <span
                className='dragon-refine-stars'
                aria-label={填充文案(文案['差异.精炼.aria'], {
                  等级: 精炼等级,
                  上限: 精炼上限,
                })}
              >
                {Array.from({ length: 精炼上限 }, (_, i) => (
                  <i key={i} className={i < 精炼等级 ? 'is-lit' : ''} />
                ))}
              </span>
            )}
            <small>{精炼已满 ? 文案['差异.精炼已满'] : 文案['差异.精炼等级']}</small>
          </div>
        ) : (
          <small>
            {item.类别 === '镶嵌'
              ? 等级
                ? 文案['差异.五行石']
                : 文案['差异.尚未镶嵌']
              : item.类别 === '精炼'
                ? 文案['差异.精炼等级']
                : item.类别}
          </small>
        )}
      </div>
    </div>
  )
}

function 差异行({
  item,
  计算提升,
  当前秒伤,
  踏天中,
  忙碌,
  on拿下,
  on计划有变,
  on合意,
  on替换目标,
}: {
  item: 登阶差异
  计算提升?: (项: 登阶差异) => number | undefined
  当前秒伤?: number
  踏天中?: boolean
  忙碌?: boolean
  on拿下: (项: 登阶差异) => void
  on计划有变?: () => void
  on合意?: (项: 登阶差异) => void
  on替换目标?: (项: 登阶差异) => void
}) {
  const { 名称 } = use心法数据()
  const 文案 = 获取文案(名称)
  const [提升, 设置提升] = useState<number>()
  const 最新计算 = useRef(计算提升)
  最新计算.current = 计算提升
  // 差异与结果一起重算：只有条目变化才重新试算，父组件普通重渲染不触发。
  useEffect(() => {
    const 计算 = 最新计算.current
    if (!计算) return
    const 定时器 = window.setTimeout(() => 设置提升(计算(item)), 0)
    return () => window.clearTimeout(定时器)
  }, [item])
  const 显示增量 =
    提升 === undefined
      ? undefined
      : 踏天中
        ? 有效秒伤(当前秒伤)
          ? (提升 > 0 ? '+' : '') + ((提升 / 当前秒伤) * 100).toFixed(2) + '%'
          : undefined
        : 增量(提升, 文案['通用.待评估'])
  const 负增量 = 提升 !== undefined && 提升 < 0
  return (
    <div className='dragon-diff-row'>
      <small className='dragon-diff-kind'>{item.类别}</small>
      <差异内容 item={item} 侧='当前' />
      <div className='dragon-diff-arrow'>
        {显示增量 !== undefined && (
          <em
            className={`dragon-diff-gain ${负增量 ? 'is-down' : 提升 !== undefined && 提升 > 0 ? 'is-up' : ''}`}
          >
            {显示增量}
          </em>
        )}
        <ArrowRightOutlined />
      </div>
      <差异内容 item={item} 侧='目标' />
      <div className='dragon-quick-actions'>
        <Tooltip title={文案['差异.提示.达成']}>
          <Button size='small' disabled={忙碌} onClick={() => on拿下(item)}>
            {文案['差异.按钮.达成目标']}
          </Button>
        </Tooltip>
        {on合意 ? (
          <Tooltip title={文案['差异.提示.坚持本心']}>
            <Button type='text' size='small' disabled={忙碌} onClick={() => on合意(item)}>
              {文案['差异.按钮.坚持本心']}
            </Button>
          </Tooltip>
        ) : 负增量 && on替换目标 ? (
          <Tooltip title={文案['差异.提示.替换']}>
            <Button type='text' size='small' disabled={忙碌} onClick={() => on替换目标(item)}>
              {文案['差异.按钮.替换目标']}
            </Button>
          </Tooltip>
        ) : on计划有变 ? (
          <Tooltip title={文案['差异.提示.计划有变']}>
            <Button type='text' size='small' onClick={on计划有变}>
              {文案['差异.按钮.计划有变']}
            </Button>
          </Tooltip>
        ) : null}
      </div>
    </div>
  )
}

export default function 目标差异({
  分组,
  忙碌,
  计算提升,
  当前秒伤,
  踏天中,
  on拿下,
  on计划有变,
  on合意,
  on替换目标,
}: {
  分组: Map<string, 登阶差异[]>
  忙碌?: boolean
  计算提升?: (项: 登阶差异) => number | undefined
  当前秒伤?: number
  踏天中?: boolean
  on拿下: (项: 登阶差异) => void
  on计划有变?: () => void
  on合意?: (项: 登阶差异) => void
  on替换目标?: (项: 登阶差异) => void
}) {
  const { 名称 } = use心法数据()
  const 文案 = 获取文案(名称)
  return (
    <div className='dragon-diff-visual'>
      <div className='dragon-diff-column-labels'>
        <span />
        <span>{文案['差异.列.当前']}</span>
        <span />
        <span>{文案['差异.列.目标']}</span>
        <span />
      </div>
      {[...分组.entries()].map(([部位, items]) => (
        <section className='dragon-diff-group' key={部位}>
          <h4>
            {部位}
            <span>{填充文案(文案['差异.待完成'], { 数量: items.length })}</span>
          </h4>
          {items.map((item, i) => (
            <差异行
              key={`${item.类别}-${i}`}
              item={item}
              计算提升={计算提升}
              当前秒伤={当前秒伤}
              踏天中={踏天中}
              忙碌={忙碌}
              on拿下={on拿下}
              on计划有变={on计划有变}
              on合意={on合意}
              on替换目标={on替换目标}
            />
          ))}
        </section>
      ))}
    </div>
  )
}
