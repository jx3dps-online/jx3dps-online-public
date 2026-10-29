import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import 光翼 from './光翼'
import 样式 from './机关特效.module.less'
const 武器 = `${GLOBAL_CDN_PREFIX}/20261025/huiting-touming.png`

const 下缘气流 =
  'M597 203C557 230 524 262 462 267C414 271 374 282 333 296C384 291 428 286 470 282C533 277 579 235 597 203Z'

export default function 机关特效({
  进度,
  达成,
  暂停,
}: {
  进度: number
  达成: boolean
  暂停: boolean
}) {
  const 标识 = useId()
  const 上次达成 = useRef<boolean | undefined>(暂停 ? undefined : 达成)
  const [播放达成, 设置播放达成] = useState(false)
  useEffect(() => {
    if (暂停) {
      设置播放达成(false)
      return
    }
    const 新达成 = 上次达成.current === false && 达成
    上次达成.current = 达成
    if (新达成) {
      设置播放达成(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } else if (!达成) {
      设置播放达成(false)
    }
  }, [达成, 暂停])

  useEffect(() => {
    if (!播放达成) return
    const 动态偏好 = window.matchMedia('(prefers-reduced-motion: reduce)')
    const 停止播放 = () => {
      if (动态偏好.matches) 设置播放达成(false)
    }
    动态偏好.addEventListener('change', 停止播放)
    return () => 动态偏好.removeEventListener('change', 停止播放)
  }, [播放达成])

  const 薄雾 = Math.min(1, Math.max(0, (进度 - 0.08) / 0.47))
  const 导槽 = Math.min(1, Math.max(0, (进度 - 0.28) / 0.32))
  const 气流 = Math.min(1, Math.max(0, (进度 - 0.35) / 0.45))
  const 机芯 = Math.min(1, Math.max(0, (进度 - 0.5) / 0.35))
  const 电弧 = Math.min(1, Math.max(0, (进度 - 0.72) / 0.28))

  return (
    <svg
      className={`${样式.特效} ${播放达成 ? 样式.正在达成 : ''}`}
      viewBox='0 0 1000 333.333'
      focusable='false'
      data-active={!暂停 && 进度 > 0}
    >
      <defs>
        <linearGradient
          id={`${标识}-reveal`}
          gradientUnits='userSpaceOnUse'
          x1={进度 * 1000 - 40}
          x2={进度 * 1000 + 12}
        >
          <stop stopColor='white' />
          <stop offset='1' stopColor='black' />
        </linearGradient>
        <mask
          id={`${标识}-progress`}
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width='1000'
          height='333.333'
        >
          <rect width='1000' height='333.333' fill={`url(#${标识}-reveal)`} />
        </mask>
        <mask
          id={`${标识}-weapon`}
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width='1000'
          height='333.333'
          style={{ maskType: 'alpha' }}
        >
          <image href={武器} width='1000' height='333.333' />
        </mask>
        <linearGradient id={`${标识}-flow`}>
          <stop stopColor='#9293f3' stopOpacity='0' />
          <stop offset='.5' stopColor='#b4baff' stopOpacity='.3' />
          <stop offset='.72' stopColor='#f0f6ff' stopOpacity='.9' />
          <stop offset='1' stopColor='#b0dfff' stopOpacity='0' />
        </linearGradient>
        <linearGradient
          id={`${标识}-wisp`}
          gradientUnits='userSpaceOnUse'
          x1='260'
          y1='90'
          x2='590'
          y2='170'
        >
          <stop stopColor='#7ba9eb' stopOpacity='0' />
          <stop offset='.35' stopColor='#86bafa' stopOpacity='.2' />
          <stop offset='.75' stopColor='#c8e8ff' stopOpacity='.65' />
          <stop offset='1' stopColor='#c3c9fa' stopOpacity='0' />
        </linearGradient>
        <radialGradient id={`${标识}-mist`}>
          <stop stopColor='#9ebce7' stopOpacity='.26' />
          <stop offset='.4' stopColor='#748fc7' stopOpacity='.14' />
          <stop offset='.72' stopColor='#777ab9' stopOpacity='.05' />
          <stop offset='1' stopColor='#617aa6' stopOpacity='0' />
        </radialGradient>
        <radialGradient id={`${标识}-core`}>
          <stop stopColor='#f5faff' stopOpacity='.85' />
          <stop offset='.2' stopColor='#b6e2ff' stopOpacity='.5' />
          <stop offset='.5' stopColor='#8f9fe3' stopOpacity='.16' />
          <stop offset='1' stopColor='#648bca' stopOpacity='0' />
        </radialGradient>
        <filter id={`${标识}-glow`} x='-30%' y='-50%' width='160%' height='200%'>
          <feGaussianBlur stdDeviation='1.8' />
          <feMerge>
            <feMergeNode />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>
      <g mask={`url(#${标识}-progress)`}>
        <g className={样式.阶段} opacity={薄雾}>
          <g className={样式.薄雾} fill={`url(#${标识}-mist)`}>
            <ellipse cx='378' cy='100' rx='226' ry='78' />
            <ellipse cx='561' cy='235' rx='242' ry='80' />
            <ellipse cx='750' cy='142' rx='208' ry='69' />
          </g>
        </g>
        <光翼 进度={进度} 暂停={暂停} 达成={播放达成} />
        <g className={样式.阶段} opacity={气流} style={{ '--tlgd-index': 1 } as CSSProperties}>
          <g className={样式.气缕}>
            <path d={下缘气流} fill={`url(#${标识}-wisp)`} />
            <path className={样式.柔光} d={下缘气流} fill={`url(#${标识}-wisp)`} />
          </g>
          <g className={样式.翼纹} filter={`url(#${标识}-glow)`}>
            <path d='M584 201L565 227L545 224L521 245L501 242L470 260L438 260' pathLength='100' />
          </g>
        </g>
        <g className={样式.阶段} opacity={导槽} mask={`url(#${标识}-weapon)`}>
          <g className={样式.导槽}>
            <path d='M190 231L264 245L360 214L464 170L541 164' pathLength='100' />
            <path d='M305 194L354 177L414 164L449 156' pathLength='100' />
            <path d='M622 157L724 151L795 149L903 153' pathLength='100' />
          </g>
          <rect
            className={样式.流光}
            x='-180'
            width='180'
            height='333.333'
            fill={`url(#${标识}-flow)`}
          />
        </g>
        <g className={样式.阶段} opacity={机芯}>
          <ellipse
            className={样式.呼吸}
            cx='560'
            cy='166'
            rx='98'
            ry='105'
            fill={`url(#${标识}-core)`}
          />
          <g transform='translate(560 166) rotate(-12) scale(.84 1)'>
            <g className={样式.转轮}>
              <circle className={样式.金环} r='71' />
              <path className={样式.环光} d='M-71 0A71 71 0 0 1 0 -71' />
              <circle className={样式.光点} cy='-71' r='3.2' />
            </g>
            <circle className={样式.内环} r='60' />
          </g>
          {Array.from({ length: 12 }, (_, 序号) => (
            <g key={序号} transform={`translate(${440 + 序号 * 22} ${序号 % 2 ? 216 : 110})`}>
              <path
                className={样式.火星}
                d='M-2 0L0 -3L2 0L0 3Z'
                style={
                  {
                    '--tlgd-delay': `${序号 * -0.43}s`,
                    '--tlgd-x': `${(序号 - 5.5) * 9}px`,
                    '--tlgd-y': `${序号 % 2 ? 30 : -34}px`,
                  } as CSSProperties
                }
              />
            </g>
          ))}
        </g>
        <g className={样式.阶段} opacity={电弧}>
          <g className={样式.电弧} filter={`url(#${标识}-glow)`}>
            <path d='M488 137L508 128L500 145L532 153L543 139L560 165' />
            <path d='M561 168L586 187L581 171L613 179L627 162L648 171' />
            <path d='M537 176L521 191L530 200L510 217M578 151L595 136L588 119L607 110' />
          </g>
          <g className={样式.传光}>
            <ellipse
              className={样式.蓄能}
              cx='560'
              cy='166'
              rx='72'
              ry='80'
              fill={`url(#${标识}-core)`}
            />
            <g mask={`url(#${标识}-weapon)`}>
              <path
                className={样式.轨光}
                d='M588 143L740 138L958 146M590 176L753 169L958 157'
                pathLength='100'
                filter={`url(#${标识}-glow)`}
              />
            </g>
            <g className={样式.尖芒} transform='translate(958 150)'>
              <circle r='24' fill={`url(#${标识}-core)`} />
              <path d='M-12 0H12M0 -9V9' />
            </g>
          </g>
        </g>
        {播放达成 && (
          <g
            className={样式.达成}
            onAnimationEnd={(事件) => {
              if (事件.target === 事件.currentTarget) 设置播放达成(false)
            }}
          >
            <ellipse
              className={样式.蓄能}
              cx='560'
              cy='166'
              rx='100'
              ry='110'
              fill={`url(#${标识}-core)`}
            />
            <g mask={`url(#${标识}-weapon)`}>
              <path
                className={样式.轨光}
                d='M588 143L740 138L958 146M590 176L753 169L958 157'
                pathLength='100'
                filter={`url(#${标识}-glow)`}
              />
            </g>
            <g className={样式.尖芒} transform='translate(958 150)'>
              <circle r='32' fill={`url(#${标识}-core)`} />
              <path d='M-16 0H16M0 -12V12' />
            </g>
            <g transform='translate(943 151)'>
              {[-2, -1, 0, 1, 2].map((方向) => (
                <circle
                  key={方向}
                  className={样式.散星}
                  r='1.8'
                  style={{ '--tlgd-direction': 方向 } as CSSProperties}
                />
              ))}
            </g>
          </g>
        )}
      </g>
    </svg>
  )
}
