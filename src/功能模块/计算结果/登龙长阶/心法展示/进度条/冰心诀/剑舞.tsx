import { useId, type CSSProperties } from 'react'
import 样式 from './剑舞.module.less'

const 雪晶位置 = [
  [205, 104, 0.9],
  [355, 242, 0.8],
  [495, 95, 1],
  [655, 246, 0.9],
  [795, 96, 0.85],
  [925, 242, 0.8],
]

export default function 剑舞({ 阶段 }: { 阶段: number }) {
  const 飘带编号 = useId().replace(/:/g, '')
  return (
    <>
      <defs>
        <linearGradient
          id={飘带编号}
          gradientUnits='userSpaceOnUse'
          x1='160'
          y1='0'
          x2='990'
          y2='0'
        >
          <stop offset='0' stopColor='#f3aed1' stopOpacity='0' />
          <stop offset='.2' stopColor='#f2afd2' stopOpacity='.8' />
          <stop offset='.5' stopColor='#fae0ef' stopOpacity='.95' />
          <stop offset='.8' stopColor='#d6dff4' stopOpacity='.7' />
          <stop offset='1' stopColor='#f4c6e1' stopOpacity='0' />
        </linearGradient>
      </defs>
      <g className={样式.飘带}>
        <g opacity={0.45 + 阶段 * 0.1375} fill={`url(#${飘带编号})`}>
          <g className={样式.上飘带}>
            <path d='M180 137 C290 59 368 55 483 98 S700 178 963 108 C760 191 621 137 484 111 S304 83 180 137Z' />
            <path className={样式.绡边} d='M180 137 C290 59 368 55 483 98 S700 178 963 108' />
          </g>
          <g className={样式.下飘带}>
            <path d='M255 213 C391 281 485 276 598 234 S821 152 969 190 C831 137 733 181 598 220 S391 265 255 213Z' />
            <path className={样式.绡边} d='M255 213 C391 281 485 276 598 234 S821 152 969 190' />
          </g>
        </g>
      </g>
      <g opacity={0.4 + 阶段 * 0.1}>
        {雪晶位置
          .slice(0, 阶段 === 1 ? 2 : 阶段 === 2 ? 3 : 阶段 === 3 ? 5 : 6)
          .map(([横, 纵, 大小], 序号) => (
            <g key={序号} transform={`translate(${横} ${纵}) scale(${大小})`}>
              <g className={样式.雪晶} style={{ '--bxj-index': 序号 } as CSSProperties}>
                <path d='M0-17V17 M-14.7-8.5 14.7 8.5 M-14.7 8.5 14.7-8.5 M0-10-4-14 M0-10 4-14 M0 10-4 14 M0 10 4 14 M-8.7-5-14-3 M-8.7-5-10-10 M8.7 5 14 3 M8.7 5 10 10 M-8.7 5-14 3 M-8.7 5-10 10 M8.7-5 14-3 M8.7-5 10-10' />
                <path className={样式.雪心} d='M0-4 3-2 3 2 0 4-3 2-3-2Z' />
              </g>
            </g>
          ))}
      </g>
    </>
  )
}
