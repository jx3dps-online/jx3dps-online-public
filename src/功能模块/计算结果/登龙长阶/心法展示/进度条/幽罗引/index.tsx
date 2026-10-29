import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 牵丝画面 from './画面'
import 样式 from './index.module.less'

export default function 幽罗引进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 阶段 = 是否达成
    ? '百相登台'
    : 显示百分比 === 0
      ? '静候开场'
      : 显示百分比 <= 30
        ? '一线初牵'
        : 显示百分比 <= 60
          ? '牵丝入戏'
          : '丝牵百态'

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={样式.进度条}
        role='progressbar'
        aria-label='幽罗引 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={{ '--yly-progress': `${显示百分比}%` } as CSSProperties}
      >
        <div className={样式.标题}>
          <span>{阶段}</span>
          <div>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <牵丝画面 进度={显示百分比} 达成={是否达成} 忙碌={忙碌} />
        <div className={样式.进度轨} aria-hidden='true'>
          <i />
          {[25, 50, 75].map((节点) => (
            <span
              key={节点}
              style={{ left: `${节点}%` }}
              className={显示百分比 >= 节点 ? 样式.已点亮 : ''}
            />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
