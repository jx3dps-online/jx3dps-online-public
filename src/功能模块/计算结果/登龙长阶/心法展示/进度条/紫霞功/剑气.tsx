import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { 登阶进度属性 } from '../类型'
import 样式 from './剑气.module.less'
const 成品 = `${GLOBAL_CDN_PREFIX}/20261025/chitongzhaoye-liangtai.png`

const 气环路径 = [
  'M-152 0A152 51 0 1 1 152 0A152 51 0 1 1 -152 0',
  'M-180 0A180 32 0 1 1 180 0A180 32 0 1 1 -180 0',
]

function 气环({ 前方, 编号 }: { 前方: boolean; 编号: string }) {
  return (
    <g transform='translate(250 148)'>
      {气环路径.map((路径, 序号) => (
        <g key={序号} transform={`rotate(${序号 ? 13 : -12})`}>
          <g
            className={样式.气环}
            data-orbit={序号}
            clipPath={`url(#${编号}-${前方 ? 'front' : 'back'})`}
          >
            <path className={样式.气带} d={路径} />
            <path className={样式.气线} d={路径} />
            <path className={样式.游光} d={路径} pathLength='100' />
          </g>
        </g>
      ))}
    </g>
  )
}

export default function 剑气({
  百分比,
  是否达成,
  忙碌 = false,
  children,
}: 登阶进度属性 & { children: ReactNode }) {
  const 编号 = useId()
  const 上次达成 = useRef<boolean | undefined>(忙碌 ? undefined : 是否达成)
  const [播放达成, 设置播放达成] = useState(false)
  useEffect(() => {
    if (忙碌) {
      设置播放达成(false)
      return
    }
    const 新达成 = 上次达成.current === false && 是否达成
    上次达成.current = 是否达成
    if (新达成) 设置播放达成(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    else if (!是否达成) 设置播放达成(false)
  }, [是否达成, 忙碌])
  useEffect(() => {
    if (!播放达成) return
    const 动态偏好 = window.matchMedia('(prefers-reduced-motion: reduce)')
    const 停止播放 = () => {
      if (动态偏好.matches) 设置播放达成(false)
    }
    停止播放()
    动态偏好.addEventListener('change', 停止播放)
    return () => 动态偏好.removeEventListener('change', 停止播放)
  }, [播放达成])

  const 进度 = 百分比 / 100
  const 气息 = Math.min(1, Math.max(0, (进度 - 0.15) / 0.5))
  const 两仪 = Math.min(1, Math.max(0, (进度 - 0.3) / 0.4))
  const 环流 = Math.min(1, Math.max(0, (进度 - 0.45) / 0.5))
  const 流光 = Math.min(1, Math.max(0, (进度 - 0.7) / 0.3))

  return (
    <div className={样式.剑气} data-active={!忙碌 && 进度 > 0} data-complete={播放达成}>
      <svg className={样式.后景} viewBox='0 0 1000 333.333' focusable='false'>
        <defs>
          <linearGradient
            id={`${编号}-progress`}
            gradientUnits='userSpaceOnUse'
            x1={进度 * 1000 - 35}
            x2={进度 * 1000 + 5}
          >
            <stop stopColor='white' />
            <stop offset='1' stopColor='black' />
          </linearGradient>
          <mask
            id={`${编号}-reveal`}
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width='1000'
            height='333.333'
          >
            <rect width='1000' height='333.333' fill={`url(#${编号}-progress)`} />
          </mask>
          <clipPath id={`${编号}-back`} clipPathUnits='userSpaceOnUse'>
            <rect x='-200' y='-70' width='400' height='70' />
          </clipPath>
          <clipPath id={`${编号}-front`} clipPathUnits='userSpaceOnUse'>
            <rect x='-200' y='0' width='400' height='70' />
          </clipPath>
          <linearGradient id={`${编号}-breath`} gradientUnits='userSpaceOnUse' x1='335' x2='960'>
            <stop stopColor='#d2c5ed' stopOpacity='0' />
            <stop offset='.2' stopColor='#ddd5ef' stopOpacity='.6' />
            <stop offset='.65' stopColor='#f8ede6' stopOpacity='.5' />
            <stop offset='1' stopColor='#d9d2ed' stopOpacity='0' />
          </linearGradient>
          <mask
            id={`${编号}-weapon`}
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width='1000'
            height='333.333'
            style={{ maskType: 'alpha' }}
          >
            <image href={成品} width='1000' height='333.333' />
          </mask>
          <radialGradient id={`${编号}-mist`}>
            <stop stopColor='#c3b5ed' stopOpacity='.23' />
            <stop offset='.5' stopColor='#c4c9f2' stopOpacity='.09' />
            <stop offset='1' stopColor='#9faadd' stopOpacity='0' />
          </radialGradient>
          <linearGradient id={`${编号}-sweep`}>
            <stop stopColor='#c1b1ec' stopOpacity='0' />
            <stop offset='.5' stopColor='#fff0e6' stopOpacity='.85' />
            <stop offset='1' stopColor='#c1b1ec' stopOpacity='0' />
          </linearGradient>
        </defs>
        <g mask={`url(#${编号}-reveal)`}>
          <g opacity={气息}>
            <ellipse
              className={样式.紫气}
              cx='540'
              cy='166'
              rx='420'
              ry='68'
              fill={`url(#${编号}-mist)`}
            />
          </g>
          <g opacity={两仪} transform='translate(250 148)'>
            <g className={样式.外环}>
              <circle className={样式.环底} r='65' />
              <path className={样式.阳弧} d='M-65 0A65 65 0 0 1 32.5 -56.3' />
              <path className={样式.阴弧} d='M65 0A65 65 0 0 1 -32.5 56.3' />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((序号) => (
                <path
                  key={序号}
                  className={样式.刻线}
                  d='M0 -70V-74M-3 -70H3'
                  transform={`rotate(${序号 * 45})`}
                />
              ))}
              <circle className={样式.光点} cx='-65' r='2.1' />
              <circle className={样式.光点} cx='65' r='2.1' />
            </g>
          </g>
          <g className={样式.后环} opacity={环流}>
            <气环 前方={false} 编号={编号} />
          </g>
        </g>
      </svg>
      {children}
      <svg className={样式.前景} viewBox='0 0 1000 333.333' focusable='false'>
        <g mask={`url(#${编号}-reveal)`}>
          <g opacity={两仪} transform='translate(250 148)'>
            <g className={样式.内环}>
              <circle className={样式.阳面} r='24' />
              <path
                className={样式.阴面}
                d='M0 -24A24 24 0 0 1 0 24A12 12 0 0 1 0 0A12 12 0 0 0 0 -24Z'
              />
              <circle className={样式.环底} r='24' />
              <circle className={样式.阴眼} cy='-12' r='2.8' />
              <circle className={样式.阳眼} cy='12' r='2.8' />
            </g>
          </g>
          <g opacity={环流}>
            <气环 前方 编号={编号} />
            <g className={样式.引气} stroke={`url(#${编号}-breath)`}>
              <path d='M342 135C438 108 495 129 600 146S819 170 946 157' pathLength='100' />
              <path d='M347 180C458 207 550 191 650 174S832 151 946 160' pathLength='100' />
            </g>
          </g>
          <g opacity={流光} mask={`url(#${编号}-weapon)`}>
            <rect
              className={样式.剑脊流光}
              x='230'
              y='118'
              width='130'
              height='78'
              fill={`url(#${编号}-sweep)`}
            />
          </g>
          <g opacity={环流}>
            {Array.from({ length: 9 }, (_, 序号) => (
              <g key={序号} transform={`translate(${320 + 序号 * 73} ${序号 % 2 ? 203 : 127})`}>
                <path
                  className={样式.星屑}
                  d='M-2 0H2M0 -2V2'
                  style={{ '--zxg-star': 序号 } as CSSProperties}
                />
              </g>
            ))}
          </g>
          <g opacity={流光} transform='translate(956 163)'>
            <path className={样式.剑尖} d='M-10 0H10M0 -8V8' />
          </g>
          {播放达成 && (
            <g
              className={样式.达成}
              onAnimationEnd={(事件) => {
                if (事件.target === 事件.currentTarget) 设置播放达成(false)
              }}
            >
              <g transform='translate(250 148)'>
                <circle className={样式.汇光} r='62' />
              </g>
              <g mask={`url(#${编号}-weapon)`}>
                <rect
                  className={样式.达成流光}
                  x='230'
                  y='118'
                  width='130'
                  height='78'
                  fill={`url(#${编号}-sweep)`}
                />
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
