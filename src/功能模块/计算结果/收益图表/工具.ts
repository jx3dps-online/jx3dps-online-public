import { 属性简写枚举 } from '@/@types/枚举'
import { 角色基础属性类型 } from '@/@types/角色'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export const 获取当前各属性最大附魔 = () => {
  const { 附魔 } = 获取当前数据()
  const res = {}
  附魔?.forEach((item) => {
    if (item?.挑战附魔 || item?.阆风仙玉) {
      return
    }
    const 附魔属性 = item?.增益集合?.[0]?.属性 || ''
    const 附魔数值 = item?.增益集合?.[0]?.值 || 0
    const 附魔简写 = 属性简写枚举[附魔属性]
    if (!res?.[附魔简写] || res[附魔简写] < 附魔数值) {
      res[附魔简写] = 附魔数值
    }
  })
  const resList = Object.keys(res)
    .filter((item) => !['加速', '体质', '气血']?.includes(item))
    .map((key) => {
      return {
        收益: key,
        值: res[key],
      }
    })

  // if (计算全能) {
  //   const 无双数据 = resList?.find((item) => item?.收益 === '无双')?.值
  //   resList.push({
  //     收益: '全能',
  //     值: Math.floor(无双数据 / 2),
  //   })
  // }

  return resList
}

export const 获取单点属性收益列表 = () => {
  const { 主属性 } = 获取当前数据()

  const mapKeyList = [主属性, '攻击', '武伤', '无双', '破防', '会心', '会效', '破招']
  return mapKeyList.map((key) => {
    return {
      收益: key,
      值: 10,
    }
  })
}

export const 收益增益属性计算 = (
  属性: string,
  值,
  角色最终属性: 角色基础属性类型,
): 角色基础属性类型 => {
  const { 主属性 } = 获取当前数据()

  const 最终属性 = { ...角色最终属性 }
  switch (属性) {
    case 主属性:
      最终属性[主属性] += 值
      break
    case '攻击':
      最终属性.基础攻击 += 值
      break
    case '会心':
      最终属性.会心等级 += 值
      break
    case '会效':
      最终属性.会心效果等级 += 值
      break
    case '破防':
      最终属性.破防等级 += 值
      break
    case '无双':
      最终属性.无双等级 += 值
      break
    case '破招':
      最终属性.破招值 += 值
      break
    case '全能':
      最终属性.全能等级 += 值
      break
    case '武伤':
      最终属性.武器伤害_最小值 += 值
      最终属性.武器伤害_最大值 += 值
      break
    case '加速':
      最终属性.加速等级 += 值
      break
  }
  return 最终属性
}

export const 找到最大最小值 = (data) => {
  let maxValue = undefined
  let minValue = undefined
  let maxObj: any = null
  let minObj: any = null
  for (const d of data) {
    if (!maxValue || d.收益 > maxValue) {
      maxValue = d.收益
      maxObj = d
    }
    if (!minValue || d.收益 < minValue) {
      minValue = d.收益
      minObj = d
    }
  }
  return { max: maxObj || {}, min: minObj || {} }
}

export const 找到收益下降点 = (data) => {
  const diffList: number[] = []
  let targetObj: any = undefined
  for (let i = 0; i <= data?.length; i++) {
    if (i !== 0 && i >= 20) {
      const currentData = data[i]?.收益 || 0
      const preData = data[i - 1]?.收益 || 0
      const diff = +(currentData - preData || 0)?.toFixed(0)
      diffList[i] = diff
      if (diffList[i - 1]) {
        if (diff < diffList[i - 1] && diff / diffList[i - 1] < 0.7) {
          targetObj = data[i]
          break
        }
      }
    }
  }
  return targetObj
}

export const 获取当前比例 = (类型, 装备基础属性: 角色基础属性类型): number => {
  if (类型 === '会破比') {
    const 当前会心等级 = 装备基础属性?.会心等级
    const 当前破防等级 = 装备基础属性?.破防等级
    return Math.round((当前会心等级 / (当前破防等级 + 当前会心等级)) * 100)
  } else if (类型 === '招无比') {
    const 当前破招值 = 装备基础属性?.破招值
    const 当前无双等级 = 装备基础属性?.无双等级
    return Math.round((当前破招值 / (当前无双等级 + 当前破招值)) * 100)
  } else {
    return 0
  }
}
