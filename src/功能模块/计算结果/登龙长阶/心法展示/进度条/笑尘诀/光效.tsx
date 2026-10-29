import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import 样式 from './光效.module.less'
const 青龙映夜 = `${GLOBAL_CDN_PREFIX}/20261025/qinglongyingye-jincou.png`

const 酒气路径 = [
  'M248 150 C270 111 315 123 362 99 S453 123 533 93 S651 67 724 83',
  'M249 163 C294 177 330 126 384 137 S482 147 557 112 S671 133 785 101',
  'M240 152 C252 111 304 85 358 105 S438 69 505 80 S604 101 677 69',
  'M256 158 C303 205 363 171 418 188 S520 159 595 180 S701 159 812 176',
  'M282 159 C345 131 399 171 460 151 S577 144 648 120 S776 143 904 116',
  'M265 164 C319 182 362 219 427 198 S550 212 624 184 S756 203 906 166',
]
const 游龙路径 = [
  'M255 146 C302 55 370 51 430 85 S520 132 588 94 S695 43 753 73 S846 119 926 74',
  'M254 151 C302 195 368 204 432 174 S543 111 612 149 S722 198 789 157 S871 129 928 144',
]

export default function 渐进光效({
  百分比,
  是否达成,
  忙碌,
}: {
  百分比: number
  是否达成: boolean
  忙碌: boolean
}) {
  const 进度 = 百分比 / 100

  return (
    <div
      className={`${样式.光效} ${忙碌 ? '' : 样式.播放}`}
      style={{ '--xcj-strength': Math.max(0, (进度 - 0.2) / 0.8) } as CSSProperties}
    >
      {百分比 > 20 && (
        <div className={样式.壶心}>
          <i />
        </div>
      )}
      {!忙碌 && 百分比 >= 25 && (
        <div
          className={样式.器身流光}
          style={{ WebkitMaskImage: `url(${青龙映夜})`, maskImage: `url(${青龙映夜})` }}
        >
          <i />
        </div>
      )}
      {!忙碌 && 百分比 >= 35 && (
        <div className={样式.酒滴}>
          {Array.from({ length: 16 }, (_, 序号) => (
            <i
              key={序号}
              style={
                {
                  '--xcj-drop': 序号,
                  '--xcj-drift': 序号 % 2 === 0 ? '-18px' : '12px',
                  left: `${序号 < 7 ? 23 + 序号 * 3 : 44 + (序号 - 7) * 5.5}%`,
                  top: `${38 + (序号 % 4) * 5}%`,
                  width: 2 + (序号 % 3) * 0.5,
                  height: 3 + (序号 % 3) * 0.6,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      {!忙碌 && 百分比 >= 50 && (
        <svg className={样式.酒气} viewBox='0 0 1000 333.333' focusable='false'>
          {酒气路径.map((路径, 序号) => (
            <g key={路径} style={{ '--xcj-wisp': 序号 } as CSSProperties}>
              <path className={样式.气雾} d={路径} />
              <path className={样式.气流} d={路径} pathLength='100' />
            </g>
          ))}
        </svg>
      )}
      {!忙碌 && 百分比 >= 75 && (
        <svg
          className={样式.游龙}
          style={{ opacity: 0.38 + (进度 - 0.75) * 1.6 }}
          viewBox='0 0 1000 333.333'
          focusable='false'
        >
          {游龙路径.map((路径) => (
            <g key={路径}>
              <path className={样式.龙身} d={路径} />
              <path className={样式.龙光} d={路径} pathLength='100' />
            </g>
          ))}
          <path
            className={样式.龙首}
            d='M904 85 Q915 64 930 71 L947 70 L938 79 L923 81 M917 71 L916 60 L908 54 M927 70 L935 57 L944 54 M921 82 Q911 93 896 90 M925 86 L918 96'
          />
        </svg>
      )}
      {是否达成 && !忙碌 && (
        <div className={样式.满阶掠光}>
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  )
}
