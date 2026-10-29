import type { 原生模拟器, 原生读条记录, 原生特殊规则 } from './类型'
import { 创建原生查询副本, 查询只读数据, type 查询字段 } from './原生查询副本'
import { 读取查询静态描述, 恢复查询静态字段 } from './原生查询静态'

export interface 原生快照 {
  (): void
  查询: <T>(执行: (模拟: 原生模拟器) => T) => { 支持: true; 结果: T } | { 支持: false }
}

export interface 原生复演缓存 {
  创建: () => 原生模拟器
  版本: number
  局部有效技能索引?: boolean
  释放计划依赖后续技能?: 原生特殊规则['释放计划依赖后续技能']
  历史?: NonNullable<原生复演缓存['记录']>[]
  记录?: {
    模拟: 原生模拟器
    前缀: string[]
    等待前缀: (number | undefined)[]
    未来: Map<number, string>
    随机: number[]
    引导记录: 原生读条记录
    恢复: 原生快照
  }
}

type 快照字段 = 查询字段

interface 快照字段结构 {
  键: PropertyKey[]
  键集合: ReadonlySet<PropertyKey>
  普通: boolean[]
  字段: (快照字段 | undefined)[]
}

const 字段结构 = new WeakMap<object, 快照字段结构>()
const 只读数据 = 查询只读数据

// 仅登记模块自己复制并逐层冻结的配置；浅冻结或未知容器仍走完整快照。
export const 复制快照只读数据 = <T>(数据: T): T => {
  const 副本 = structuredClone(数据)
  const 冻结 = (值: unknown): boolean => {
    if (值 === null || typeof 值 !== 'object') return typeof 值 !== 'function'
    if (只读数据.has(值)) return true
    const 原型 = Object.getPrototypeOf(值)
    if (原型 !== Object.prototype && 原型 !== Array.prototype && 原型 !== null) return false
    if (!Object.values(值).every(冻结)) return false
    Object.freeze(值)
    只读数据.add(值)
    return true
  }
  冻结(副本)
  return 副本
}

