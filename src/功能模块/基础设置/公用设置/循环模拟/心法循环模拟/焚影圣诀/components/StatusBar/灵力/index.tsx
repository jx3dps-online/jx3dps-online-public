import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import React, { useEffect, useId, useState } from 'react'
import { Progress } from 'antd'
import styles from './index.module.less'
import { 角色状态信息类型 } from '../../../simulator/type'
const 底图 = `${GLOBAL_CDN_PREFIX}/20261025/progress-bar-base.png`
const 金色覆盖图 = `${GLOBAL_CDN_PREFIX}/20261025/orange-progress-aligned.png`
const 蓝色覆盖图 = `${GLOBAL_CDN_PREFIX}/20261025/blue-progress-aligned.png`

const 灵力槽 = [
  {
    名称: '日灵',
    颜色: '#ffcc32',
    横坐标: 466,
    纵坐标: 282,
    路径: 'M 468 352 Q 465 352 469 341 C 484 308 531 282 570 282 L 1703 283 C 1699 316 1666 352 1617 352 Z',
  },
  {
    名称: '月魂',
    颜色: '#27b9ff',
    横坐标: 461,
    纵坐标: 443,
    路径: 'M 466 513 Q 461 513 465 501 C 480 468 527 443 568 443 L 1697 444 C 1692 479 1656 513 1606 513 Z',
  },
] as const

function use图片就绪(图片地址: string | undefined) {
  const [已加载地址, 设置已加载地址] = useState<string>()

  useEffect(() => {
    设置已加载地址(undefined)
    if (!图片地址) return
    const 图片 = new Image()
    图片.onload = () => 设置已加载地址(图片地址)
    图片.onerror = () => 设置已加载地址(undefined)
    图片.src = 图片地址
    return () => {
      图片.onload = null
      图片.onerror = null
    }
  }, [图片地址])

  return !!图片地址 && 已加载地址 === 图片地址
}

function 灵力({
  角色状态信息,
  显示简易能量条,
}: {
  角色状态信息: 角色状态信息类型
  显示简易能量条: boolean
}) {
  const 标识 = useId()
  const { 日灵, 月魂, 满灵 } = 角色状态信息
  const 底图就绪 = use图片就绪(显示简易能量条 ? undefined : 底图)
  const 当前覆盖图 = 月魂 === 100 ? 蓝色覆盖图 : 日灵 === 100 && 月魂 < 100 ? 金色覆盖图 : undefined
  const 覆盖图就绪 = use图片就绪(!显示简易能量条 && 底图就绪 ? 当前覆盖图 : undefined)
  const 数值说明 = `日灵：${日灵}，月魂：${月魂}${满灵 ? `，满灵：${满灵}` : ''}`

  return (
    <div className={'cycle-status-bar-content ' + styles.灵力区}>
      {显示简易能量条 || !底图就绪 ? (
        灵力槽.map(({ 名称 }) => (
          <div className={styles.灵力行} key={名称}>
            <div className='cycle-status-bar-title'>
              {名称}
              {满灵 === (名称 === '日灵' ? '日' : '月') ? '（满）' : ''}
            </div>
            <div className={styles.灵力条}>
              <Progress percent={角色状态信息[名称]} size='small' />
            </div>
          </div>
        ))
      ) : (
        <svg className={styles.图形} viewBox='0 0 2172 724' role='img' aria-label={数值说明}>
          <title>{数值说明}</title>
          <defs>
            {灵力槽.map(({ 名称, 路径 }) => (
              <clipPath id={`${标识}-${名称}`} key={名称}>
                <path d={路径} />
              </clipPath>
            ))}
          </defs>
          <image href={底图} width='2172' height='724' />
          {灵力槽.map(({ 名称, 颜色, 横坐标, 纵坐标 }) => (
            <rect
              key={名称}
              x={横坐标}
              y={纵坐标}
              width={(1240 * 角色状态信息[名称]) / 100}
              height='72'
              fill={颜色}
              clipPath={`url(#${标识}-${名称})`}
            />
          ))}
          {覆盖图就绪 && 当前覆盖图 ? (
            <image
              href={当前覆盖图}
              x='450'
              y={月魂 === 100 ? 232 : 72}
              width='1500'
              height={(1500 * 724) / 2171}
            />
          ) : null}
          {灵力槽
            .filter(({ 名称 }) => 角色状态信息[名称] !== 100)
            .map(({ 名称, 横坐标, 纵坐标 }) => (
              <text
                key={名称}
                className={styles.数值}
                x={横坐标 + 620}
                y={纵坐标 + 36}
                textAnchor='middle'
                dominantBaseline='central'
              >
                {角色状态信息[名称]}
              </text>
            ))}
        </svg>
      )}
    </div>
  )
}
export default 灵力
