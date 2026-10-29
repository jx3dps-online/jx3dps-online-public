import { 附魔数据类型 } from '@/@types/附魔'
import { 属性类型 } from '@/@types/属性'
import { 装备位置部位枚举 } from '@/@types/装备'

export type 附魔组合 = Record<string, number>

const 增益向量 = (item: 附魔数据类型) => {
  const result: Record<string, number> = {}
  item.增益集合.forEach(({ 属性, 值 }) => {
    result[属性] = (result[属性] || 0) + 值
  })
  return result
}

// 当前源均为正值单属性。相同属性集合才作逐属性支配剪枝，避免混合属性被截断。
const 获取部位候选 = (list: 附魔数据类型[]) => {
  const candidates: Array<{ item: 附魔数据类型; gains: Record<string, number>; shape: string }> = []
  for (const item of [...list].sort((a, b) => a.id - b.id)) {
    const gains = 增益向量(item)
    const attrs = Object.keys(gains).sort()
    const shape = attrs.join('|')
    if (
      candidates.some(
        (c) => c.shape === shape && attrs.every((attr) => c.gains[attr] >= gains[attr]),
      )
    )
      continue
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (
        candidates[i].shape === shape &&
        attrs.every((attr) => gains[attr] >= candidates[i].gains[attr])
      )
        candidates.splice(i, 1)
    }
    candidates.push({ item, gains, shape })
  }
  return candidates
}

export const 生成附魔组合 = (
  附魔: 附魔数据类型[],
  计算部位: string[],
  过滤精品及挑战附魔 = false,
): 附魔组合[] => {
  let states = [{ 分配: {} as 附魔组合, 增益: {} as Record<string, number> }]
  for (const key of Object.keys(装备位置部位枚举).filter((part) => 计算部位.includes(part))) {
    const 部位 = 装备位置部位枚举[key]
    const candidates = 获取部位候选(
      附魔.filter(
        (item) =>
          (!过滤精品及挑战附魔 || !['精', '挑'].includes(item.附魔类型)) &&
          item.附魔支持部位.includes(部位) &&
          !item.增益集合.some((gain) =>
            [属性类型.体质, 属性类型.基础气血上限, 属性类型.额外气血上限].includes(gain.属性),
          ),
      ),
    )
    if (!candidates.length) continue
    const next = new Map<string, (typeof states)[number]>()
    for (const state of states) {
      for (const candidate of candidates) {
        const gains = { ...state.增益 }
        Object.entries(candidate.gains).forEach(([attr, value]) => {
          gains[attr] = (gains[attr] || 0) + value
        })
        const signature = JSON.stringify(
          Object.keys(gains)
            .sort()
            .map((attr) => [attr, gains[attr]]),
        )
        if (!next.has(signature))
          next.set(signature, { 分配: { ...state.分配, [key]: candidate.item.id }, 增益: gains })
      }
    }
    states = [...next.values()]
  }
  return states.map((state) => state.分配)
}

export const 生成加速附魔模型 = (
  附魔: 附魔数据类型[],
  包含低级: boolean,
  锁定部位: string[] = [],
  过滤精品及挑战附魔 = false,
) => {
  let states = [{ 分配: {} as 附魔组合, 值: 0, 标签: [] as string[] }]
  for (const key of ['_1', '_6', '_11']) {
    const 部位 = 装备位置部位枚举[key]
    if (锁定部位.includes(部位)) continue
    let candidates = 附魔.filter(
      (item) =>
        (!过滤精品及挑战附魔 || !['精', '挑'].includes(item.附魔类型)) &&
        item.附魔支持部位.includes(部位) &&
        item.增益集合.length === 1 &&
        item.增益集合[0].属性 === 属性类型.加速等级,
    )
    candidates = [...new Map(candidates.map((item) => [item.增益集合[0].值, item])).values()].sort(
      (a, b) => b.增益集合[0].值 - a.增益集合[0].值 || a.id - b.id,
    )
    if (!包含低级) candidates = candidates.slice(0, 1)
    const next = new Map<number, (typeof states)[number]>()
    for (const state of states) {
      if (!next.has(state.值)) next.set(state.值, state)
      for (const item of candidates) {
        const 值 = state.值 + item.增益集合[0].值
        if (!next.has(值))
          next.set(值, {
            分配: { ...state.分配, [key]: item.id },
            值,
            标签: [...state.标签, `${部位}：${item.附魔效果简写}（${item.附魔类型}）`],
          })
      }
    }
    states = [...next.values()]
  }
  return states
    .filter((state) => state.值 > 0)
    .map((state) => ({
      id: `附魔_${Object.values(state.分配).join('_')}`,
      label: state.标签.join('、'),
      value: state.值,
      type: '附魔',
      附魔分配: state.分配,
    }))
}
