import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 蛊雾 from './蛊雾'
import 蛊影 from './蛊影'
import 样式 from './index.module.less'

const 素笛 = `${GLOBAL_CDN_PREFIX}/20261029/tuigu-sudi.png`
const 成品 = `${GLOBAL_CDN_PREFIX}/20261029/tuigu-chengpin.png`

const 阶段名称 = ['素骨初成', '丝引微光', '灵蛇渐醒', '蜕骨流辉', '此愿已成']

export default function 毒经进度条({ 百分比, 是否达成, 忙碌, 完成数, 总数 }: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 阶段 = 是否达成 ? 4 : Math.floor(显示百分比 / 25)
  const 数量文案 = 完成数 !== undefined && 总数 !== undefined ? `，已完成 ${完成数}/${总数} 项` : ''
  const 进度样式 = {
    '--dj-progress': `${显示百分比}%`,
    '--dj-opacity': 0.82 + 显示百分比 / 1000,
    '--dj-mist': Math.min(1, 显示百分比 / 70),
    '--dj-core': Math.min(1, Math.max(0, (显示百分比 - 45) / 55)),
    '--dj-swirl': Math.min(1, Math.max(0, (显示百分比 - 15) / 65)),
  } as CSSProperties

  return (
    <Tooltip title={忙碌 ? '正在评估目标完成度' : `目标完成度 ${显示百分比}%${数量文案}`}>
      <div
        className={样式.进度条}
        style={进度样式}
        role='progressbar'
        aria-label='毒经目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%${数量文案}`}
        aria-busy={!!忙碌}
      >
        <div className={样式.标题}>
          <span className={样式.阶段}>{阶段名称[阶段]}</span>
          <span className={样式.数值}>
            {忙碌 ? '…' : 显示百分比}
            <small>%</small>
            <span>目标完成度</span>
          </span>
        </div>
        <div className={样式.武器区域} aria-hidden='true'>
          <div className={样式.画布}>
            {!忙碌 && 显示百分比 > 0 && <蛊影 阶段={阶段} />}
            <div className={样式.素笛}>
              <img src={素笛} alt='' draggable={false} />
            </div>
            <div className={样式.亮态}>
              <img className={样式.成品} src={成品} alt='' draggable={false} />
              {!忙碌 && 显示百分比 > 0 && <蛊雾 阶段={阶段} />}
            </div>
          </div>
        </div>
        <div className={样式.刻度} aria-hidden='true'>
          <i />
          {[25, 50, 75].map((位置) => (
            <b key={位置} style={{ left: `${位置}%` }} />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
