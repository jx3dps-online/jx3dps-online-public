import { 装备信息数据类型 } from '@/@types/装备'
import { 对比结果条目 } from '@/@types/配装指导'
import { 秒伤计算 } from '@/计算模块/计算函数'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import { 内容缓存 } from '@/工具函数/cache'
import { 创建时间片让出器, 字符串哈希 } from '@/工具函数/help'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export interface 候选装备信息 {
  id: string
  装备信息: 装备信息数据类型
}

export const 格式化收益文本 = (
  dpsUp: number,
  dpsPercent: number,
  对比显示百分比: boolean,
): string => {
  const 前缀 = dpsUp > 0 ? '+' : ''
  if (对比显示百分比 && Math.abs(dpsPercent) >= 0.01) {
    return `${前缀}${dpsPercent.toFixed(2)}%`
  }
  return `${前缀}${dpsUp}`
}

const 属性差字段映射 = [
  ['攻击', '基础攻击'],
  ['会心', '会心等级'],
  ['会效', '会心效果等级'],
  ['破防', '破防等级'],
  ['无双', '无双等级'],
  ['加速', '加速等级'],
  ['全能', '全能等级'],
  ['装分', '装分'],
]

const 计算属性差 = (旧基础属性, 新基础属性, 主属性: string): Record<string, number> => {
  const 结果: Record<string, number> = {}
  const 字段映射 = [...属性差字段映射, ['主属性', 主属性]]
  字段映射.forEach(([显示名, 字段名]) => {
    const 差值 = (新基础属性?.[字段名] || 0) - (旧基础属性?.[字段名] || 0)
    if (差值) {
      结果[显示名] = 差值
    }
  })
  const 武伤差 = (新基础属性?.武器伤害_最大值 || 0) - (旧基础属性?.武器伤害_最大值 || 0)
  if (武伤差) {
    结果['武伤'] = 武伤差
  }
  return 结果
}

const 计算秒伤 = (装备信息: 装备信息数据类型, dispatch, 循环覆盖?: 计算循环覆盖类型): number => {
  try {
    const 结果 = dispatch(秒伤计算({ 更新装备信息: 装备信息, ...循环覆盖, 计算技能详情: false }))
    return 结果?.秒伤 || 0
  } catch {
    return 0
  }
}

/** 装备信息中决定秒伤的部分：装备列表关键字段 + 五彩石 + 最终装备增益（含大附魔/特效） */
const 装备信息签名 = (装备信息: 装备信息数据类型): string => {
  return JSON.stringify({
    列表: (装备信息?.装备列表 || []).map((装备) => ({
      id: 装备?.id,
      附魔: 装备?.附魔,
      精炼: 装备?.当前精炼等级,
      镶嵌: 装备?.镶嵌孔数组?.map((孔) => 孔?.镶嵌宝石等级),
      部位: 装备?.装备部位,
    })),
    五彩石: 装备信息?.五彩石,
    装备增益: 装备信息?.装备增益,
  })
}

/** 秒伤计算依赖的 Redux 上下文签名：任一依赖变化即视为新 key，自然失效旧缓存 */
const 获取上下文签名 = (dispatch): string => {
  try {
    const state = dispatch((_dispatch, getState) => getState())
    const data = state?.data || {}
    // 自定义循环列表等内容可能很大，哈希成短串作为缓存 key 前缀
    return 字符串哈希(
      JSON.stringify({
        循环: data?.当前计算循环名称,
        自定义循环列表: data?.自定义循环列表,
        奇穴: data?.当前奇穴信息,
        秘籍: data?.当前秘籍信息,
        增益启用: data?.增益启用,
        增益数据: data?.增益数据,
        团队增益轴: data?.团队增益轴,
        网络延迟: data?.网络延迟,
        目标: data?.当前输出计算目标名称,
      }),
    )
  } catch {
    // 取不到 state 时用时间戳保证本次调用不命中缓存
    return `不可缓存_${Date.now()}`
  }
}

const 缓存计算秒伤: (
  装备信息: 装备信息数据类型,
  dispatch: any,
  上下文签名: string,
  循环覆盖?: 计算循环覆盖类型,
) => number = 内容缓存(
  // 上下文签名只用于缓存键；必须显式跳过第三参，将第四参交给秒伤引擎。
  (装备信息: 装备信息数据类型, dispatch, _上下文签名: string, 循环覆盖?: 计算循环覆盖类型) =>
    计算秒伤(装备信息, dispatch, 循环覆盖),
  {
    keyFn: (装备信息, _dispatch, 上下文签名, 循环覆盖) =>
      `${上下文签名}|${JSON.stringify(循环覆盖 || null)}|${装备信息签名(装备信息)}`,
    maxSize: 600,
  },
)

export const 计算候选收益 = async (入参: {
  当前装备信息: 装备信息数据类型
  候选装备信息列表: 候选装备信息[]
  dispatch: any
  旧秒伤兜底?: number
  循环覆盖?: 计算循环覆盖类型
}): Promise<对比结果条目[]> => {
  const { 当前装备信息, 候选装备信息列表, dispatch, 旧秒伤兜底 = 0, 循环覆盖 } = 入参
  const { 主属性 } = 获取当前数据()
  const 上下文签名 = 获取上下文签名(dispatch)
  const 让出主线程 = 创建时间片让出器()
  const 旧秒伤 = 缓存计算秒伤(当前装备信息, dispatch, 上下文签名, 循环覆盖) || 旧秒伤兜底
  const 旧基础属性 = 当前装备信息?.装备基础属性

  const 结果列表: 对比结果条目[] = []
  for (const { id, 装备信息 } of 候选装备信息列表) {
    await 让出主线程()
    const 新秒伤 = 缓存计算秒伤(装备信息, dispatch, 上下文签名, 循环覆盖)
    const 加速不匹配 = !新秒伤
    const 秒伤差异 = 新秒伤 ? 新秒伤 - 旧秒伤 : 0
    const dpsPercent = 新秒伤 && 旧秒伤 ? (秒伤差异 / 旧秒伤) * 100 : 0
    const 属性差 = 计算属性差(旧基础属性, 装备信息?.装备基础属性, 主属性)
    结果列表.push({
      id,
      dpsUp: 秒伤差异,
      dpsPercent,
      属性差,
      装分差: 属性差?.装分 || 0,
      加速不匹配,
      已收藏: false,
    })
  }
  return 结果列表
}
