import { 角色基础属性类型 } from '@/@types/角色'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 基础属性计算 } from '../../工具函数/根据装备信息获取基础属性'
import { 装备位置部位枚举 } from '@/@types/装备'

const { 附魔 } = 获取当前数据()

export const 修改装备属性 = (装备基础属性: 角色基础属性类型, 当前附魔数据) => {
  let 计算后属性 = { ...装备基础属性 }
  Object.keys(当前附魔数据).forEach((key) => {
    const 当前附魔 = 当前附魔数据[key]
    const 附魔属性 = Object.keys(当前附魔)?.[0]
    const 附魔值 = Object.values(当前附魔)?.[0]
    const 当前附魔属性 = 附魔?.find((item) => item?.附魔名称 === `${附魔属性}+${附魔值}`)
    当前附魔属性?.增益集合?.forEach((增益) => {
      计算后属性 = 基础属性计算(增益, 计算后属性)
    })
  })
  return 计算后属性
}

export const 初始化所有组合 = (计算部位, 过滤挑战附魔) => {
  const res = {}
  // 先找出该装备部位支持的同种类的最大数值的附魔
  Object.keys(装备位置部位枚举)
    .filter((key) => 计算部位?.includes(key))
    .forEach((key) => {
      附魔?.forEach((item) => {
        if (过滤挑战附魔 && item?.挑战附魔) {
          return
        }
        if (item?.附魔支持部位?.includes(装备位置部位枚举[key] as any)) {
          // const 部位表单key = `${EquipmentCharacterPositionEnum[key]}${key}`
          const 附魔类型 = item?.附魔名称?.split('+')?.[0]
          if (!item?.附魔名称?.includes('体质') && !item?.附魔名称?.includes('气血')) {
            const 分割字符 = item?.附魔名称?.split('+')?.[1]
            const 附魔数值 = +分割字符?.split('_')?.[0] || 0
            if (!res?.[key]?.[附魔类型] || res[key][附魔类型] < 附魔数值) {
              res[key] = {
                ...res[key],
                [附魔类型]: 附魔数值,
              }
            }
          }
        }
      })
    })

  // 先找出该装备部位支持的同种类的最大数值的附魔
  const generateCombinationsRes = generateCombinations(res)
  const filterUniqueObjectsRes = filterUniqueObjects(generateCombinationsRes)

  return filterUniqueObjectsRes
}

// 对数据进行排列组合，组合出所有的可能性
function generateCombinations(data) {
  const keys = Object.keys(data)
  const results: any = []

  function generate(index, currentCombination) {
    if (index === keys.length) {
      results.push(currentCombination)
      return
    }

    const currentItem = data[keys[index]]

    Object.keys(currentItem).forEach((attr) => {
      generate(index + 1, {
        ...currentCombination,
        [keys[index]]: { [attr]: currentItem[attr] },
      })
    })
  }

  generate(0, {})

  return results
}

// 对结果进行过滤，当存在计算条件完全一致时，过滤该情况
function filterUniqueObjects(arr) {
  const uniqueObjects: any = []

  const stringifyObject = (obj) =>
    JSON.stringify(
      Object.values(obj)
        .map((item) => {
          const firstKey = Object.keys(item as any)?.[0]
          return `${firstKey}+${item?.[firstKey]}`
        })
        .sort()
    )

  const seen = new Set()

  for (const obj of arr) {
    const stringified = stringifyObject(obj)

    if (!seen.has(stringified)) {
      seen.add(stringified)
      uniqueObjects.push(obj)
    }
  }

  return uniqueObjects
}
