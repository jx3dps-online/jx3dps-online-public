import { useId } from 'react'
import type { CSSProperties } from 'react'
import 样式 from './仙气.module.less'

const 雾路 = [
  'M375 76C318 48 278 100 215 76S99 26 40 66',
  'M355 96C302 94 276 134 217 107S111 88 58 112',
  'M366 142C299 162 292 122 236 147S126 193 62 160',
  'M344 128C291 122 270 173 199 161S93 135 32 179',
]

export default function 仙气({ 进度, 忙碌 }: { 进度: number; 忙碌: boolean }) {
  const 标识 = useId()
  const 浓度 = Math.max(0, (进度 - 0.2) / 0.8)
  if (!浓度) return null
  return (
    <g className={`${样式.仙气} ${忙碌 ? '' : 样式.流动}`} opacity={浓度}>
      <defs>
        <linearGradient id={`${标识}-mist`} gradientUnits='userSpaceOnUse' x1='30' x2='390'>
          <stop offset='0' stopColor='#b1dce9' stopOpacity='0' />
          <stop offset='.3' stopColor='#a8dbea' stopOpacity='.55' />
          <stop offset='.7' stopColor='#d5f3ed' stopOpacity='.85' />
          <stop offset='1' stopColor='#c9e7db' stopOpacity='0' />
        </linearGradient>
        <radialGradient id={`${标识}-cloud`}>
          <stop offset='0' stopColor='#dbe9e6' stopOpacity='.6' />
          <stop offset='.45' stopColor='#c9dfe2' stopOpacity='.28' />
          <stop offset='.75' stopColor='#bbd6de' stopOpacity='.08' />
          <stop offset='1' stopColor='#bbd6de' stopOpacity='0' />
        </radialGradient>
        <filter
          id={`${标识}-soft`}
          filterUnits='userSpaceOnUse'
          x='8'
          y='8'
          width='410'
          height='200'
        >
          <feGaussianBlur stdDeviation='2.2' />
        </filter>
      </defs>
      <g className={样式.云雾} fill={`url(#${标识}-cloud)`}>
        <ellipse cx='210' cy='74' rx='120' ry='34' />
        <ellipse cx='235' cy='147' rx='112' ry='30' />
        <ellipse cx='307' cy='107' rx='100' ry='44' />
      </g>
      <g className={样式.雾带} stroke={`url(#${标识}-mist)`} filter={`url(#${标识}-soft)`}>
        {雾路.map((路径, 序号) => (
          <path
            key={路径}
            d={路径}
            pathLength='100'
            style={{ '--lhj-drift': 序号 } as CSSProperties}
          />
        ))}
      </g>
      <g className={样式.游丝} stroke={`url(#${标识}-mist)`}>
        {雾路.map((路径, 序号) => (
          <path
            key={路径}
            d={路径}
            pathLength='100'
            style={{ '--lhj-drift': 序号 } as CSSProperties}
          />
        ))}
      </g>
      {!忙碌 && (
        <g className={样式.星屑}>
          {Array.from({ length: 6 }, (_, 序号) => (
            <circle
              key={序号}
              cx={300 + 序号 * 9}
              cy={序号 % 2 ? 142 : 75}
              r={序号 % 3 ? 1.3 : 2}
              style={{ '--lhj-drift': 序号 } as CSSProperties}
            />
          ))}
        </g>
      )}
    </g>
  )
}
