import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 机关特效 from './机关特效'
import 样式 from './index.module.less'
const 武器 = `${GLOBAL_CDN_PREFIX}/20261025/huiting-touming.png`

export default function 天罗诡道进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 无障碍文本 = 忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。此处展示个人目标完成度，与武器品质、心法强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='天罗诡道目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={无障碍文本}
        aria-busy={忙碌}
        style={{ '--weapon-progress': `${显示百分比}%` } as CSSProperties}
      >
        <div className={样式.标题}>
          <span className={样式.武器名}>{是否达成 ? '此愿已成' : '回霆'}</span>
          <div className={样式.完成度}>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <div className={样式.武器} aria-hidden='true'>
          <div className={样式.图层}>
            <img
              className={样式.暗态}
              src={武器}
              width={2172}
              height={724}
              alt=''
              decoding='async'
            />
            <img
              className={样式.亮态}
              src={武器}
              width={2172}
              height={724}
              alt=''
              decoding='async'
            />
            <机关特效 进度={显示百分比 / 100} 达成={是否达成} 暂停={忙碌} />
          </div>
        </div>
        <div className={样式.刻度} aria-hidden='true'>
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
