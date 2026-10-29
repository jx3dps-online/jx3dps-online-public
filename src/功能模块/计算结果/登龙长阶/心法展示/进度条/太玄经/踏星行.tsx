import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { 星符素材 } from './星符素材'
import 样式 from './踏星行.module.less'

const 紫云 = `${GLOBAL_CDN_PREFIX}/20261029/taxingxing-ziyun.png`

const 紫雾 = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="96" viewBox="0 0 128 96"><defs><radialGradient id="fog"><stop stop-color="#a080d4" stop-opacity=".85"/><stop offset=".5" stop-color="#8761b0" stop-opacity=".6"/><stop offset="1" stop-color="#60417e" stop-opacity="0"/></radialGradient><filter id="soft" x="-25%" y="-35%" width="150%" height="170%"><feTurbulence type="fractalNoise" baseFrequency=".045 .065" numOctaves="3" seed="17" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.2"/></filter></defs><g fill="url(#fog)" filter="url(#soft)"><ellipse cx="64" cy="52" rx="44" ry="26"/><ellipse cx="43" cy="39" rx="25" ry="22"/><ellipse cx="86" cy="39" rx="24" ry="20"/></g></svg>')}`

const 星宿 = [
  [
    [18, 54],
    [32, 24],
    [60, 30],
    [78, 16],
    [84, 60],
  ],
  [
    [16, 26],
    [32, 58],
    [58, 74],
    [80, 48],
    [64, 22],
  ],
  [
    [14, 42],
    [36, 34],
    [50, 66],
    [74, 56],
    [88, 28],
  ],
].map((点列) => {
  const 连线 = 点列.map(([横, 纵]) => `${横},${纵}`).join(' ')
  const 星点 = 点列
    .map(([横, 纵], 序号) => `<circle cx="${横}" cy="${纵}" r="${序号 % 2 ? 2 : 2.8}"/>`)
    .join('')
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polyline points="${连线}" fill="none" stroke="#e5c691" stroke-opacity=".7" stroke-width="1"/><g fill="#fff0c9">${星点}</g><path d="M28 24h8m-4-4v8" stroke="#fff4de" stroke-width=".8"/></svg>`)}`
})

export default function 踏星行() {
  return (
    <div className={样式.踏星行}>
      <div className={样式.余烟}>
        {[0, 1, 2, 3, 4].map((序号) => (
          <img
            key={序号}
            className={样式.烟团}
            src={紫雾}
            alt=''
            style={{ animationDelay: `${-序号 * 0.28}s` }}
          />
        ))}
      </div>
      <div className={样式.星云}>
        <img className={样式.云核} src={紫云} alt='' />
        <img className={样式.云旋} src={紫云} alt='' />
        <div className={样式.云中洛书}>
          <img src={星符素材[2]} alt='' />
          <img src={星符素材[6]} alt='' />
          <img src={星符素材[1]} alt='' />
          <img src={星符素材[5]} alt='' />
        </div>
      </div>
      {星宿.map((图片, 序号) => (
        <img
          key={序号}
          className={样式.星宿}
          src={图片}
          alt=''
          style={
            {
              '--constellation-x': `${[-65, 75, 15][序号]}%`,
              '--constellation-y': `${[-15, -35, 75][序号]}%`,
              '--constellation-angle': `${[-18, 24, -32][序号]}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
