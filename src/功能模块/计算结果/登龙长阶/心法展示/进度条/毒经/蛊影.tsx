import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import 样式 from './蛊影.module.less'

const 蛇图腾 = `${GLOBAL_CDN_PREFIX}/20261029/jushe-tuteng.png`

export default function 蛊影({ 阶段 }: { 阶段: number }) {
  return (
    <div className={样式.蛊影}>
      <div className={样式.蛇影 + (阶段 === 4 ? ' ' + 样式.已达成 : '')}>
        <img className={样式.蛇图腾} src={蛇图腾} alt='' draggable={false} />
      </div>
    </div>
  )
}
