import { 装备属性信息模型, 装备位置部位枚举, 装备类型枚举 } from '@/@types/装备'
import { 属性类型 } from '@/@types/属性'
import { generateCombinations } from './工具函数/附魔排列组合'
import { closestCombinations } from './工具函数/加速方案'
import { 精炼加成系数 } from '@/数据/常量'

self.onmessage = (event) => {
  const { data } = event // 获取传入的数据
  // 假设我们进行一些复杂的计算
  const result = 规划加速函数(data)
  self.postMessage(result) // 将结果发送回主线程
}

interface 规划加速函数类型 {
  目标加速: number
  包含装备部位: 装备位置部位枚举[]
  锁定装备: 装备属性信息模型[]
  品级范围: number[]
  计算范围: string[]
  装备类型: 装备类型枚举[]
  包含蓝色附魔小药: boolean
  当前数据: any
}

export interface 加速数据类型 {
  id: string | number // 唯一id
  label: string // 用于展示的名字
  value: number // 提供加速值
  type: string // 计算类型 相同类型不可重复选择
  equip?: any // 额外数据
}

const 规划加速函数 = (props: 规划加速函数类型) => {
  const {
    锁定装备 = [],
    目标加速 = 0,
    计算范围,
    包含装备部位,
    装备类型,
    品级范围,
    包含蓝色附魔小药 = false,
    当前数据,
  } = props
  const 锁定装备加速总和 = 获取锁定装备加速总和(锁定装备)
  const 实际目标加速 = 目标加速 - 锁定装备加速总和
  if (实际目标加速 <= 0) {
    return {
      错误信息: '锁定装备加速已符合目标加速需求',
    }
  } else {
    let 最终计算加速总数组: 加速数据类型[] = []

    计算范围?.forEach((范围) => {
      if (范围 === '五彩石') {
        const 五彩石最终数据 = 获取五彩石加速情况分类(当前数据)
        最终计算加速总数组 = 最终计算加速总数组?.concat(五彩石最终数据)
      } else if (范围 === '装备') {
        const 装备最终数据 = 获取装备加速模型(当前数据, 包含装备部位, 品级范围, 装备类型)
        最终计算加速总数组 = 最终计算加速总数组?.concat(装备最终数据)
      } else if (范围 === '附魔') {
        const 包含挑战暗器附魔 = 计算范围?.includes('挑战附魔')
        const 附魔最终数据 = 获取附魔加速模型(当前数据, 包含蓝色附魔小药, 包含挑战暗器附魔)
        最终计算加速总数组 = 最终计算加速总数组?.concat(附魔最终数据)
      } else if (范围 === '小药') {
        const 小药最终数据 = 获取小药加速模型(当前数据, 包含蓝色附魔小药)
        最终计算加速总数组 = 最终计算加速总数组?.concat(小药最终数据)
      } else if (范围 === '家园酒') {
        const 家园酒最终数据 = 获取家园酒加速模型(当前数据, 包含蓝色附魔小药)
        最终计算加速总数组 = 最终计算加速总数组?.concat(家园酒最终数据)
      } else if (范围 === '挑战附魔') {
        const 挑战附魔最终数据 = 获取挑战附魔加速模型(当前数据)
        最终计算加速总数组 = 最终计算加速总数组?.concat(挑战附魔最终数据)
      } else if (范围 === '阆风仙玉附魔') {
        const 阆风仙玉附魔最终数据 = 获取阆风仙玉附魔加速模型(当前数据)
        最终计算加速总数组 = 最终计算加速总数组?.concat(阆风仙玉附魔最终数据)
      }
    })

    try {
      const 获取所有组合 = closestCombinations(最终计算加速总数组, 实际目标加速, 100)
      if (!获取所有组合?.length) {
        return {
          错误信息: '当前计算范围无法满足加速目标',
        }
      } else {
        return {
          所有组合: 获取所有组合,
          锁定装备加速总和,
          实际目标加速,
        }
      }
    } catch {
      return {
        错误信息: '计算遇到未知错误，请截图计算组合并反馈给计算器作者',
      }
    }
  }
}

const 获取五彩石加速情况分类 = (当前数据) => {
  const { 五彩石 } = 当前数据
  const 六级五彩石 = 五彩石?.[6]
  const res = {}
  六级五彩石?.forEach((五彩石) => {
    if (五彩石?.五彩石名称?.includes('急速')) {
      五彩石?.装备增益?.forEach((增益, 索引) => {
        if (增益?.增益类型 === 属性类型.加速等级) {
          res[索引 + 1] = 增益?.增益数值
        }
      })
    }
  })
  const obj: 加速数据类型[] = []
  const map = { 1: '一属性加速五彩', 2: '二属性加速五彩', 3: '三属性加速五彩' }
  Object.keys(res)?.forEach((key) => {
    obj.push({
      id: `五彩石_${map[key]}`,
      label: map[key],
      value: res[key],
      type: '五彩石',
    })
  })
  return obj
}

