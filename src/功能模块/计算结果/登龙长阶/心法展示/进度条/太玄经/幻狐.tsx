import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { 星符素材 } from './星符素材'
import 踏星行 from './踏星行'
import 样式 from './幻狐.module.less'

const 幻狐金线动作 = `${GLOBAL_CDN_PREFIX}/20261029/huanhu-jinxian-dongzuo.png`

export default function 幻狐() {
  return (
    <div
      className={样式.幻狐轨迹}
      style={{ '--fox-sprite': `url(${幻狐金线动作})` } as CSSProperties}
      aria-hidden='true'
    >
      <div className={样式.位置}>
        <div className={样式.狐狸}>
          <div className={样式.撒星}>
            {[120, 240, 70, -50, 180, 20, 280, 150, -90, 210].map((落点, 序号) => (
              <span
                key={序号}
                className={样式.星粒}
                style={
                  {
                    '--star-x': `${260 + (序号 % 5) * 15}%`,
                    '--star-y': `${落点}%`,
                    '--star-size': `${6 + (序号 % 4)}px`,
                    '--star-angle': `${序号 * 29}deg`,
                    animationDelay: `${-序号 * 0.14}s`,
                  } as CSSProperties
                }
              >
                <img className={样式.星点} src={星符素材[0]} alt='' />
              </span>
            ))}
          </div>
          <i className={`${样式.动作} ${样式.跑动}`} />
          <i className={`${样式.动作} ${样式.蓄力}`} />
          <踏星行 />
        </div>
      </div>
    </div>
  )
}
