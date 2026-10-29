import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useId } from 'react'
import type { CSSProperties } from 'react'
import 样式 from './蛊雾.module.less'

const 成品 = `${GLOBAL_CDN_PREFIX}/20261029/tuigu-chengpin.png`

const 光尘位置 = Array.from({ length: 28 }, (_, 序号) => [
  80 + ((序号 * 137) % 850),
  65 + ((序号 * 73) % 215),
])

export default function 蛊雾({ 阶段 }: { 阶段: number }) {
  const 标识 = useId().replace(/:/g, '')
  return (
    <>
      <div
        className={样式.骨纹流光}
        style={{ WebkitMaskImage: `url("${成品}")`, maskImage: `url("${成品}")` }}
      >
        <i />
      </div>
      <svg className={样式.蛊雾} viewBox='0 0 1000 333.333' fill='none' focusable='false'>
        <defs>
          <radialGradient id={`${标识}-core`}>
            <stop stopColor='#ffe3dc' stopOpacity='.9' />
            <stop offset='.22' stopColor='#e67b91' stopOpacity='.6' />
            <stop offset='.55' stopColor='#b33663' stopOpacity='.25' />
            <stop offset='1' stopColor='#9b355a' stopOpacity='0' />
          </radialGradient>
        </defs>
        <>
          <g className={样式.红丝}>
            <path d='M95 182 C250 126 376 227 535 180 S770 126 958 169' />
            <path d='M126 193 C287 252 445 145 580 192 S807 246 934 182' />
          </g>
          <g className={样式.光尘}>
            {光尘位置.slice(0, [5, 10, 16, 22, 28][阶段]).map(([x, y], 索引) => (
              <circle
                key={索引}
                cx={x}
                cy={y}
                r={索引 % 3 ? 2.5 : 1.7}
                fill={索引 % 3 ? '#e99aad' : '#ebe3e9'}
                style={{ '--dj-index': 索引 } as CSSProperties}
              />
            ))}
          </g>
        </>
        {阶段 >= 2 && (
          <g className={样式.蛊心}>
            <circle cx='642' cy='129' r='42' fill={`url(#${标识}-core)`} />
            <path d='M629 129 H655 M642 116 V142' stroke='#ffd0d0' strokeWidth='1.1' />
          </g>
        )}
        {阶段 === 4 && (
          <g className={样式.游丝}>
            <path d='M90 204 C270 140 376 104 522 168 S708 245 813 147' />
            <path d='M620 156 C651 97 705 10 760 57 S873 234 756 260' />
          </g>
        )}
      </svg>
    </>
  )
}
