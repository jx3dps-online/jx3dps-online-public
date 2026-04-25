import 外功团队增益数据 from './外功'
import 内功团队增益数据 from './内功'
import { 团队增益数据类型 } from '@/@types/团队增益'

const 天罗诡道团队增益 = () => {
  const 基础增益 = 内功团队增益数据?.filter((item) => item?.增益名称 !== '破苍穹')
  const 外功基础增益 = 外功团队增益数据?.filter((item) => item?.增益名称 === '碎星辰')
  外功基础增益.forEach((item) => {
    if (!基础增益?.some((a) => a?.增益名称 === item?.增益名称)) {
      基础增益?.push(item)
    }
  })
  return 基础增益
}

const 团队增益数据: Record<string, 团队增益数据类型[]> = {
  外功: 外功团队增益数据,
  内功: 内功团队增益数据,
  天罗诡道: 天罗诡道团队增益(),
}

export const 获取团队增益数据 = (功法, 心法) => {
  const 原始数据 = 团队增益数据[功法]?.filter((增益) => {
    if (增益?.心法特供) {
      return 心法 === 增益?.心法特供
    } else if (增益?.过滤心法) {
      return 心法 !== 增益?.过滤心法
    }
    return true
  })
  return 原始数据 || []
}

export default 团队增益数据
