import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import type { 登阶进度属性 } from '../类型'
import 样式 from './流光.module.less'
const 成品 = `${GLOBAL_CDN_PREFIX}/20261025/yixijianhan-chengpin.png`

const 气流路径 = [
  'M 292 165 C 269 140 250 133 222 131 C 191 129 172 107 134 95 C 172 124 189 151 221 154 C 248 155 271 175 292 165 Z',
  'M 292 165 C 275 137 250 123 234 113 C 211 101 194 111 163 88 C 185 122 216 122 229 138 C 249 161 270 166 292 165 Z',
  'M 291 164 C 256 153 237 159 211 145 C 189 133 166 139 143 126 C 162 147 191 150 210 158 C 239 174 264 169 291 164 Z',
]

export default function 流光({ 百分比, 是否达成, 忙碌 = false }: 登阶进度属性) {
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
    if (新达成) {
      设置播放达成(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } else if (!是否达成) {
      设置播放达成(false)
    }
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

  if (忙碌 || 百分比 < 50) return null
  const 实体遮罩 = { WebkitMaskImage: `url(${成品})`, maskImage: `url(${成品})` }
  return (
    <div
      className={`${样式.流光} ${播放达成 ? 样式.正在达成 : ''}`}
      style={{ '--gfj-wisp': 0.35 + ((百分比 - 50) / 50) * 0.55 } as CSSProperties}
    >
      <svg className={样式.气流} viewBox='0 0 1000 333' focusable='false'>
        <defs>
          <linearGradient id={`${编号}-赤气`} x1='1' y1='1' x2='0' y2='0'>
            <stop stopColor='#ff967c' stopOpacity='.8' />
            <stop offset='.38' stopColor='#d92d57' stopOpacity='.8' />
            <stop offset='1' stopColor='#9b243e' stopOpacity='0' />
          </linearGradient>
          <linearGradient id={`${编号}-紫气`} x1='1' y1='1' x2='0' y2='0'>
            <stop stopColor='#dcc3ff' stopOpacity='.7' />
            <stop offset='.4' stopColor='#a665e8' stopOpacity='.7' />
            <stop offset='1' stopColor='#663d9f' stopOpacity='0' />
          </linearGradient>
        </defs>
        {气流路径.map((路径, 序号) => (
          <g key={序号} className={样式.气缕} style={{ '--gfj-wisp-index': 序号 } as CSSProperties}>
            <path d={路径} fill={`url(#${编号}-${序号 === 1 ? '紫气' : '赤气'})`} />
            <path
              className={样式.气雾}
              d={路径}
              fill={`url(#${编号}-${序号 === 1 ? '紫气' : '赤气'})`}
            />
          </g>
        ))}
      </svg>
      {百分比 >= 75 && (
        <div className={样式.传光}>
          <div className={样式.实体} style={实体遮罩}>
            <div className={样式.裂隙范围}>
              <i className={样式.光束} />
            </div>
          </div>
        </div>
      )}
      {百分比 >= 92 && <i className={`${样式.刀尖} ${样式.星芒}`} />}
      {播放达成 && (
        <div
          className={样式.达成}
          onAnimationEnd={(事件) => {
            if (事件.target === 事件.currentTarget) 设置播放达成(false)
          }}
        >
          <i className={样式.护手} />
          <div className={样式.实体} style={实体遮罩}>
            <div className={样式.裂隙范围}>
              <i className={样式.光束} />
            </div>
          </div>
          <i className={`${样式.刀尖} ${样式.星芒}`} />
          <div className={样式.散星}>
            {[-1, 0, 1].map((方向) => (
              <i key={方向} style={{ '--gfj-scatter': 方向 } as CSSProperties} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
