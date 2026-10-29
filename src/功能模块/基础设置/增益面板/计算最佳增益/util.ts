import { 小药小吃数据类型 } from '@/@types/小药小吃'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export const 计算部位枚举 = {
  阵眼: '阵眼',
  家园酒品: '家园酒品',
  药品辅助: '药品辅助',
  药品增强: '药品增强',
  食品辅助: '食品辅助',
  食品增强: '食品增强',
}

// 同一小吃部位内，同属性组合只保留数值最高的小吃（不区分品级颜色）
const 获取部位候选小吃 = (小吃列表: 小药小吃数据类型[]) => {
  const candidates: Array<{
    item: 小药小吃数据类型
    gains: Record<string, number>
    shape: string
  }> = []
  for (const item of 小吃列表) {
    const gains: Record<string, number> = {}
    item?.增益集合?.forEach(({ 属性, 值 }) => {
      gains[属性] = (gains[属性] || 0) + 值
    })
    const attrs = Object.keys(gains).sort()
    const shape = attrs.join('|')
    if (
      candidates.some(
        (c) => c.shape === shape && attrs.every((attr) => c.gains[attr] >= gains[attr]),
      )
    ) {
      continue
    }
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (
        candidates[i].shape === shape &&
        attrs.every((attr) => gains[attr] >= candidates[i].gains[attr])
      ) {
        candidates.splice(i, 1)
      }
    }
    candidates.push({ item, gains, shape })
  }
  return candidates.map((c) => c.item)
}

export const 初始化所有组合 = (计算部位, 是否过滤加速?: boolean) => {
  const { 阵眼, 小药小吃, 主属性 } = 获取当前数据()
  const res = {}
  Object.keys(计算部位枚举)
    .filter((key) => 计算部位?.includes(key))
    .forEach((key) => {
      if (!res?.[key]) {
        res[key] = []
      }
      if (key === '阵眼') {
        阵眼?.forEach((item) => {
          res[key].push(item?.阵眼名称)
        })
        return
      }
      const 本部位小吃 = (小药小吃 || []).filter((item) => {
        if (!item?.小吃部位?.includes(计算部位枚举[key] as any)) {
          return false
        }
        const 小吃增益类型 = item?.小吃名称?.split('（')?.[1]?.split('）')?.[0]

        // 判断主属性问题
        if (['力道', '身法', '根骨', '元气']?.includes(小吃增益类型)) {
          return 小吃增益类型 === 主属性
        }

        // 判断是否过滤加速
        if (是否过滤加速 && 小吃增益类型 === '加速') {
          return false
        }

        return true
      })
      // 同一部位同属性只保留数值最高的小吃
      获取部位候选小吃(本部位小吃).forEach((item) => {
        if (!res?.[key]?.includes(item?.小吃名称)) {
          res[key].push(item?.小吃名称)
        }
      })
    })

  const generateCombinationsRes = generateCombinations(res)
  const filterUniqueObjectsRes = filterUniqueObjects(generateCombinationsRes)

  return filterUniqueObjectsRes
}
// 对数据进行排列组合，组合出所有的可能性
function generateCombinations(data) {
  const keys = Object.keys(data).filter((key) => (data[key] || [])?.length > 0)
  const results: any[] = []

  if (!keys.length) {
    return results
  }

  function generate(index, currentCombination) {
    if (index === keys.length) {
      results.push(currentCombination)
      return
    }

    const key = keys[index]
    const values = data[key]

    for (const value of values) {
      generate(index + 1, {
        ...currentCombination,
        [key]: value,
      })
    }
  }

  generate(0, {})
  return results
}

// 对结果进行过滤，当存在计算条件完全一致时，过滤该情况
function filterUniqueObjects(arr) {
  const seen = new Set()
  const result: any[] = []

  for (const obj of arr) {
    // 创建唯一标识：按属性名排序后拼接属性值
    const keys = Object.keys(obj).sort()
    const identifier = keys.map((key) => obj[key]).join('|')

    if (!seen.has(identifier)) {
      seen.add(identifier)
      result.push(obj)
    }
  }

  return result
}