// 原模拟器的数据属性使用赋值更新；复用字段结构，仍保存全部状态和类的静态数据。
export const 创建原生快照 = (模拟: object, 忽略: Map<object, Set<PropertyKey>>) => {
  const 对象 = new Set<object>()
  const 节点: {
    值: object
    键: ReadonlySet<PropertyKey>
    字段: 快照字段[]
  }[] = []
  const 集合: (() => void)[] = []
  const 历史查询 = new WeakMap<object, unknown[]>()
  const 原生类 = new Set([Object, Array, Map, Set, Date, Function])
  const 保存 = (值: unknown) => {
    if (
      值 === null ||
      (typeof 值 !== 'object' && typeof 值 !== 'function') ||
      对象.has(值) ||
      只读数据.has(值)
    )
      return
    对象.add(值)
    const 键列表 = Reflect.ownKeys(值)
    let 结构 = 字段结构.get(值)
    if (!结构 || 结构.键.length !== 键列表.length || 结构.键.some((键, i) => 键 !== 键列表[i])) {
      结构 = {
        键: 键列表,
        键集合: new Set(键列表),
        字段: [],
        普通: 键列表.map((键) => {
          const 项 = 读取查询静态描述(值, 键) || Object.getOwnPropertyDescriptor(值, 键)!
          return 'value' in 项 && !!项.writable && !!项.enumerable && !!项.configurable
        }),
      }
      字段结构.set(值, 结构)
    }
    if (typeof 值 === 'function')
      忽略.set(值, new Set([...(忽略.get(值) || []), 'prototype', 'name', 'length']))
    const 排除 = 忽略.get(值)
    const 字段: 快照字段[] = []
    for (let i = 0; i < 键列表.length; i++) {
      const 键 = 键列表[i]
      if (排除?.has(键)) continue
      const 描述 = 结构.普通[i]
        ? undefined
        : 读取查询静态描述(值, 键) || Object.getOwnPropertyDescriptor(值, 键)!
      const 内容 = 描述 ? 描述.value : (值 as Record<PropertyKey, unknown>)[键]
      // 字段记录只读共享；引用未变的子对象仍递归保存，旧快照不随缓存更新。
      const 已存 = 结构.字段[i]
      const 当前 =
        已存 && !描述 && !已存.描述 && Object.is(已存.内容, 内容) ? 已存 : { 键, 内容, 描述 }
      结构.字段[i] = 当前
      字段.push(当前)
      if (
        (键 === '战斗日志' || 键 === '技能释放记录') &&
        (值 === 模拟 || typeof (值 as Partial<原生模拟器>).模拟 === 'function')
      ) {
        const 历史 = 内容 as unknown[]
        const 条目 = [...历史]
        历史查询.set(历史, 条目)
        集合.push(() => {
          // 原日志只追加新条目；共同前缀仍在时只截短尾部。
          const 前缀相同 = !条目.length || 历史[条目.length - 1] === 条目[条目.length - 1]
          历史.length = 条目.length
          if (!前缀相同) for (let j = 0; j < 条目.length; j++) 历史[j] = 条目[j]
        })
      } else if (!描述 || 'value' in 描述) {
        if (typeof 内容 !== 'function') 保存(内容)
      }
    }
    if (值 instanceof Map) {
      const 项 = [...值]
      for (const [键, 内容] of 项) {
        保存(键)
        保存(内容)
      }
      集合.push(() => {
        值.clear()
        for (const [键, 内容] of 项) 值.set(键, 内容)
      })
    } else if (值 instanceof Set) {
      const 项 = [...值]
      项.forEach(保存)
      集合.push(() => {
        值.clear()
        项.forEach((内容) => 值.add(内容))
      })
    } else if (值 instanceof Date) {
      const 时间 = 值.getTime()
      集合.push(() => 值.setTime(时间))
    }
    const 构造 = Object.getPrototypeOf(值)?.constructor
    if (构造 && !原生类.has(构造)) 保存(构造)
    if (typeof 值 === 'function' && Object.getPrototypeOf(值) !== Function.prototype)
      保存(Object.getPrototypeOf(值))
    节点.push({ 值, 键: 结构.键集合, 字段 })
  }
  保存(模拟)
  const 恢复 = () => {
    for (const 项目 of 节点) {
      const 值 = 项目.值 as Record<PropertyKey, unknown>
      for (const 键 of Reflect.ownKeys(值))
        if (
          !项目.键.has(键) &&
          !忽略.get(值)?.has(键) &&
          Object.getOwnPropertyDescriptor(值, 键)?.configurable
        )
          Reflect.deleteProperty(值, 键)
      for (const { 键, 内容, 描述 } of 项目.字段) {
        if (恢复查询静态字段(值, 键, 内容)) continue
        if (!描述) {
          if (!Object.is(值[键], 内容) || !Object.prototype.hasOwnProperty.call(值, 键))
            值[键] = 内容
        } else {
          const 当前 = Object.getOwnPropertyDescriptor(值, 键)
          if (
            !当前 ||
            !Object.is(当前.value, 描述.value) ||
            当前.get !== 描述.get ||
            当前.set !== 描述.set
          )
            Object.defineProperty(值, 键, 描述)
        }
      }
    }
    集合.forEach((恢复) => 恢复())
  }
  let 查询字段表: WeakMap<object, readonly 快照字段[]> | undefined
  let 查询副本: ReturnType<typeof 创建原生查询副本> | undefined
  const 查询: 原生快照['查询'] = (执行) => {
    if (!查询字段表) {
      查询字段表 = new WeakMap(节点.map((项) => [项.值, 项.字段]))
      查询副本 = 创建原生查询副本(
        模拟,
        (值) => {
          let 字段 = 查询字段表!.get(值)
          const 历史 = 历史查询.get(值)
          if (!字段 && 历史) {
            字段 = [
              ...历史.map((内容, i) => ({ 键: String(i), 内容 })),
              {
                键: 'length',
                内容: 历史.length,
                描述: {
                  value: 历史.length,
                  writable: true,
                  enumerable: false,
                  configurable: false,
                },
              },
            ]
            查询字段表!.set(值, 字段)
          }
          return 字段
        },
        节点.filter((项) => typeof 项.值 === 'function').map((项) => 项.值),
      )
    }
    return 查询副本!((副本) => 执行(副本 as 原生模拟器))
  }
  return Object.assign(恢复, { 查询 })
}
