import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { 获取烟雾素材, 烟雾区域 } from './烟雾素材'
import 武器样式 from './index.module.less'
import 样式 from './魂灯特效.module.less'

const 子不语 = `${GLOBAL_CDN_PREFIX}/20261029/zibuyu.png`

const 烟流路径 =
  'M186 211C166 211 139 221 119 207S110 180 122 161C135 141 177 137 208 121S230 91 243 70C255 44 278 42 290 60S294 98 313 115C335 135 352 113 362 92S388 68 402 85C416 105 403 124 436 126C453 134 471 133 484 131'

const 连续烟纹 = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><filter id="texture" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.075" numOctaves="2" seed="11" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.72  0 0 0 0 0.72  1.2 1.2 1.2 0 -1.1"/></filter><rect width="80" height="80" filter="url(#texture)"/></svg>`,
)}`
const 烟流遮罩 = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><defs><filter id="edge"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.075" numOctaves="2" seed="11" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3"/></filter><linearGradient id="end" gradientUnits="userSpaceOnUse" x1="450" x2="486"><stop stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="range" maskUnits="userSpaceOnUse" x="0" y="0" width="486" height="300"><rect width="486" height="300" fill="url(#end)"/></mask></defs><path d="${烟流路径}" fill="none" stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" filter="url(#edge)" mask="url(#range)"/></svg>`,
)}`

export default function 魂灯特效() {
  const [烟雾素材, 设置烟雾素材] = useState<string[]>([])

  useEffect(() => {
    const 图像 = new Image()
    图像.crossOrigin = 'anonymous'
    图像.onload = () => 设置烟雾素材(获取烟雾素材(图像))
    图像.src = 子不语
    return () => {
      图像.onload = null
    }
  }, [])

  return (
    <div className={样式.魂灯} aria-hidden='true'>
      {[false, true].map((随悬偶) => (
        <div key={String(随悬偶)} className={随悬偶 ? 武器样式.悬偶 : 武器样式.固定部分}>
          <div className={随悬偶 ? 武器样式.悬偶内容 : undefined}>
            {烟雾素材.map((素材, 序号) =>
              随悬偶 && 序号 !== 0
                ? null
                : [0, 1].map((层) => (
                    <img
                      key={`${烟雾区域[序号].名称}-${层}`}
                      className={样式.扩散}
                      src={素材}
                      alt=''
                      style={
                        {
                          transformOrigin: 烟雾区域[序号].中心,
                          '--smoke-x': 烟雾区域[序号].横移,
                          '--smoke-y': 烟雾区域[序号].纵移,
                          '--smoke-scale': 烟雾区域[序号].缩放,
                          '--smoke-rotate': 烟雾区域[序号].旋转,
                          animationDuration: `${烟雾区域[序号].周期}s`,
                          animationDelay: `${烟雾区域[序号].延迟 - (层 * 烟雾区域[序号].周期) / 2}s`,
                        } as CSSProperties
                      }
                    />
                  )),
            )}
            <div
              className={样式.烟道}
              style={{ WebkitMaskImage: `url("${烟流遮罩}")`, maskImage: `url("${烟流遮罩}")` }}
            >
              <div className={样式.流动烟纹} style={{ backgroundImage: `url("${连续烟纹}")` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
