import { 生成实际技能序列 } from '../../通用函数'
import { 可以续演原循环 } from './原生引导'
import { 创建原生快照, type 原生复演缓存 } from './原生快照'
import { 读取宏网络计划 } from './宏循环回放'
import type { 原生模拟器, 原生特殊规则 } from './类型'

const 查询快照 = new WeakMap<
  原生复演缓存,
  { 状态: object; 版本: number; 前缀: 原生复演缓存['记录']; 恢复: () => void }
>()

// 从原模拟器已经认证的前缀进入同一释放生命周期，仅查询资格及时间。
// 普通查询读取前缀快照的局部副本；无法隔离的闭包副作用仍由完整快照恢复。
export const 查询原生资格 = (
  查询: NonNullable<原生特殊规则['查询释放']>,
  缓存: 原生复演缓存,
  输入: string[],
  名称: string,
  随机: number[],
  等待: (number | undefined)[],
  时间: number,
  网络延迟: number,
  状态: object,
) => {
  const 编码 = (预检: boolean) =>
    生成实际技能序列([
      { 技能名称: 名称, 额外信息: { 宏执行: 1, ...(预检 && 网络延迟 ? { 宏预检: 1 } : {}) } },
    ])[0]
  const 前缀 = 缓存.记录
  if (
    !前缀 ||
    !可以续演原循环(前缀, [...输入, 编码(true)], 随机, 等待) ||
    !可以续演原循环(前缀, [...输入, 编码(false)], 随机, 等待)
  )
    return undefined
  const 执行查询 = (模拟: 原生模拟器, 预检: boolean) => {
    模拟.测试循环 = [...输入, 编码(预检), '']
    模拟.网络延迟 = 网络延迟
    const 计划 = 读取宏网络计划(模拟, 编码(预检), 输入.length)
    模拟.网络延迟 = 0
    const 起点 = Math.max(模拟.当前时间, 时间, 计划?.就绪时间 ?? 时间) + (计划?.网络等待 ?? 0)
    if (起点 > 模拟.当前时间) {
      模拟.待生效事件结算(起点)
      if (起点 > 模拟.当前时间) 模拟.增加时间(起点 - 模拟.当前时间)
    }
    模拟.本轮模拟开始前()
    const 结果 = 查询(模拟, 名称, 输入.length, 预检 ? 时间 : undefined)
    return 结果 === undefined ? undefined : { ...结果, 计划 }
  }
  const 合并查询 = (运行: (预检: boolean) => ReturnType<typeof 执行查询>) => {
    const 资格 = 运行(true)
    if (资格 === undefined) return undefined
    if (!资格.可以释放 || Math.abs(资格.时间 - 时间) >= 0.000001) return null
    const 实际 = 网络延迟 ? 运行(false) : 资格
    if (实际 === undefined) return undefined
    return 实际.可以释放 && 实际.时间 >= 时间 - 0.000001
      ? {
          实际技能: 名称,
          释放时间: 实际.时间,
          自然就绪时间: 实际.计划?.就绪时间,
          GCD就绪时间: 实际.计划?.GCD就绪时间,
          网络等待: 实际.计划?.网络等待,
        }
      : null
  }
  let 支持 = true
  const 隔离结果 = 合并查询((预检) => {
    const 隔离 = 前缀.恢复.查询((副本) => 执行查询(副本, 预检))
    if (!隔离.支持) {
      支持 = false
      return undefined
    }
    return 隔离.结果
  })
  if (支持) return 隔离结果
  const 模拟 = 前缀.模拟
  let 快照 = 查询快照.get(缓存)
  if (!快照 || 快照.状态 !== 状态 || 快照.版本 !== 缓存.版本 || 快照.前缀 !== 前缀) {
    快照 = { 状态, 版本: 缓存.版本, 前缀, 恢复: 创建原生快照(模拟, new Map()) }
    查询快照.set(缓存, 快照)
  }
  try {
    return 合并查询((预检) => {
      前缀.恢复()
      return 执行查询(模拟, 预检)
    })
  } finally {
    快照.恢复()
  }
}
