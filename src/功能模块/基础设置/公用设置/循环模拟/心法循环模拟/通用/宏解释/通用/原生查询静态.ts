import type { 查询字段 } from './原生查询副本'

interface 静态字段 {
  描述: PropertyDescriptor
  内容: unknown
  get: () => unknown
  set?: (内容: unknown) => void
}

interface 查询上下文 {
  字段: WeakMap<
    object,
    { 基线: ReadonlyMap<PropertyKey, unknown>; 改动?: Map<PropertyKey, unknown> }
  >
  包装: (内容: unknown) => unknown
}

const 静态类 = new WeakMap<object, Map<PropertyKey, 静态字段>>()
const 基线缓存 = new WeakMap<readonly 查询字段[], ReadonlyMap<PropertyKey, unknown>>()
const 忽略 = new Set<PropertyKey>(['prototype', 'name', 'length', 'arguments', 'caller'])
let 当前查询: 查询上下文 | undefined

// 一个计算 Worker 中只安装一次。实际执行仍读写原值，资格查询读写独立字段表。
const 安装静态字段 = (类: object) => {
  let 字段 = 静态类.get(类)
  const 原字段 = Reflect.ownKeys(类).filter((键) => !忽略.has(键))
  const 描述 = 原字段.map((键) => Object.getOwnPropertyDescriptor(类, 键)!)
  if (
    描述.some((项, i) => {
      const 已有 = 字段?.get(原字段[i])
      return (
        (!已有 || 项.get !== 已有.get || 项.set !== 已有.set) &&
        (!('value' in 项) || !项.configurable)
      )
    })
  )
    return undefined
  const 首次 = !字段
  let 已变化 = false
  if (!字段) {
    字段 = new Map()
    静态类.set(类, 字段)
  }
  for (const 键 of 字段.keys())
    if (!原字段.some((项) => 项 === 键)) {
      字段.delete(键)
      已变化 = true
    }
  for (let i = 0; i < 原字段.length; i++) {
    const 键 = 原字段[i]
    const 已有 = 字段.get(键)
    if (已有 && 描述[i].get === 已有.get && 描述[i].set === 已有.set) continue
    已变化 = true
    const 项: 静态字段 = {
      描述: 描述[i],
      内容: 描述[i].value,
      get: () => {
        const 状态 = 当前查询?.字段.get(类)
        return 状态
          ? 当前查询!.包装(状态.改动?.has(键) ? 状态.改动.get(键) : 状态.基线.get(键))
          : 项.内容
      },
    }
    if (描述[i].writable)
      项.set = (内容) => {
        const 状态 = 当前查询?.字段.get(类)
        if (状态) (状态.改动 ??= new Map()).set(键, 内容)
        else 项.内容 = 内容
      }
    字段.set(键, 项)
    Object.defineProperty(类, 键, {
      configurable: true,
      enumerable: 描述[i].enumerable,
      get: 项.get,
      set: 项.set,
    })
  }
  return { 字段, 支持: 首次 || !已变化 }
}

// 快照保留数据属性的原标志和值，不能把查询访问器本身当作游戏状态保存。
export const 读取查询静态描述 = (类: object, 键: PropertyKey) => {
  if (typeof 类 !== 'function') return undefined
  const 项 = 静态类.get(类)?.get(键)
  if (!项 || Object.getOwnPropertyDescriptor(类, 键)?.get !== 项.get) return undefined
  return { ...项.描述, value: 项.get() }
}

export const 恢复查询静态字段 = (类: object, 键: PropertyKey, 内容: unknown) => {
  if (typeof 类 !== 'function') return false
  const 项 = 静态类.get(类)?.get(键)
  if (!项 || Object.getOwnPropertyDescriptor(类, 键)?.get !== 项.get) return false
  const 状态 = 当前查询?.字段.get(类)
  if (状态) (状态.改动 ??= new Map()).set(键, 内容)
  else 项.内容 = 内容
  return true
}

// 查询内部的网络两分支只保存已改动的标量表，对象写入由副本检查点撤销。
export const 创建静态查询检查点 = (类列表: ReadonlySet<object>) => {
  if (!当前查询) return undefined
  const 字段 = [...类列表].flatMap((类) => {
    const 状态 = 当前查询?.字段.get(类)
    return 状态 ? [{ 状态, 改动: 状态.改动 && new Map(状态.改动) }] : []
  })
  return () => {
    for (const { 状态, 改动 } of 字段) 状态.改动 = 改动 && new Map(改动)
  }
}

export const 执行隔离静态查询 = <T>(
  类列表: ReadonlySet<object>,
  读取字段: (类: object) => readonly 查询字段[],
  包装: (内容: unknown) => unknown,
  执行: () => T,
): { 支持: true; 结果: T } | { 支持: false } => {
  const 状态: 查询上下文 = { 字段: new WeakMap(), 包装 }
  for (const 类 of 类列表) {
    const 安装 = 安装静态字段(类)
    if (!安装?.支持) return { 支持: false }
    const 字段 = 安装.字段
    const 已存字段 = 读取字段(类)
    let 基线 = 基线缓存.get(已存字段)
    if (!基线) {
      基线 = new Map(已存字段.filter((项) => !忽略.has(项.键)).map((项) => [项.键, 项.内容]))
      基线缓存.set(已存字段, 基线)
    }
    const 当前键 = Reflect.ownKeys(类).filter((键) => !忽略.has(键))
    if (
      基线.size !== 字段.size ||
      当前键.length !== 字段.size ||
      [...基线.keys()].some((键) => !字段.has(键)) ||
      当前键.some((键) => !字段.has(键))
    )
      return { 支持: false }
    状态.字段.set(类, { 基线 })
  }
  const 父查询 = 当前查询
  当前查询 = 状态
  let 结果: T
  let 支持 = true
  try {
    结果 = 执行()
  } finally {
    当前查询 = 父查询
    for (const 类 of 类列表) {
      const 字段 = 静态类.get(类)!
      for (const 键 of Reflect.ownKeys(类))
        if (!忽略.has(键) && !字段.has(键)) {
          支持 = false
          Reflect.deleteProperty(类, 键)
        }
      for (const [键, 项] of 字段) {
        const 描述 = Object.getOwnPropertyDescriptor(类, 键)
        if (描述?.get !== 项.get || 描述?.set !== 项.set) {
          支持 = false
          Object.defineProperty(类, 键, {
            configurable: true,
            enumerable: 项.描述.enumerable,
            get: 项.get,
            set: 项.set,
          })
        }
      }
    }
  }
  return 支持 ? { 支持: true, 结果 } : { 支持: false }
}
