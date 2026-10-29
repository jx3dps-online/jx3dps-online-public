import {
  大附魔部位枚举,
  装备位置部位枚举,
  装备属性信息模型,
  装备类型枚举,
  选择装备数据类型,
} from '@/@types/装备'
import { 附魔类型 } from '@/@types/附魔'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'
import { 获取附魔分数 } from '../../工具函数/装分计算/工具函数/附魔分数'
import { 获取五行石分数 } from '../../工具函数/装分计算/工具函数/五行石分数'
import { 获取五彩石名称分数 } from '../../工具函数/装分计算/工具函数/五彩石分数'
import { 获取单大附魔分数 } from '../../工具函数/装分计算/工具函数/大附魔分数'
import {
  装备原始装分,
  获取装备精炼装分,
  装备位置部位枚举 as 装分部位枚举,
} from '../../工具函数/装分计算/工具函数/装备分数'
import { 生成装备表单值 } from './候选粗排'

interface 贴分起点入参 {
  初始表单值: Record<string, any>
  装分上限: number
  候选表: Record<string, 装备属性信息模型[]>
  未锁定部位索引: string[]
  /** 部位索引 → 可选小附魔 ID；不参与小附魔时为空 */
  小附魔候选: Record<string, (string | number)[]>
  排除附魔类型: 附魔类型[]
  参与大附魔: boolean
  不使用橙武: boolean
  默认镶嵌宝石等级: number
  让出主线程: () => Promise<void>
  是否取消?: () => boolean
}

interface 部位选项 {
  /** 锁定或无可换装备的部位，保持原值 */
  固定?: boolean
  装备?: 装备属性信息模型
  附魔?: string | number
  镶嵌等级: number[]
  大附魔等级: number
}

const 字长 = 32

const 读取位 = (位集: Uint32Array, 位置: number) =>
  ((位集[Math.floor(位置 / 字长)] >>> (位置 % 字长)) & 1) === 1

// 目标位集 |= 源位集 << 偏移
const 或偏移 = (目标: Uint32Array, 源: Uint32Array, 偏移: number) => {
  const 字偏移 = Math.floor(偏移 / 字长)
  const 位偏移 = 偏移 % 字长
  for (let i = 0; i + 字偏移 < 目标.length; i++) {
    const 值 = 源[i]
    if (!值) continue
    if (位偏移 === 0) {
      目标[i + 字偏移] |= 值
      continue
    }
    目标[i + 字偏移] |= 值 << 位偏移
    if (i + 字偏移 + 1 < 目标.length) {
      目标[i + 字偏移 + 1] |= 值 >>> (字长 - 位偏移)
    }
  }
}

// 与 装备列表装分计算 同口径：原始 + 精炼 + 附魔 + round(镶嵌 + 武器五彩石)
const 装备基础分 = (装备: 装备属性信息模型, 部位名: string, 精炼等级: number) => {
  const 质量 = 装备.装备类型 === 装备类型枚举.橙武 ? '5' : '4'
  const 原始分 = 装备原始装分(装备.装备品级, 质量, 装分部位枚举[部位名])
  return 原始分 + 获取装备精炼装分(原始分, 精炼等级)
}

const 镶嵌原始分 = (等级列表: number[]) =>
  等级列表.reduce((合计, 等级) => 合计 + 获取五行石分数(等级), 0)

/** 镶嵌分数 → 等级列表，同分优先保留 优先等级 */
const 生成镶嵌组合 = (孔数: number, 优先等级: number[], 额外分: number) => {
  let 组合 = new Map<number, number[]>([[0, []]])
  for (let i = 0; i < 孔数; i++) {
    const 新组合 = new Map<number, number[]>()
    组合.forEach((等级列表, 原始分) => {
      for (let 等级 = 0; 等级 <= 8; 等级++) {
        const 分 = 原始分 + 获取五行石分数(等级)
        if (!新组合.has(分)) 新组合.set(分, [...等级列表, 等级])
      }
    })
    组合 = 新组合
  }
  const 结果 = new Map<number, number[]>([[Math.round(镶嵌原始分(优先等级) + 额外分), 优先等级]])
  组合.forEach((等级列表, 原始分) => {
    const 分 = Math.round(原始分 + 额外分)
    if (!结果.has(分)) 结果.set(分, 等级列表)
  })
  return 结果
}

/**
 * 当前装分超出上限时，用位集背包求上限内可达的最大装分及一组配装，作为寻优起点。
 * 加速、套装等约束交给后续局部搜索修正；同分组合优先保留当前装备、附魔与镶嵌。
 */
