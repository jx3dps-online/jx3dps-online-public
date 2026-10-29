import { 复制快照只读数据 } from './原生快照'
import { 查询只读数据 } from './原生查询副本'
import { 读取查询静态描述, 恢复查询静态字段 } from './原生查询静态'
import type { 原生模拟器 } from './类型'

// 这些心法在释放/清 Buff 时修改模板；不能把动态模板当成固定配置共享。
const 动态技能配置 = new Set(['天罗诡道', '太玄经', '易筋经', '北傲诀'])
const 动态增益配置 = new Set(['天罗诡道', '无方', '易筋经'])
const 原生类 = new Set<object>([Object, Array, Map, Set, Date, Function])
const 静态忽略 = new Set<PropertyKey>(['prototype', 'name', 'length', 'arguments', 'caller'])

// 复制配置后同时替换模拟器、技能实例和技能类的引用，保留原来的别名关系。
// 不冻结原模块的模板或调用方数据；每个新模拟器完成初始化后再登记。
export const 共享原生固定配置 = (模拟: 原生模拟器, 心法: string) => {
  const 映射 = new Map<object, object>()
  const 记录 = (原: unknown, 副本: unknown) => {
    if (原 === null || typeof 原 !== 'object' || 映射.has(原)) return
    映射.set(原, 副本 as object)
    for (const 键 of Reflect.ownKeys(原)) 记录(原[键], (副本 as object)[键])
  }
  const 数据 = [
    ...(!动态技能配置.has(心法) ? [模拟.技能基础数据] : []),
    ...(!动态增益配置.has(心法) ? [模拟.Buff和Dot数据] : []),
  ]
  try {
    const 副本 = 复制快照只读数据(数据)
    if (查询只读数据.has(副本)) 记录(数据, 副本)
  } catch (错误) {
    if (!(错误 instanceof DOMException) || 错误.name !== 'DataCloneError') throw 错误
  }
  const 已读 = new Set<object>()
  const 替换 = (值: unknown) => {
    if (
      值 === null ||
      (typeof 值 !== 'object' && typeof 值 !== 'function') ||
      已读.has(值) ||
      查询只读数据.has(值) ||
      原生类.has(值)
    )
      return
    已读.add(值)
    for (const 键 of Reflect.ownKeys(值)) {
      if (typeof 值 === 'function' && 静态忽略.has(键)) continue
      const 描述 = 读取查询静态描述(值, 键) || Object.getOwnPropertyDescriptor(值, 键)!
      if (!('value' in 描述)) continue
      const 内容 = 描述.value
      const 副本 = 映射.get(内容)
      if (副本) {
        if (!恢复查询静态字段(值, 键, 副本)) Object.defineProperty(值, 键, { ...描述, value: 副本 })
      } else if (typeof 内容 !== 'function') 替换(内容)
    }
    const 构造 = Object.getPrototypeOf(值)?.constructor
    if (构造) 替换(构造)
    if (typeof 值 === 'function') 替换(Object.getPrototypeOf(值))
  }
  替换(模拟)
}
