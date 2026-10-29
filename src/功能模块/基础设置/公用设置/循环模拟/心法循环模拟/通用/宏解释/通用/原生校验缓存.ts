import type { 原生模拟器, 原技能实例, 原技能数据 } from './类型'
import { 查询只读数据 } from './原生查询副本'

// 只复用原校验的只读拒绝：读取时钟、枚举结构或写入状态时均保持完整原生试放。
export const 记录原生拒绝 = (
  模拟: 原生模拟器,
  校验: 原生模拟器['技能释放校验'],
  实例: 原技能实例,
  技能: 原技能数据,
) => {
  let 可缓存 = true
  const 依赖 = new Map<string, { 路径: string[]; 值: unknown; 对象?: boolean }>()
  const 代理 = new WeakMap<object, object>()
  const 原对象 = new WeakMap<object, object>()
  const 解包 = (值: unknown, 已处理 = new WeakSet<object>()): unknown => {
    if (值 === null || typeof 值 !== 'object') return 值
    if (原对象.has(值)) return 原对象.get(值)
    if (已处理.has(值)) return 值
    已处理.add(值)
    for (const 键 of Object.keys(值)) {
      const 属性 = Object.getOwnPropertyDescriptor(值, 键)!
      if ('value' in 属性 && 属性.writable)
        (值 as Record<string, unknown>)[键] = 解包(属性.value, 已处理)
    }
    return 值
  }
  const 包装 = (对象: object, 路径: string[]): object => {
    if (查询只读数据.has(对象)) return 对象
    const 已有 = 代理.get(对象)
    if (已有) return 已有
    const 结果 = new Proxy(对象, {
      get(目标, 属性, 接收者) {
        const 值 = Reflect.get(目标, 属性, 接收者)
        if (typeof 属性 !== 'string') {
          可缓存 = false
          return 值
        }
        const 子路径 = [...路径, 属性]
        if (!路径.length && 属性 === '当前时间') 可缓存 = false
        if (值 !== null && typeof 值 === 'object') {
          依赖.set(JSON.stringify(子路径), { 路径: 子路径, 值: undefined, 对象: true })
          return 包装(值, 子路径)
        }
        依赖.set(JSON.stringify(子路径), { 路径: 子路径, 值 })
        return 值
      },
      set(目标, 属性, 值) {
        可缓存 = false
        return Reflect.set(目标, 属性, 解包(值))
      },
      deleteProperty(目标, 属性) {
        可缓存 = false
        return Reflect.deleteProperty(目标, 属性)
      },
      ownKeys(目标) {
        可缓存 = false
        return Reflect.ownKeys(目标)
      },
      has(目标, 属性) {
        可缓存 = false
        return Reflect.has(目标, 属性)
      },
      getOwnPropertyDescriptor(目标, 属性) {
        可缓存 = false
        return Reflect.getOwnPropertyDescriptor(目标, 属性)
      },
      defineProperty(目标, 属性, 描述) {
        可缓存 = false
        return Reflect.defineProperty(目标, 属性, {
          ...描述,
          ...('value' in 描述 ? { value: 解包(描述.value) } : {}),
        })
      },
    })
    代理.set(对象, 结果)
    原对象.set(结果, 对象)
    return 结果
  }
  const 根 = 包装(模拟, []) as 原生模拟器
  const 名称 = Object.keys(模拟.技能类实例集合).find((名) => 模拟.技能类实例集合[名] === 实例)!
  const 结果 = 校验.call(根, 根.技能类实例集合[名称], 技能)
  const 拒绝 =
    !结果.可以释放 && 可缓存
      ? (当前: 原生模拟器) =>
          [...依赖.values()].every(({ 路径, 值, 对象 }) => {
            let 实际: unknown = 当前
            for (const 键 of 路径) {
              if (实际 === null || 实际 === undefined) return false
              实际 = (实际 as Record<string, unknown>)[键]
            }
            return 对象 ? 实际 !== null && typeof 实际 === 'object' : Object.is(实际, 值)
          })
      : undefined
  return { 结果, 拒绝 }
}
