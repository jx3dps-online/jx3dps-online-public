import { 心法配置类型 } from '@/心法模块/interface'
import { 阵眼数据类型 } from './interface'
import 外功阵眼数据 from './外功'
import 内功阵眼数据 from './内功'
import 天罗诡道阵眼数据 from './天罗诡道'

const 阵眼数据 = {
  外功: 外功阵眼数据,
  内功: 内功阵眼数据,
  天罗诡道: 天罗诡道阵眼数据,
}

// 过滤出自己本门派的阵眼睛
export const 获取当前心法阵眼 = (心法数据: 心法配置类型, 功法) => {
  const 本功法阵眼数据: 阵眼数据类型[] = 阵眼数据?.[功法] || []

  return 本功法阵眼数据.filter((阵眼) => {
    if (阵眼?.所属心法) {
      return 阵眼?.所属心法 === 心法数据?.名称
    }
    if (阵眼?.过滤心法) {
      return 阵眼?.过滤心法 !== 心法数据?.名称
    }
    return true
  })
}

export default 阵眼数据
