import type { CSSProperties } from 'react'
import { 九字诀素材 } from './九字诀素材'
import { 星符素材 } from './星符素材'
import 样式 from './螺旋气流.module.less'

const 轮播素材 = 九字诀素材.flatMap((字诀, 序号) => [字诀.图片, 星符素材[[1, 2, 5, 7][序号]]])
const 散出素材 = 九字诀素材.flatMap((字诀, 序号) => [字诀.图片, 星符素材[[3, 4, 6, 7][序号]]])
const 散出方向 = [-300, -180, -70, 70, 180, 300]

export default function 螺旋气流({ 层 }: { 层: '前' | '后' }) {
  return (
    <div className={`${样式.螺旋特效} ${层 === '前' ? 样式.前方 : 样式.后方}`} aria-hidden='true'>
      {轮播素材.map((素材, 序号) => (
        <div key={序号} className={样式.符号轨迹} style={{ animationDelay: `${-序号 * 2}s` }}>
          <img className={样式.符号图} src={素材} alt='' />
        </div>
      ))}
      {层 === '前' && (
        <div className={样式.散出处}>
          {散出素材.map((素材, 序号) => {
            const 方向 = 散出方向[序号 % 散出方向.length]
            return (
              <div
                key={序号}
                className={样式.飞散}
                style={
                  {
                    '--scatter-y': `${方向}%`,
                    '--scatter-angle': `${方向 / 5}deg`,
                    animationDelay: `${-序号 * 0.75}s`,
                  } as CSSProperties
                }
              >
                <img className={样式.散符} src={素材} alt='' />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
