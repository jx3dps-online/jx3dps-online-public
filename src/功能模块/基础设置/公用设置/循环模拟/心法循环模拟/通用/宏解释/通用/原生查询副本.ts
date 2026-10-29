export interface 查询字段 {
  readonly 键: PropertyKey
  readonly 内容: unknown
  readonly 描述?: PropertyDescriptor
}

const 不支持隔离查询 = Symbol('不支持隔离查询')
const 静态忽略 = new Set<PropertyKey>(['prototype', 'name', 'length'])
export const 查询只读数据 = new WeakSet<object>()
const 数组字段索引 = new WeakMap<readonly 查询字段[], Map<PropertyKey, 查询字段>>()
interface 查询检查点 {
  恢复: () => void
  结束: () => void
}
const 副本检查点 = new WeakMap<object, () => 查询检查点 | undefined>()
export const 创建原生查询检查点 = (副本: object) => 副本检查点.get(副本)?.()

// 只在访问时复制一层；查询的写入留在副本，循环、事件和技能实例始终共享同一份别名映射。
// 闭包事件和绑定到原实例的方法不能迁移 this，调用前回退到原来的完整恢复路径。
export const 创建原生查询副本 = (
  模拟: object,
  读取字段?: (值: object) => readonly 查询字段[] | undefined,
  已存静态?: readonly object[],
) => {
  const 副本 = new WeakMap<object, object>()
  const 副本集合 = new WeakSet<object>()
  const 改动 = new Map<object, () => void>()
  const 检查点 = new Set<Map<object, () => void>>()
  const 撤销改动 = () => {
    for (const 恢复 of [...改动.values()].reverse()) 恢复()
    改动.clear()
    检查点.clear()
  }
  const 静态 = new Set<object>(已存静态)
  if (!已存静态) {
    const 原 = 模拟 as { 技能类实例集合?: Record<string, object> }
    for (const 值 of [模拟, ...Object.values(原.技能类实例集合 || {})]) {
      let 构造 = Object.getPrototypeOf(值)?.constructor
      while (构造 && 构造 !== Object && 构造 !== Function.prototype) {
        静态.add(构造)
        构造 = Object.getPrototypeOf(构造)
      }
    }
  }
  const 字段缓存 = new WeakMap<object, readonly 查询字段[]>()
  const 获取字段 = (值: object): readonly 查询字段[] => {
    const 已存 = 读取字段?.(值) || 字段缓存.get(值)
    if (已存) return 已存
    const 字段 = Reflect.ownKeys(值).map((键) => {
      const 描述 = 读取查询静态描述(值, 键) || Object.getOwnPropertyDescriptor(值, 键)!
      return { 键, 内容: 描述.value, 描述 }
    })
    字段缓存.set(值, 字段)
    return 字段
  }
  const 包装 = (值: unknown): unknown => {
    if (值 === null || typeof 值 !== 'object') return 值
    if (查询只读数据.has(值)) return 值
    if (副本集合.has(值)) return 值
    const 已有 = 副本.get(值)
    if (已有) return 已有
    // 深冻结的配置不会被查询修改，代理也不应打破不可写属性的返回值约束。
    if (Object.isFrozen(值)) {
      if (
        Reflect.ownKeys(值).some((键) => {
          const 项 = Object.getOwnPropertyDescriptor(值, 键)!
          return !('value' in 项) || (项.value !== null && typeof 项.value === 'object')
        })
      )
        throw 不支持隔离查询
      return 值
    }
    if (值 instanceof Map || 值 instanceof Set || 值 instanceof Date) throw 不支持隔离查询
    const 原型 = Object.getPrototypeOf(值)
    const 目标 = Array.isArray(值) ? [] : Object.create(原型)
    const 已存 = 读取字段?.(值)
    let 数组字段: Map<PropertyKey, 查询字段> | undefined
    let 可见长度 = 0
    const 删除字段 = new Set<PropertyKey>()
    const 不可包装 = new Set<PropertyKey>()
    if (Array.isArray(值) && 已存) {
      数组字段 = 数组字段索引.get(已存)
      if (!数组字段) {
        数组字段 = new Map(已存.map((项) => [项.键, 项]))
        数组字段索引.set(已存, 数组字段)
      }
      const 长度 = 数组字段.get('length')!
      可见长度 = Number(长度.内容)
      Object.defineProperty(目标, 'length', 长度.描述 || { value: 可见长度, writable: true })
      for (const 项 of 已存) {
        if (!项.描述 || 项.键 === 'length') continue
        if (!('value' in 项.描述)) throw 不支持隔离查询
        if (!项.描述.configurable || !项.描述.writable) {
          Object.defineProperty(目标, 项.键, 项.描述)
          if (!项.描述.configurable && !项.描述.writable) 不可包装.add(项.键)
        }
      }
    }
    const 数组下标 = (键: PropertyKey) =>
      typeof 键 === 'string' && /^(0|[1-9]\d*)$/.test(键) && Number(键) < 4294967295
    for (const 项 of 数组字段 ? [] : 已存 || 获取字段(值)) {
      if (!项.描述) {
        目标[项.键] = 项.内容
        continue
      }
      const 描述 = 项.描述 || {
        value: 项.内容,
        writable: true,
        enumerable: true,
        configurable: true,
      }
      if (!('value' in 描述)) throw 不支持隔离查询
      if (!描述.configurable && !描述.writable) 不可包装.add(项.键)
      Object.defineProperty(目标, 项.键, 描述)
    }
    const 读取数组字段 = (键: PropertyKey) =>
      !删除字段.has(键) && (!数组下标(键) || Number(键) < 可见长度) ? 数组字段?.get(键) : undefined
    const 保存改动 = () => {
      const 未保存 = [改动, ...检查点].filter((项) => !项.has(目标))
      if (!未保存.length) return
      const 字段 = Object.getOwnPropertyDescriptors(目标)
      const 原长度 = 可见长度
      const 原删除 = new Set(删除字段)
      const 恢复 = () => {
        for (const 键 of Reflect.ownKeys(目标))
          if (!Object.prototype.hasOwnProperty.call(字段, 键)) Reflect.deleteProperty(目标, 键)
        Object.defineProperties(目标, 字段)
        可见长度 = 原长度
        删除字段.clear()
        for (const 键 of 原删除) 删除字段.add(键)
      }
      for (const 项 of 未保存) 项.set(目标, 恢复)
    }
    const 结果 = new Proxy(目标, {
      get(当前, 键, 接收者) {
        if (值 === 模拟 && 键 === '添加战斗日志') return () => undefined
        const 字段 = !Object.prototype.hasOwnProperty.call(当前, 键) ? 读取数组字段(键) : undefined
        const 内容 = 字段 ? 字段.内容 : Reflect.get(当前, 键, 接收者)
        if (typeof 内容 === 'function') {
          if (键 === 'constructor' && 静态.has(内容)) return 内容
          if (
            (字段 || Object.prototype.hasOwnProperty.call(当前, 键)) &&
            (!原型 || Reflect.get(原型, 键) !== 内容)
          )
            return () => {
              throw 不支持隔离查询
            }
          return 内容
        }
        if (不可包装.has(键) && 内容 !== null && typeof 内容 === 'object') throw 不支持隔离查询
        return 包装(内容)
      },
      ...(数组字段 && {
        has: (当前: object, 键: PropertyKey) => !!读取数组字段(键) || Reflect.has(当前, 键),
        ownKeys: (当前: object) => {
          const 键 = [
            ...new Set([
              ...[...数组字段!.keys()].filter((项) => !!读取数组字段(项)),
              ...Reflect.ownKeys(当前),
            ]),
          ]
          return [
            ...键.filter(数组下标).sort((左, 右) => Number(左) - Number(右)),
            ...键.filter((项) => typeof 项 === 'string' && !数组下标(项)),
            ...键.filter((项) => typeof 项 === 'symbol'),
          ] as (string | symbol)[]
        },
        getOwnPropertyDescriptor(当前: object, 键: PropertyKey) {
          const 当前描述 = Object.getOwnPropertyDescriptor(当前, 键)
          if (当前描述) return 当前描述
          const 字段 = 读取数组字段(键)
          if (!字段) return undefined
          if (字段.描述 && !字段.描述.configurable) throw 不支持隔离查询
          return (
            字段.描述 || { value: 字段.内容, writable: true, enumerable: true, configurable: true }
          )
        },
      }),
      set(当前: object, 键: PropertyKey, 内容: unknown) {
        保存改动()
        if (数组字段 && 键 === 'length') 可见长度 = Math.min(可见长度, Number(内容))
        删除字段.delete(键)
        return Reflect.set(当前, 键, 内容)
      },
      deleteProperty(当前: object, 键: PropertyKey) {
        保存改动()
        删除字段.add(键)
        return Reflect.deleteProperty(当前, 键)
      },
      defineProperty(当前: object, 键: PropertyKey, 描述: PropertyDescriptor) {
        // 不可撤销的定义必须由完整快照路径处理，不能污染复用副本。
        const 已有 = Object.getOwnPropertyDescriptor(当前, 键)
        if (
          描述.configurable === false ||
          (!已有 && 描述.configurable !== true) ||
          (已有 && !已有.configurable && 已有.writable && 描述.writable === false)
        )
          throw 不支持隔离查询
        保存改动()
        if (数组字段 && 键 === 'length' && 'value' in 描述)
          可见长度 = Math.min(可见长度, Number(描述.value))
        删除字段.delete(键)
        return Reflect.defineProperty(当前, 键, 描述)
      },
      setPrototypeOf: () => {
        throw 不支持隔离查询
      },
      preventExtensions: () => {
        throw 不支持隔离查询
      },
    })
    副本.set(值, 结果)
    副本集合.add(结果)
    副本检查点.set(结果, () => {
      const 字段 = new Map<object, () => void>()
      const 恢复静态 = 创建静态查询检查点(静态)
      if (!恢复静态) return undefined
      检查点.add(字段)
      const 恢复 = () => {
        for (const 恢复字段 of [...字段.values()].reverse()) 恢复字段()
        字段.clear()
        恢复静态()
      }
      return {
        恢复,
        结束: () => {
          恢复()
          检查点.delete(字段)
        },
      }
    })
    return 结果
  }
  return <T>(执行: (副本: object) => T): { 支持: true; 结果: T } | { 支持: false } => {
    const 原静态: { 值: object; 字段: Map<PropertyKey, PropertyDescriptor> }[] = []
    const 原随机 = Math.random
    try {
      Math.random = () => {
        throw 不支持隔离查询
      }
      const 隔离 = 执行隔离静态查询(静态, 获取字段, 包装, () => 执行(包装(模拟) as object))
      if (隔离.支持) return 隔离
      撤销改动()
      // 类方法直接引用类名，无法由实例代理截获；只暂存这些少量静态字段。
      for (const 值 of 静态) {
        const 字段 = new Map<PropertyKey, PropertyDescriptor>(
          Reflect.ownKeys(值)
            .filter((键) => !静态忽略.has(键))
            .map((键) => [键, Object.getOwnPropertyDescriptor(值, 键)!] as const),
        )
        原静态.push({ 值, 字段 })
        const 已存 = 获取字段(值).filter((项) => !静态忽略.has(项.键))
        const 键集合 = new Set(已存.map((项) => 项.键))
        for (const [键, 描述] of 字段)
          if (!键集合.has(键)) {
            if (!描述.configurable) throw 不支持隔离查询
            Reflect.deleteProperty(值, 键)
          }
        for (const 项 of 已存) {
          const 描述 = 项.描述 || {
            value: 项.内容,
            writable: true,
            enumerable: true,
            configurable: true,
          }
          if (!('value' in 描述)) throw 不支持隔离查询
          if (项.内容 !== null && typeof 项.内容 === 'object' && 描述.configurable) {
            let 内容: unknown = 项.内容
            Object.defineProperty(值, 项.键, {
              configurable: true,
              enumerable: 描述.enumerable,
              get: () => 包装(内容),
              ...(描述.writable && {
                set: (新值: unknown) => {
                  内容 = 新值
                },
              }),
            })
          } else {
            const 内容 = 包装(项.内容)
            if (!描述.configurable && !描述.writable && !Object.is(内容, 项.内容))
              throw 不支持隔离查询
            if (!Object.is(字段.get(项.键)?.value, 内容))
              Object.defineProperty(值, 项.键, { ...描述, value: 内容 })
          }
        }
      }
      Math.random = () => {
        throw 不支持隔离查询
      }
      return { 支持: true, 结果: 执行(包装(模拟) as object) }
    } catch (错误) {
      if (错误 !== 不支持隔离查询) throw 错误
      return { 支持: false }
    } finally {
      Math.random = 原随机
      撤销改动()
      for (const { 值, 字段 } of 原静态) {
        for (const 键 of Reflect.ownKeys(值))
          if (!静态忽略.has(键) && !字段.has(键)) Reflect.deleteProperty(值, 键)
        for (const [键, 描述] of 字段) Object.defineProperty(值, 键, 描述)
      }
    }
  }
}
export const 执行原生只读查询 = <T>(
  模拟: object,
  执行: (副本: object) => T,
  读取字段?: (值: object) => readonly 查询字段[] | undefined,
  已存静态?: readonly object[],
) => 创建原生查询副本(模拟, 读取字段, 已存静态)(执行)
import { 执行隔离静态查询, 读取查询静态描述, 创建静态查询检查点 } from './原生查询静态'
