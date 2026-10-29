import { 属性简写枚举 } from '@/@types/枚举'
import { 角色基础属性类型 } from '@/@types/角色'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export const 获取当前各属性最大附魔 = (附魔 = 获取当前数据().附魔) => {
  const res = {}
  附魔?.forEach((item) => {
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

  return resList
}

// 会效当前没有附魔，收益图按会心的附魔数值补入
export const 获取附魔收益列表 = (附魔 = 获取当前数据().附魔) => {
  const 收益列表 = 获取当前各属性最大附魔(附魔)
  const 会心附魔值 = 收益列表.find((item) => item.收益 === '会心')?.值

  return [...收益列表, { 收益: '会效', 值: 会心附魔值 }]
}

export const 获取单点属性收益列表 = (主属性 = 获取当前数据().主属性) => {
  const mapKeyList = [主属性, '攻击', '武伤', '无双', '破防', '会心', '会效']
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
