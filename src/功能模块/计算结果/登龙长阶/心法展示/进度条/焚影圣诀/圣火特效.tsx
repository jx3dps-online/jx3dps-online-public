import { useId, type CSSProperties } from 'react'
import 样式 from './圣火特效.module.less'

const 焰气路径 = [
  'M346 108 C310 89 285 116 250 95 C219 76 191 95 151 83 C129 78 109 87 82 72 C126 101 157 110 196 107 C233 104 261 136 294 129 C318 125 330 122 346 108 Z',
  'M340 134 C306 123 280 155 246 141 C211 126 188 152 154 140 C123 127 102 152 66 140 C112 175 144 158 178 172 C216 187 237 164 272 163 C303 162 322 148 340 134 Z',
  'M333 166 C300 169 282 199 247 190 C218 181 198 207 171 202 C140 197 131 225 105 230 C144 236 165 220 193 228 C223 236 243 212 276 210 C305 207 321 183 333 166 Z',
  'M335 116 C303 95 286 100 258 89 C227 77 211 87 183 81 C208 109 227 103 251 118 C281 139 308 133 335 116 Z',
]
const 火舌路径 = [
  'M290 106 C321 77 352 96 377 67 C370 93 405 86 434 96 C472 111 493 86 532 99 C565 113 596 95 629 107 C673 121 699 106 746 116 L924 125 C798 134 685 133 596 125 C487 128 390 112 290 106 Z',
  'M365 155 C405 155 430 186 468 164 C460 185 497 180 535 162 C587 145 616 174 650 158 C683 145 717 170 761 150 L941 134 C802 163 687 181 561 181 C476 193 420 180 365 155 Z',
  'M325 99 C285 112 284 87 257 94 C267 77 238 80 221 73 C240 67 205 72 188 68 C226 64 258 67 281 79 C302 82 301 94 325 99 Z',
]

export default function 圣火特效({
  百分比,
  是否达成,
  忙碌,
  序号,
}: {
  百分比: number
  是否达成: boolean
  忙碌: boolean
  序号: number
}) {
  const 标识 = useId()
  if (忙碌 || 百分比 < 25) return null

  return (
    <div
      className={样式.特效}
      style={
        {
          '--fire-strength': (百分比 - 25) / 75,
          '--fire-delay': `${序号 * -3.6}s`,
        } as CSSProperties
      }
    >
      {百分比 >= 35 && (
        <svg className={样式.护手赤焰} viewBox='0 0 1000 333.333' focusable='false'>
          <defs>
            <linearGradient id={`${标识}-焰气`} x1='0' y1='.5' x2='1' y2='.5'>
              <stop stopColor='#a41d18' stopOpacity='0' />
              <stop offset='.3' stopColor='#ec3926' stopOpacity='.65' />
              <stop offset='.7' stopColor='#ff6938' stopOpacity='.9' />
              <stop offset='1' stopColor='#ffd19b' stopOpacity='.75' />
            </linearGradient>
            <radialGradient id={`${标识}-火雾`}>
              <stop stopColor='#ff863e' stopOpacity='.55' />
              <stop offset='.42' stopColor='#e83e22' stopOpacity='.36' />
              <stop offset='.72' stopColor='#bc251b' stopOpacity='.12' />
              <stop offset='1' stopColor='#bc251b' stopOpacity='0' />
            </radialGradient>
          </defs>
          <g className={样式.火雾} fill={`url(#${标识}-火雾)`}>
            <ellipse cx='240' cy='128' rx='130' ry='30' />
            <ellipse cx='205' cy='205' rx='110' ry='36' />
            <ellipse cx='290' cy='155' rx='118' ry='55' />
          </g>
          {焰气路径.map((路径, 索引) => (
            <g
              key={路径}
              className={样式.焰气}
              fill={`url(#${标识}-焰气)`}
              style={{ '--fire-wisp-index': 索引 } as CSSProperties}
            >
              <path d={路径} />
              <path className={样式.柔焰} d={路径} />
            </g>
          ))}
        </svg>
      )}
      <div className={样式.刀身流光}>
        <i />
      </div>
      {百分比 >= 50 && (
        <>
          <div className={样式.晶核}>
            <i />
          </div>
          <div className={样式.火星}>
            {Array.from({ length: 8 }, (_, 索引) => (
              <i
                key={索引}
                style={
                  {
                    '--spark-index': 索引,
                    left: `${19 + 索引 * 9}%`,
                    top: `${31 + (索引 % 3) * 8}%`,
                    width: 1.5 + (索引 % 3) * 0.5,
                    height: 3 + (索引 % 3),
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </>
      )}
      {百分比 >= 60 && (
        <svg className={样式.火舌} viewBox='0 0 1000 333.333' focusable='false'>
          {火舌路径.map((路径, 索引) => (
            <path key={路径} d={路径} style={{ '--flame-index': 索引 } as CSSProperties} />
          ))}
          <path
            className={样式.焰线}
            d='M304 99 C366 79 402 105 470 106 S592 112 664 119 S846 125 970 126'
            pathLength='100'
          />
        </svg>
      )}
      {是否达成 && (
        <svg className={样式.焰浪} viewBox='0 0 1000 333.333' focusable='false'>
          <path d='M185 196 C342 22 553 72 970 125' pathLength='100' />
          <path d='M262 84 C393 224 638 184 970 128' pathLength='100' />
        </svg>
      )}
    </div>
  )
}
