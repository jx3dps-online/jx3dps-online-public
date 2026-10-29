import type { 原生模拟器, 原生特殊规则 } from './类型'
import { 创建原生快照 } from './原生快照'
import { 查询只读数据 } from './原生查询副本'

// 释放时间计划只查询 GCD/CD；初始化可能修改实例、类静态字段和当前技能元数据。
// 只读校验直接给出资格；有副作用或读条时返回 undefined，交由完整原循环试放。
export const 预检原生释放 = (
  模拟: 原生模拟器,
  输入: string[],
  名称: string,
  仅检查时间 = false,
  浅恢复?: 原生特殊规则['预检浅恢复'],
) => {
  const 技能 = 模拟.技能基础数据.find((项) => 项.技能名称 === 名称)!
  const 实例 = 模拟.技能类实例集合[名称]
  const 原型 = 浅恢复?.实例原型
  const 只改实例字段 =
    原型 &&
    (!实例.统一初始化 || 实例.统一初始化 === 原型.统一初始化) &&
    (!实例.释放前初始化 || 实例.释放前初始化 === 原型.释放前初始化) &&
    (!实例.检查GCD || 实例.检查GCD === 原型.检查GCD || 浅恢复?.GCD例外?.includes(实例.检查GCD))
  let 恢复: () => void
  if (只改实例字段) {
    // 已核对的公共初始化与 GCD 只修改实例字段；覆盖这些方法的技能仍保存完整局部状态。
    const 字段 = Object.getOwnPropertyDescriptors(实例)
    恢复 = () => {
      for (const 键 of Reflect.ownKeys(实例))
        if (!Object.prototype.hasOwnProperty.call(字段, 键)) Reflect.deleteProperty(实例, 键)
      Object.defineProperties(实例, 字段)
    }
  } else {
    恢复 = 创建原生快照({ 实例, 技能 }, new Map([[实例, new Set(['模拟循环'])]]))
  }
  const 原输入 = 模拟.测试循环
  const 原延迟 = 模拟.网络延迟
  try {
    模拟.网络延迟 = 0
    模拟.测试循环 = [...输入, 名称, '']
    实例.统一初始化?.()
    实例.释放前初始化?.()
    const 时间 = 模拟.技能释放前(技能, 实例, 输入.length).技能预估释放时间
    if (时间 > 模拟.当前时间 + 0.000001) return false
    if (仅检查时间) return undefined
    if (实例.读条) return undefined
    const 写入 = Symbol('释放预检写入')
    const 代理 = new WeakMap<object, object>()
    const 阻止写入 = () => {
      throw 写入
    }
    const 包装 = (对象: object): object => {
      if (查询只读数据.has(对象)) return 对象
      const 已有 = 代理.get(对象)
      if (已有) return 已有
      const 结果 = new Proxy(对象, {
        get(目标, 属性, 接收者) {
          if (目标 === 模拟 && 属性 === '添加战斗日志') return () => undefined
          const 值 = Reflect.get(目标, 属性, 接收者)
          return 值 !== null && typeof 值 === 'object' ? 包装(值) : 值
        },
        set: 阻止写入,
        deleteProperty: 阻止写入,
        defineProperty: 阻止写入,
      })
      代理.set(对象, 结果)
      return 结果
    }
    const 当前 = 包装(模拟) as 原生模拟器
    try {
      return 当前.技能释放校验(当前.技能类实例集合[名称], 技能).可以释放
    } catch (错误) {
      if (错误 !== 写入) throw 错误
      return undefined
    }
  } finally {
    恢复()
    模拟.测试循环 = 原输入
    模拟.网络延迟 = 原延迟
  }
}
