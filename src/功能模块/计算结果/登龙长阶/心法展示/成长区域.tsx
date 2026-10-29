import { Tooltip } from 'antd'
import type { 登阶成长展示属性 } from './类型'
import { 获取文案, 填充文案 } from '../文案'
import 登阶进度条 from './进度条'

/** 完整成长区域的共享骨架：左侧文案 + 右侧按心法注册的进度条。 */
export default function 成长区域({
  心法,
  目标名称,
  目标循环显示名,
  当前名称,
  更新时间,
  完成数,
  总数,
  忙碌,
  本程提升,
  完成度,
  是否达成,
}: 登阶成长展示属性) {
  const 文案 = 获取文案(心法)
  const 已达成 = 是否达成
  const 日期 = new Date(更新时间).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  return (
    <div className={`dragon-journey ${已达成 ? 'is-complete' : ''}`}>
      <div className='dragon-journey-copy'>
        <span className='dragon-eyebrow'>
          {心法}
          <span className='dragon-stage-divider'> / </span>
          {已达成 ? 文案['登阶.达成标记'] : 文案['展示.本程目标']}
        </span>
        <div className='dragon-current-wrap'>
          <h3>{目标名称}</h3>
          {目标循环显示名 && (
            <small className='dragon-journey-loop' title={目标循环显示名}>
              {目标循环显示名}
            </small>
          )}
        </div>
        <div className='dragon-current-note'>
          <span className='dragon-live-dot' />
          {填充文案(文案['展示.当前方案'], { 名称: 当前名称 })}
          <span className='dragon-current-date'>{填充文案(文案['展示.上次更新'], { 日期 })}</span>
        </div>
        {本程提升 !== undefined && 本程提升 !== 0 && (
          <p className='dragon-journey-gain'>
            <Tooltip title={文案['展示.提升提示']}>
              <span>
                {文案['展示.至今已']}
                {本程提升 > 0 ? 文案['展示.提升'] : 文案['展示.变化']}{' '}
                <b>{Math.round(本程提升).toLocaleString('zh-CN')} DPS</b>
              </span>
            </Tooltip>
          </p>
        )}
      </div>
      <登阶进度条
        心法={心法}
        百分比={完成度}
        是否达成={已达成}
        忙碌={忙碌}
        完成数={完成数}
        总数={总数}
      />
    </div>
  )
}
