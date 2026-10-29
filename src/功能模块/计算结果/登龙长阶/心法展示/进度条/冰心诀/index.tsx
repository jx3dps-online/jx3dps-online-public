import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 霜华 from './霜华'
import 样式 from './双兵.module.less'
const 素剑 = `${GLOBAL_CDN_PREFIX}/20261025/liexin-sujian.png`
const 成品 = `${GLOBAL_CDN_PREFIX}/20261025/liexin-chengpin.png`

const 阶段名称 = ['素剑藏锋', '霜光初映', '剑舞凝霜', '锋冽心明', '此愿已成']

export default function 冰心双兵({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99.9, 百分比)
  const 阶段 = 是否达成 ? 4 : Math.floor(显示百分比 / 25)
  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。此处展示个人目标完成度，与武器品质、心法强度评级无关。`}
    >
      <div
        className={`${样式.进度} ${是否达成 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='冰心诀 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比.toFixed(1)}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={
          {
            '--bxj-progress': `${显示百分比}%`,
            '--bxj-opacity': 0.86 + 显示百分比 / 1000,
          } as CSSProperties
        }
      >
        <div className={样式.标题}>
          <span>{阶段名称[阶段]}</span>
          <div>
            <b>
              {忙碌 ? '…' : Number(显示百分比.toFixed(1))}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <div className={样式.画面} aria-hidden='true'>
          <div className={样式.画布}>
            <div className={样式.暗态}>
              <img src={素剑} alt='' decoding='async' />
            </div>
            <div className={样式.亮态}>
              <img className={样式.成品} src={成品} alt='' decoding='async' />
              {!忙碌 && <霜华 阶段={阶段} />}
            </div>
          </div>
        </div>
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
