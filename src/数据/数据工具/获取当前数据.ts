import { 获取心法数据, 应用心法外观 } from '@/心法模块/模块工具/获取心法数据'
import { 数据类型 } from '@/@types/数据'
import { 获取团队增益数据 } from '../团队增益'
import 小药小吃数据 from '../小药小吃'
import 五彩石数据 from '../五彩石'
import { 获取当前心法阵眼 } from '../阵眼'
import { 获取当前心法对应镶嵌孔数据 } from '../镶嵌孔/工具'
import { 获取附魔数据 } from '../附魔/查询'
import { 获取当前心法对应的装备数据 } from '../装备'
import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import 装备增益数据 from '../装备/装备增益数据'

// 按心法名索引的数据缓存（替代单槽 缓存数据）
const 心法数据缓存 = new Map<string, 数据类型>()
const 加载任务 = new Map<string, Promise<数据类型>>()

const 已加载心法数据 = new WeakSet<数据类型>()

// 当前心法名（替代 window.心法 全局状态）
let 当前心法名: string | undefined = undefined

let 当前计算数据: 数据类型 | undefined

export const 获取当前心法名 = () => 当前计算数据?.名称 || 当前心法名

// 动态作用域仅覆盖本次同步调用；异步加载、调度和 UI 更新必须在作用域外完成。
export const 在指定心法数据下执行 = <T>(
  心法数据: 数据类型,
  执行: () => T extends PromiseLike<unknown> ? never : T,
): T => {
  if (!已加载心法数据.has(心法数据)) {
    throw new Error('局部计算必须使用已加载的原始心法数据。')
  }
  const 上级计算数据 = 当前计算数据
  当前计算数据 = 心法数据
  try {
    return 执行()
  } finally {
    当前计算数据 = 上级计算数据
  }
}

const 装配心法数据 = async (心法名: string): Promise<数据类型> => {
  const 心法数据 = await 获取心法数据(心法名)
  const 功法 = 心法数据?.功法
  const 部分数据功法 = 功法
  const 装备数据 = await 获取当前心法对应的装备数据(功法, 心法数据)

  const 结果数据: 数据类型 = {
    ...心法数据,
    团队增益: 获取团队增益数据(部分数据功法, 心法数据?.名称),
    阵眼: 获取当前心法阵眼(心法数据, 部分数据功法),
    小药小吃: 小药小吃数据?.[部分数据功法] || [],
    装备数据,
    装备增益数据,
    镶嵌孔: 获取当前心法对应镶嵌孔数据(功法, 心法数据?.主属性),
    五彩石: 五彩石数据?.[部分数据功法] || [],
    附魔: 获取附魔数据(功法, 心法数据?.主属性),
    缓存映射: 获取缓存映射(心法数据?.名称),
    覆盖率: { 套装会心会效: 0.6, ...心法数据?.覆盖率 },
  }

  已加载心法数据.add(结果数据)
  心法数据缓存.set(心法名, 结果数据)
  return 结果数据
}

// 幂等加载：确保某心法已加载，并返回其完整数据
export const 确保心法数据已加载 = (心法名: string): Promise<数据类型> => {
  const 已有 = 心法数据缓存.get(心法名)
  if (已有) return Promise.resolve(已有)
  const 正在加载 = 加载任务.get(心法名)
  if (正在加载) return 正在加载
  const 任务 = 装配心法数据(心法名).finally(() => 加载任务.delete(心法名))
  加载任务.set(心法名, 任务)
  return 任务
}

// web 初始化入口：按心法名加载 → 设置当前心法 + 外观
export const 初始化心法数据 = async (心法名: string) => {
  const 数据 = await 确保心法数据已加载(心法名)
  当前心法名 = 心法名
  应用心法外观(数据)
  return 数据
}

// 只读访问器：仅返回已加载的心法数据，不触发加载。
// 无参调用依赖「当前心法名」（由 初始化心法数据 设置）；未初始化时返回空对象，调用方以 ?./默认值兜底。
const 获取当前数据 = (心法名?: string): 数据类型 => {
  if (!心法名 && 当前计算数据) return 当前计算数据
  const 目标 = 心法名 || 当前心法名
  if (目标) {
    const 命中 = 心法数据缓存.get(目标)
    if (命中) return 命中
  }
  return {} as any
}

export default 获取当前数据
