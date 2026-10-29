import { useId, type CSSProperties } from 'react'
import 样式 from './光翼.module.less'

const 翼骨 = [
  { 横: 514, 纵: 144, 长度: 310, 角度: 22 },
  { 横: 507, 纵: 149, 长度: 380, 角度: 13 },
  { 横: 505, 纵: 154, 长度: 445, 角度: 3 },
  { 横: 512, 纵: 160, 长度: 330, 角度: -5 },
]
const 翼面 =
  'M0 0L-48 -8L-76 -5L-105 -16L-100 -7L-162 -12L-154 -5L-216 -13L-205 -4L-280 -9L-265 -2L-400 0L-293 7L-302 3L-230 13L-235 5L-176 16L-184 7L-118 18L-130 8L-72 12L-81 5L-28 7Z'
const 光脉 = 'M0 0L-58 -1L-65 -4L-146 -3L-157 1L-247 -1L-265 1L-400 0'
const 分叉 =
  'M-56 -1L-99 -9L-142 -8M-103 -2L-136 9L-174 10M-170 0L-204 -8L-246 -6M-228 0L-261 6L-292 5'

export default function 光翼({ 进度, 暂停, 达成 }: { 进度: number; 暂停: boolean; 达成: boolean }) {
  const 标识 = useId()
  return (
    <g className={样式.光翼} data-active={!暂停 && 进度 > 0.3} data-complete={达成}>
      <defs>
        <linearGradient id={`${标识}-vein`} gradientUnits='userSpaceOnUse' x1='-400' x2='0'>
          <stop stopColor='#879eff' stopOpacity='.2' />
          <stop offset='.15' stopColor='#91c9ff' stopOpacity='.7' />
          <stop offset='.5' stopColor='#b5edff' stopOpacity='.95' />
          <stop offset='.85' stopColor='#e2f8ff' />
          <stop offset='1' stopColor='#acbfff' stopOpacity='.4' />
        </linearGradient>
        <linearGradient id={`${标识}-panel`} gradientUnits='userSpaceOnUse' x1='-400' x2='0'>
          <stop stopColor='#738af4' stopOpacity='0' />
          <stop offset='.3' stopColor='#73beef' stopOpacity='.2' />
          <stop offset='.7' stopColor='#c7f0ff' stopOpacity='.3' />
          <stop offset='1' stopColor='#a5a8ef' stopOpacity='.06' />
        </linearGradient>
        <filter id={`${标识}-halo`} x='-10%' y='-100%' width='120%' height='300%'>
          <feGaussianBlur stdDeviation='2' />
        </filter>
      </defs>
      {翼骨.map((翼, 序号) => {
        const 展开 = Math.min(1, Math.max(0, (进度 - 0.3 - 序号 * 0.07) / 0.3))
        return (
          <g key={序号} transform={`translate(${翼.横} ${翼.纵})`}>
            <g
              className={样式.展开}
              style={
                {
                  opacity: 展开,
                  transform: `rotate(${翼.角度 * (0.35 + 展开 * 0.65)}deg) scale(${(翼.长度 / 400) * (0.25 + 展开 * 0.75)}, ${0.75 + 展开 * 0.25})`,
                  '--tlgd-wing-index': 序号,
                } as CSSProperties
              }
            >
              <path className={样式.翼面} d={翼面} fill={`url(#${标识}-panel)`} />
              <path className={样式.翼缘} d={翼面} stroke={`url(#${标识}-vein)`} />
              <path
                className={样式.辉光}
                d={光脉}
                stroke={`url(#${标识}-vein)`}
                filter={`url(#${标识}-halo)`}
              />
              <path className={样式.翼骨} d={光脉} stroke={`url(#${标识}-vein)`} />
              <path className={样式.分叉} d={分叉} stroke={`url(#${标识}-vein)`} />
              <path className={样式.流束} d={光脉} pathLength='100' />
              <path className={样式.细流} d={分叉} pathLength='100' />
            </g>
          </g>
        )
      })}
    </g>
  )
}