const 获取小药加速模型 = (当前数据, 包含蓝色附魔小药) => {
  const { 小药小吃 } = 当前数据
  const 加速小药数据 = 小药小吃?.filter((小药) => {
    const 是否为加速小药 =
      小药?.增益集合?.some((item) => item?.属性 === 属性类型.加速等级) &&
      小药?.小吃部位 !== '家园酒品'
    if (!是否为加速小药) return false
    if (包含蓝色附魔小药) {
      return true
    } else {
      return 小药?.小吃品级 === '紫'
    }
  })

  const res: 加速数据类型[] = 加速小药数据.map((小药) => {
    return {
      id: `小药_${小药?.小吃名称}`,
      label: `${小药?.小吃品级}色${小药?.小吃部位}`,
      value: 小药?.增益集合?.[0]?.值,
      type: 小药?.小吃部位,
    }
  })
  return res
}

const 获取家园酒加速模型 = (当前数据, 包含蓝色附魔小药) => {
  const { 小药小吃 } = 当前数据
  const 加速小药数据 = 小药小吃?.filter((小药) => {
    const 是否为加速小药 =
      小药?.增益集合?.some((item) => item?.属性 === 属性类型.加速等级) &&
      小药?.小吃部位 === '家园酒品'
    if (!是否为加速小药) return false
    if (包含蓝色附魔小药) {
      return true
    } else {
      return 小药?.小吃品级 === '紫'
    }
  })

  const res: 加速数据类型[] = 加速小药数据.map((小药) => {
    return {
      id: `家园酒_${小药?.小吃名称}`,
      label: `${小药?.小吃名称?.replace('（加速）', '')}`,
      value: 小药?.增益集合?.[0]?.值,
      type: 小药?.小吃部位,
    }
  })
  return res
}

const 获取挑战附魔加速模型 = (当前数据) => {
  const { 附魔 } = 当前数据

  let 加速附魔数据: number[] = 附魔
    ?.filter((附魔) => {
      return 附魔?.附魔名称?.includes('加速') && 附魔?.挑战附魔
    })
    ?.map((item) => item?.增益集合?.[0]?.值)

  const 挑战附魔数值 = [...加速附魔数据]
  加速附魔数据 = [...加速附魔数据, 0]
  const 附魔排列组合 = generateCombinations(加速附魔数据, 1)
  const res: 加速数据类型[] = []
  附魔排列组合?.forEach((组合) => {
    const 加速值 = sumArray(组合)
    const 挑战附魔数量 = countOccurrences(组合, 挑战附魔数值?.[0], 挑战附魔数值?.[1])
    const 组合名称 = `${挑战附魔数量}个挑战附魔`
    res.push({
      id: `挑战附魔_${组合名称}`,
      label: `${组合名称}`,
      value: 加速值,
      type: '挑战附魔',
    })
  })
  return res
}

const 获取阆风仙玉附魔加速模型 = (当前数据) => {
  const { 附魔 } = 当前数据

  let 加速附魔数据: number[] = 附魔
    ?.filter((附魔) => {
      return 附魔?.附魔名称?.includes('加速') && 附魔?.阆风仙玉
    })
    ?.map((item) => item?.增益集合?.[0]?.值)

  const 阆风仙玉附魔数值 = [...加速附魔数据]
  加速附魔数据 = [...加速附魔数据, 0]
  const 附魔排列组合 = generateCombinations(加速附魔数据, 1)
  const res: 加速数据类型[] = []
  附魔排列组合?.forEach((组合) => {
    const 加速值 = sumArray(组合)
    const 阆风仙玉附魔数量 = countOccurrences(组合, 阆风仙玉附魔数值?.[0], 阆风仙玉附魔数值?.[1])
    const 组合名称 = `${阆风仙玉附魔数量}个阆风仙玉附魔`
    res.push({
      id: `阆风仙玉附魔_${组合名称}`,
      label: `${组合名称}`,
      value: 加速值,
      type: '阆风仙玉附魔',
    })
  })
  return res
}

