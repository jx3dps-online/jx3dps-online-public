import React from 'react'
import { Tooltip } from 'antd'
import 素刃 from '../../../../../../../未使用图片/src/功能模块/计算结果/登龙长阶/心法展示/进度条/孤锋诀 copy/资源/hengdao-suren.png'
import 雪梅 from '../../../../../../../未使用图片/src/功能模块/计算结果/登龙长阶/心法展示/进度条/孤锋诀 copy/资源/hengdao-xuemei-touming.png'
import type { 登阶进度属性 } from '../类型'
import './横刀.less'

export default function 孤锋诀进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  // 共享层已保证：无法评估时传 0、是否达成为 false；非达成最多 99.99，这里再兜底取整。
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 比例 = 显示百分比 / 100
  const 阶段 = 是否达成 ? 4 : Math.min(3, Math.floor(比例 * 4))
  const 阶段名 = ['素刃初成', '初露锋芒', '梅影渐生', '映雪生辉', '此愿已成'][阶段]
  const 无障碍文本 = 忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。 美术资源非最终版本，逐渐制作中`}
    >
      <div
        className={`dragon-blade stage-${阶段}`}
        role='progressbar'
        aria-label='个人目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={无障碍文本}
        aria-busy={忙碌}
        style={
          {
            '--blade-progress': `${显示百分比}%`,
            '--blade-awaken': Math.max(0, (比例 - 0.2) / 0.8),
          } as React.CSSProperties
        }
      >
        <div className='dragon-blade-caption'>
          <span>{阶段名}</span>
          <div>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <div className='dragon-blade-art' aria-hidden='true'>
          <div className='dragon-blade-aura' />
          <img className='dragon-blade-base' src={素刃} alt='' />
          <img className='dragon-blade-awaken' src={雪梅} alt='' />
          <img className='dragon-blade-reveal' src={雪梅} alt='' />
          <div className='dragon-blade-snow'>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <i key={i} style={{ '--flake': i } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <div className='dragon-blade-track' aria-hidden='true'>
          <i />
          {[25, 50, 75].map((n) => (
            <span key={n} style={{ left: `${n}%` }} className={显示百分比 >= n ? 'is-lit' : ''} />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
