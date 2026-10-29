import type { 技能状态 } from '../类型'
import type { 原模拟器接口, 心法耦合表, 冷却绑定 } from './类型'

// 当前体服 UI 技能 605；只查询公共调息，不提供骑乘释放动作。
export const 通用调息查询 = { 骑御: '605' }

export const 获取冷却依赖 = (
  模拟: 原模拟器接口,
  表: 心法耦合表,
  名称: string,
  绑定: 冷却绑定 = 表.冷却绑定?.[名称] || {},
) => {
  const 状态名称 = 表.技能状态来源?.[名称] || 名称
  const 技能 = 模拟.技能基础数据.find((项) => 项.技能名称 === 状态名称)
  const 组 = new Set([
    ...(技能?.检测GCD组 || []),
    ...(技能?.触发GCD组 || []),
    ...(绑定.GCD组 || []),
  ])
  if (技能?.技能GCD组) 组.add(技能.技能GCD组)
  return {
    GCD组: [...组].map((项) => (项 === '自身' ? 状态名称 : 项)),
    技能: [...new Set([状态名称, ...(绑定.技能 || [])])],
    时间字段: 绑定.时间字段,
  }
}

export const 读取冷却绑定 = (
  模拟: 原模拟器接口,
  表: 心法耦合表,
  名称: string,
  绑定: 冷却绑定 = 表.冷却绑定?.[名称] || {},
) => {
  const 依赖 = 获取冷却依赖(模拟, 表, 名称, 绑定)
  const GCD = Math.max(0, ...依赖.GCD组.map((组) => 模拟.GCD组[组] || 0))
  const 调息 = Math.max(
    0,
    ...依赖.技能.map((名称) => {
      const 数据 = 模拟.技能基础数据.find((项) => 项.技能名称 === 名称)
      const 队列 = 模拟.技能类实例集合[名称]?.技能运行数据?.待充能时间点 || []
      const 待充能 = 队列.filter((时间) => 时间 > 模拟.当前时间)
      return 待充能.length >= (数据?.最大充能层数 || 1)
        ? Math.max(0, Math.min(...待充能) - 模拟.当前时间)
        : 0
    }),
  )
  const 上次时间 = 绑定.时间字段
    ? (模拟 as unknown as Record<string, number | undefined>)[绑定.时间字段.名称]
    : undefined
  const 周期 =
    上次时间 === undefined ? 0 : Math.max(0, 上次时间 + 绑定.时间字段!.间隔帧 - 模拟.当前时间)
  return Math.max(GCD, 调息, 周期)
}

export const 读取通用调息 = (模拟: 原模拟器接口, 表: 心法耦合表): Record<string, 技能状态> => {
  const 查询: Record<string, 冷却绑定> = {
    骑御: { GCD组: [...(表.公共GCD组 || ['公共']), '后跳'] },
    ...表.调息查询,
  }
  return Object.fromEntries(
    Object.entries(查询).map(([名称, 绑定]) => {
      const 剩余帧 = 读取冷却绑定(模拟, 表, 名称, 绑定)
      return [
        名称,
        { 调息帧: 0, 冷却帧: 剩余帧, 阻塞帧: 剩余帧, 充能: 1, 最大充能: 1, 体态允许: true },
      ]
    }),
  )
}