export const 构造贴分起点 = async (
  入参: 贴分起点入参,
): Promise<Record<string, any> | undefined> => {
  const {
    初始表单值,
    装分上限,
    候选表,
    未锁定部位索引,
    小附魔候选,
    排除附魔类型,
    参与大附魔,
    不使用橙武,
    默认镶嵌宝石等级,
    让出主线程,
    是否取消,
  } = 入参
  const { 装备数据 } = 获取当前数据()
  const 五彩石分 = 获取五彩石名称分数(初始表单值?.五彩石)
  const 部位索引列表 = Object.keys(装备位置部位枚举)
  const 选项表: Map<number, 部位选项>[] = []

  for (const 部位索引 of 部位索引列表) {
    if (是否取消?.()) return undefined
    const 部位名 = 装备位置部位枚举[部位索引]
    const 当前部位值 = 初始表单值?.[部位索引]
    const 当前装备 = 装备数据?.[部位名]?.find((项) => 项?.id === 当前部位值?.id)
    const 大附魔键: string | undefined = 大附魔部位枚举[部位名]
    const 当前大附魔等级 = 大附魔键 ? 初始表单值?.[大附魔键] || 0 : 0
    const 额外分 = 部位名 === '武器' ? 五彩石分 : 0
    const 大附魔分 = (装备: 装备属性信息模型, 等级: number) =>
      大附魔键 && 等级
        ? 获取单大附魔分数(
            大附魔键,
            [{ id: 装备.id, 装备部位: 部位名 } as 选择装备数据类型],
            等级,
          ) || 0
        : 0
    const 选项映射 = new Map<number, 部位选项>()

    const 当前装备可用 = !!当前装备 && !(不使用橙武 && 当前装备.装备类型 === 装备类型枚举.橙武)
    const 候选装备 = 未锁定部位索引.includes(部位索引)
      ? [
          ...(当前装备可用 ? [当前装备 as 装备属性信息模型] : []),
          ...(候选表[部位名] || []).filter((装备) => 装备.id !== 当前装备?.id),
        ]
      : []

    if (!候选装备.length) {
      if (当前装备) {
        const 等级列表 = (当前部位值?.镶嵌孔数组 || []).map((孔) => 孔?.镶嵌宝石等级 || 0)
        const 分 =
          装备基础分(当前装备, 部位名, 当前部位值?.当前精炼等级 || 0) +
          获取附魔分数(当前部位值?.附魔) +
          Math.round(镶嵌原始分(等级列表) + 额外分) +
          大附魔分(当前装备, 当前大附魔等级)
        选项映射.set(分, { 固定: true, 镶嵌等级: 等级列表, 大附魔等级: 当前大附魔等级 })
      } else {
        选项映射.set(0, { 固定: true, 镶嵌等级: [], 大附魔等级: 当前大附魔等级 })
      }
      选项表.push(选项映射)
      continue
    }

    const 当前附魔数据 = 根据附魔ID获取附魔数据(当前部位值?.附魔)
    const 保留当前附魔 = !当前附魔数据 || !排除附魔类型.includes(当前附魔数据.附魔类型)
    const 附魔选项 = 小附魔候选[部位索引]
      ? Array.from(
          new Set([
            ...(保留当前附魔 ? [当前部位值?.附魔] : []),
            ...小附魔候选[部位索引],
            undefined,
          ]),
        )
      : [当前部位值?.附魔]
    const 附魔分表 = 附魔选项.map((附魔) => 获取附魔分数(附魔))
    const 大附魔选项 =
      大附魔键 && 参与大附魔
        ? Array.from(new Set([当前大附魔等级, 当前大附魔等级 || 2, 0]))
        : [当前大附魔等级]

    for (const 装备 of 候选装备) {
      const 部位值 = 生成装备表单值(装备, 当前部位值, 部位索引, 默认镶嵌宝石等级, true)
      const 基础分 = 装备基础分(装备, 部位名, 部位值.当前精炼等级)
      const 优先等级 = (部位值.镶嵌孔数组 || []).map((孔) => 孔?.镶嵌宝石等级 ?? 0)
      const 镶嵌组合 = 生成镶嵌组合(优先等级.length, 优先等级, 额外分)
      附魔选项.forEach((附魔, 附魔序号) => {
        镶嵌组合.forEach((镶嵌等级, 镶嵌分) => {
          大附魔选项.forEach((大附魔等级) => {
            const 分 = 基础分 + 附魔分表[附魔序号] + 镶嵌分 + 大附魔分(装备, 大附魔等级)
            if (分 <= 装分上限 && !选项映射.has(分)) {
              选项映射.set(分, { 装备, 附魔, 镶嵌等级, 大附魔等级 })
            }
          })
        })
      })
      await 让出主线程()
    }
    if (!选项映射.size) return undefined
    选项表.push(选项映射)
  }

  const 字数 = Math.floor(装分上限 / 字长) + 2
  const 快照: Uint32Array[] = [new Uint32Array(字数)]
  快照[0][0] = 1
  for (const 选项映射 of 选项表) {
    if (是否取消?.()) return undefined
    const 上一位集 = 快照[快照.length - 1]
    const 下一位集 = new Uint32Array(字数)
    for (const 分 of 选项映射.keys()) {
      if (分 <= 装分上限) 或偏移(下一位集, 上一位集, 分)
      await 让出主线程()
    }
    快照.push(下一位集)
  }

  const 最终位集 = 快照[快照.length - 1]
  let 剩余 = 装分上限
  while (剩余 >= 0 && !读取位(最终位集, 剩余)) 剩余--
  if (剩余 < 0) return undefined

  const 起点表单值: Record<string, any> = { ...初始表单值 }
  for (let i = 部位索引列表.length - 1; i >= 0; i--) {
    const 部位索引 = 部位索引列表[i]
    const 部位名 = 装备位置部位枚举[部位索引]
    let 选中: [number, 部位选项] | undefined
    for (const 项 of 选项表[i]) {
      if (项[0] <= 剩余 && 读取位(快照[i], 剩余 - 项[0])) {
        选中 = 项
        break
      }
    }
    if (!选中) return undefined
    const [分, 选项] = 选中
    剩余 -= 分
    if (选项.固定 || !选项.装备) continue
    const 部位值 = 生成装备表单值(
      选项.装备,
      初始表单值?.[部位索引],
      部位索引,
      默认镶嵌宝石等级,
      true,
    )
    起点表单值[部位索引] = {
      ...部位值,
      附魔: 选项.附魔,
      镶嵌孔数组: (部位值.镶嵌孔数组 || []).map((孔, 孔序号) => ({
        ...孔,
        镶嵌宝石等级: 选项.镶嵌等级[孔序号],
      })),
    }
    const 大附魔键: string | undefined = 大附魔部位枚举[部位名]
    if (大附魔键) 起点表单值[大附魔键] = 选项.大附魔等级
  }
  return 起点表单值
}