const 获取附魔加速模型 = (当前数据, 包含蓝色附魔小药, 包含挑战暗器附魔) => {
  const { 附魔 } = 当前数据

  let 加速附魔数据: number[] = 附魔
    ?.filter((附魔) => {
      return 附魔?.附魔名称?.includes('加速') && !附魔?.挑战附魔 && !附魔?.阆风仙玉
    })
    ?.map((item) => item?.增益集合?.[0]?.值)

  const 紫色数值 = Math.max(...加速附魔数据)
  const 蓝色数值 = Math.min(...加速附魔数据)
  if (!包含蓝色附魔小药) {
    加速附魔数据 = [紫色数值]
  }
  加速附魔数据 = [...加速附魔数据, 0]
  const 计算部位 = 包含挑战暗器附魔 ? 2 : 3
  const 附魔排列组合 = generateCombinations(加速附魔数据, 计算部位)
  const res: 加速数据类型[] = []
  附魔排列组合?.forEach((组合) => {
    const 加速值 = sumArray(组合)
    const 紫色数量 = countOccurrences(组合, 紫色数值)
    const 蓝色数量 = countOccurrences(组合, 蓝色数值)
    const 组合名称 = `${紫色数量 ? `${紫色数量}个紫色附魔` : ''}${紫色数量 && 蓝色数量 ? '+' : ''}${
      蓝色数量 ? `${蓝色数量}个蓝色附魔` : ''
    }`
    res.push({
      id: `附魔_${组合名称}`,
      label: `${组合名称}`,
      value: 加速值,
      type: '附魔',
    })
  })
  return res
}

const 获取装备加速模型 = (
  当前数据,
  包含装备部位: 装备位置部位枚举[],
  品级范围: number[],
  装备类型: 装备类型枚举[],
) => {
  const res: 加速数据类型[] = []
  const { 装备数据 } = 当前数据
  包含装备部位?.forEach((部位key) => {
    const 部位 = 装备位置部位枚举[部位key]
    const 部位装备数据 = 装备数据?.[部位]
    if (部位装备数据?.length) {
      部位装备数据?.forEach((装备) => {
        if (
          (装备?.装备品级 >= 品级范围?.[0] || 0) &&
          装备?.装备品级 < 品级范围?.[1] &&
          装备类型?.includes(装备?.装备类型)
          // ![装备类型枚举.PVX, 装备类型枚举.橙武]?.includes(装备?.装备类型)
        ) {
          const 装备最大精炼等级 = 获取最大精炼等级(装备)
          let 加速值 = 0
          装备?.装备增益?.forEach((增益) => {
            if (增益?.属性 == 属性类型?.加速等级) {
              const 精炼后加速值 = 精炼加成系数算法(增益.值, 装备最大精炼等级) || 0
              加速值 = 加速值 + 精炼后加速值
            }
          })
          if (加速值 > 0) {
            const 判断当前是否有type已经完全一样加速 = res?.some(
              (old) => old?.type === 部位key && old?.value === 加速值,
            )
            if (!判断当前是否有type已经完全一样加速) {
              res.push({
                id: `装备_${装备?.id || ''}`,
                label: 装备?.装备名称,
                equip: 装备,
                value: 加速值,
                type: 部位key,
              })
            }
          }
        }
      })
    }
  })
  return res
}

const 获取锁定装备加速总和 = (锁定装备: 装备属性信息模型[]) => {
  if (!锁定装备?.length) {
    return 0
  }
  let 加速值 = 0
  锁定装备?.forEach((装备) => {
    const 装备最大精炼等级 = 获取最大精炼等级(装备)
    装备?.装备增益?.forEach((增益) => {
      if (增益?.属性 == 属性类型?.加速等级) {
        const 精炼后加速值 = 精炼加成系数算法(增益.值, 装备最大精炼等级) || 0
        加速值 = 加速值 + 精炼后加速值
      }
    })
  })
  return 加速值
}

export default 规划加速函数

function sumArray(arr) {
  let total = 0
  arr.forEach((num) => (total += num))
  return total
}

function countOccurrences(arr, num, num2?) {
  let count = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === num) {
      count++
    } else if (num2 && arr[i] === num2) {
      count++
    }
  }
  return count
}

const 获取最大精炼等级 = (data?: 装备属性信息模型) => {
  switch (data?.装备类型) {
    case 装备类型枚举.橙武:
      return 8
    case 装备类型枚举.副本精简:
    case 装备类型枚举.特效武器:
      return 6
    case 装备类型枚举.试炼精简:
      return 6
    default:
      return 6
  }
}

/**
 * @name 精炼加成系数算法
 */
const 精炼加成系数算法 = (基础, 等级) => {
  return 基础 + Math.round(基础 * 精炼加成系数[等级])
}
