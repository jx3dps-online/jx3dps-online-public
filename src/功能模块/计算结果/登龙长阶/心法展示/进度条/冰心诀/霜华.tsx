import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useId, type CSSProperties } from 'react'
import 剑舞 from './剑舞'
import 样式 from './霜华.module.less'
const 成品 = `${GLOBAL_CDN_PREFIX}/20261025/liexin-chengpin.png`
const 冰纹 = `${GLOBAL_CDN_PREFIX}/20261025/liudong-bingwen.png`

const 霜屑位置 = [
  [220, 105],
  [352, 170],
  [465, 118],
  [534, 227],
  [628, 147],
  [727, 219],
  [610, 232],
  [665, 96],
  [826, 114],
  [785, 224],
  [865, 130],
  [925, 227],
]
const 浮冰位置 = [
  [240, 100],
  [385, 247],
  [535, 98],
  [650, 244],
  [760, 102],
  [885, 244],
]
const 晶心位置 = [
  [305, 137],
  [386, 207],
]
const 冰晶轮廓 = [
  'M-10-20-22-63-2-36 2-18Z',
  'M9-18 37-49 23-20 11-8Z',
  'M22-6 65-18 42 6 21 9Z',
  'M12 18 37 54 16 38 4 20Z',
  'M-4 22-16 60-22 35-15 15Z',
  'M-21 9-62 33-40 5-18-3Z',
  'M-20-11-58-36-31-34-8-22Z',
]

export default function 霜华({ 阶段 }: { 阶段: number }) {
  const 编号 = useId().replace(/:/g, '')
  if (阶段 === 0) return null
  return (
    <svg
      className={样式.霜华}
      viewBox='0 0 1000 333.333'
      focusable='false'
      style={{ '--bxj-ice-opacity': 0.18 + 阶段 * 0.025 } as CSSProperties}
    >
      <defs>
        <clipPath id={`${编号}-blades`}>
          <path d='M475 125 907 128 963 137 906 145 475 147Z M556 198 928 200 974 207 928 216 556 217Z' />
        </clipPath>
        <mask
          id={`${编号}-swords`}
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width='1000'
          height='333.333'
          style={{ maskType: 'alpha' }}
        >
          <image href={成品} width='1000' height='333.333' />
        </mask>
        <radialGradient id={`${编号}-glow`}>
          <stop offset='0' stopColor='#fff2fa' stopOpacity='.8' />
          <stop offset='.2' stopColor='#e7e0ee' stopOpacity='.4' />
          <stop offset='1' stopColor='#d5c9df' stopOpacity='0' />
        </radialGradient>
        <linearGradient id={`${编号}-mist`}>
          <stop offset='0' stopColor='#dfd0e5' stopOpacity='0' />
          <stop offset='.4' stopColor='#d5deee' stopOpacity='.45' />
          <stop offset='.65' stopColor='#f3deed' stopOpacity='.35' />
          <stop offset='1' stopColor='#dfd0e5' stopOpacity='0' />
        </linearGradient>
      </defs>
      <剑舞 阶段={阶段} />
      <g mask={`url(#${编号}-swords)`} clipPath={`url(#${编号}-blades)`} className={样式.冰纹}>
        <g className={样式.冰纹移动}>
          <image href={冰纹} x='-1000' width='1000' height='333.333' />
          <image href={冰纹} width='1000' height='333.333' />
        </g>
      </g>
      <g className={样式.寒气} stroke={`url(#${编号}-mist)`}>
        <path d='M190 131 C310 92 377 155 505 132 S735 110 940 137' />
        <path d='M302 214 C425 248 493 185 610 212 S803 234 963 207' />
      </g>
      {晶心位置.map(([横, 纵], 序号) => (
        <g key={序号} transform={`translate(${横} ${纵})`}>
          <g className={样式.冰晶簇} style={{ opacity: 0.35 + 阶段 * 0.08 }}>
            {冰晶轮廓.map((轮廓, 晶片序号) => (
              <path
                key={晶片序号}
                className={样式.晶片}
                d={轮廓}
                style={{ '--bxj-index': 晶片序号 + 序号 * 3.5 } as CSSProperties}
              />
            ))}
          </g>
        </g>
      ))}
      {阶段 >= 2 && (
        <>
          <g className={样式.霜丝}>
            <path d='M190 131 C310 92 377 155 505 132 S735 110 940 137' />
            <path d='M302 214 C425 248 493 185 610 212 S803 234 963 207' />
          </g>
          {霜屑位置.map(([横, 纵], 序号) => (
            <g key={序号} transform={`translate(${横} ${纵})`}>
              <path
                className={样式.霜屑}
                d={序号 % 3 === 0 ? 'M-3 0 0-6 3 0 0 4Z' : 'M-5 0 0-2 6 0 0 2Z'}
                style={{ '--bxj-index': 序号 } as CSSProperties}
              />
            </g>
          ))}
          {浮冰位置.slice(0, 阶段 === 2 ? 3 : 6).map(([横, 纵], 序号) => (
            <g key={序号} transform={`translate(${横} ${纵})`}>
              <g className={样式.浮冰} style={{ '--bxj-index': 序号 } as CSSProperties}>
                <path d='M0-11 5-3 3 7-3 11-5 0Z' />
                <path d='M0-11 0 2-3 11M0 2 5-3' />
              </g>
            </g>
          ))}
        </>
      )}
      {阶段 >= 3 &&
        [
          [630, 137],
          [780, 207],
        ].map(([横, 纵], 序号) => (
          <g key={序号} transform={`translate(${横} ${纵})`}>
            <g className={样式.刃上冰簇} style={{ '--bxj-index': 序号 } as CSSProperties}>
              <circle r='24' fill={`url(#${编号}-glow)`} />
              <path d='M-20 0-6-3-10-17 0-6 9-23 6-3 22 0 6 3 10 16 0 6-8 13-6 3Z' />
              <path d='M-29 2-24-1-20 2-25 4Z M18-11 22-17 24-10 21-7Z M6 22 9 28 5 32 3 26Z' />
            </g>
          </g>
        ))}
      {阶段 >= 3 &&
        晶心位置.map(([横, 纵], 序号) => (
          <g key={序号} transform={`translate(${横} ${纵})`}>
            <g className={样式.晶心} style={{ '--bxj-index': 序号 } as CSSProperties}>
              <circle r='36' fill={`url(#${编号}-glow)`} />
              <path d='M0-13 1-1 16 0 1 1 0 13-1 1-16 0-1-1Z' />
            </g>
          </g>
        ))}
      {阶段 === 4 &&
        [
          [943, 137],
          [961, 207],
        ].map(([横, 纵], 序号) => (
          <g key={序号} transform={`translate(${横} ${纵})`}>
            <path
              className={样式.剑尖星芒}
              d='M0-9 1-1 14 0 1 1 0 9-1 1-14 0-1-1Z'
              style={{ '--bxj-index': 序号 } as CSSProperties}
            />
          </g>
        ))}
    </svg>
  )
}
