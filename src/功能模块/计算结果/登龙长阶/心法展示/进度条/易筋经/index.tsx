import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useId } from 'react'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 样式 from './index.module.less'
const 素杖 = `${GLOBAL_CDN_PREFIX}/20261025/chanzhang-suzhang.png`
const 万骨回澜 = `${GLOBAL_CDN_PREFIX}/20261025/chanzhang-wanguhuilan.png`

const 阶段名称 = ['素杖初成', '金芒初现', '莲光渐盛', '万骨回澜', '此愿已成']

function 金莲({ 阶段 }: { 阶段: number }) {
  const 渐变标识 = useId()

  return (
    <svg className={样式.金莲} viewBox='0 0 240 120' focusable='false'>
      <defs>
        <linearGradient id={渐变标识} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#fff0bc' stopOpacity='0.04' />
          <stop offset='0.6' stopColor='#e8c26c' stopOpacity='0.1' />
          <stop offset='1' stopColor='#e8c26c' stopOpacity='0.32' />
        </linearGradient>
      </defs>
      <g fill={`url(#${渐变标识})`}>
        {阶段 === 4 && (
          <g className={样式.底瓣}>
            <path d='M120 108C78 117 34 116 8 89C49 84 93 90 120 108Z' />
            <path d='M120 108C162 117 206 116 232 89C191 84 147 90 120 108Z' />
          </g>
        )}
        {阶段 >= 3 && (
          <g className={样式.外瓣}>
            <path d='M120 108C72 107 36 85 23 53C68 60 104 78 120 108Z' />
            <path d='M120 108C168 107 204 85 217 53C172 60 136 78 120 108Z' />
          </g>
        )}
        <g className={样式.内瓣}>
          <path d='M120 108C88 99 69 72 70 35C100 53 120 79 120 108Z' />
          <path d='M120 108C152 99 171 72 170 35C140 53 120 79 120 108Z' />
          <path d='M120 108C91 83 99 45 120 12C141 45 149 83 120 108Z' />
        </g>
      </g>
    </svg>
  )
}

function 禅杖({ 阶段, 忙碌 }: { 阶段: number; 忙碌: boolean }) {
  return (
    <div className={样式.武器区域} aria-hidden='true'>
      <div className={样式.画布}>
        {阶段 >= 1 && (
          <div className={样式.背景光} style={{ opacity: 阶段 * 0.2 }}>
            <i />
          </div>
        )}
        {阶段 >= 2 && (
          <div className={样式.莲影} style={{ opacity: 0.3 + (阶段 - 2) * 0.2 }}>
            <金莲 阶段={阶段} />
          </div>
        )}
        <img className={样式.素杖} src={素杖} alt='' decoding='async' />
        <img className={样式.成品} src={万骨回澜} alt='' decoding='async' />
        <div className={样式.点亮特效} key={阶段}>
          {阶段 >= 1 && !忙碌 && (
            <div
              className={样式.杖身流光}
              style={{ WebkitMaskImage: `url(${万骨回澜})`, maskImage: `url(${万骨回澜})` }}
            >
              <i />
            </div>
          )}
          {阶段 >= 1 && !忙碌 && (
            <div className={样式.金屑} style={{ opacity: 0.25 + (阶段 - 1) * 0.2 }}>
              {Array.from({ length: 阶段 === 1 ? 6 : 16 }, (_, 序号) => (
                <i key={序号} style={{ '--yjj-spark': 序号 } as CSSProperties} />
              ))}
            </div>
          )}
          {阶段 >= 3 && (
            <div className={样式.杖首}>
              <i className={样式.金芯} />
              {!忙碌 && (
                <>
                  <i className={样式.光环} />
                  <i className={样式.光环} />
                  {阶段 === 4 && <i className={样式.回澜} />}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function 易筋经进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 阶段 = 是否达成 ? 4 : Math.floor(显示百分比 / 25)

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 && !忙碌 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='易筋经 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={{ '--yjj-progress': `${显示百分比}%` } as CSSProperties}
      >
        <div className={样式.标题}>
          <span>{阶段名称[阶段]}</span>
          <div>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <禅杖 阶段={阶段} 忙碌={忙碌} />
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
