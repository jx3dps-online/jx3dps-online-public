import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import React from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import './血誓.less'
const 白狼河北 = `${GLOBAL_CDN_PREFIX}/20261025/bailanghebei-jindutiao.png`

/** 五阶段：0 霜刃初开；25/50/75 语出「血勇之怒，怒而面赤；脉勇之怒，怒而面青；骨勇之怒，怒而面白」；100 神勇之怒，怒而色不变。 */
const 阶段文案 = [
  '霜刃初开',
  '血勇之怒，怒而面赤',
  '脉勇之怒，怒而面青',
  '骨勇之怒，怒而面白',
  '神勇之怒，怒而色不变',
]

const 阶段引文 = `${阶段文案.join('；')}。`

/** 苍云血誓进度条：白狼河北图为底，未成时如铁色石刻，彩色随完成度自左向右复苏，达成时金光满绘。 */
export default function 分山劲血誓({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  // 共享层已保证：无法评估时传 0、是否达成为 false；非达成最多 99.99，这里取整封顶。
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 比例 = 显示百分比 / 100
  // 五阶段按 0/25/50/75/100 分界；非达成最多到「骨勇之怒」，「神勇之怒」仅在达成时出现
  const 阶段 = 是否达成 ? 4 : Math.min(3, Math.floor(比例 * 4))
  const 无障碍文本 = 忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`

  return (
    <Tooltip
      title={`${阶段引文}已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={`blood-oath stage-${阶段}`}
        role='progressbar'
        aria-label='苍云血誓 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={无障碍文本}
        aria-busy={忙碌}
        style={
          {
            '--oath-progress': `${显示百分比}%`,
            '--oath-awaken': Math.max(0, (比例 - 0.2) / 0.8),
          } as React.CSSProperties
        }
      >
        <div className='blood-oath-caption'>
          <span>{阶段文案[阶段]}</span>
          <div>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <div className='blood-oath-art' aria-hidden='true'>
          <div className='blood-oath-aura' />
          <img className='blood-oath-base' src={白狼河北} alt='' />
          <img className='blood-oath-reveal' src={白狼河北} alt='' />
          <div className='blood-oath-snow'>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <i key={i} style={{ '--flake': i } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <div className='blood-oath-track' aria-hidden='true'>
          <i />
          {[25, 50, 75].map((n) => (
            <span key={n} style={{ left: `${n}%` }} className={显示百分比 >= n ? 'is-lit' : ''} />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
