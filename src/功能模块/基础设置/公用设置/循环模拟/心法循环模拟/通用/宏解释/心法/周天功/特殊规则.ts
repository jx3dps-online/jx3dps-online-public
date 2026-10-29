import 技能统一类 from '../../../../周天功/simulator/通用类/技能统一类'
import type { SimulatorCycleProps } from '../../../../周天功/simulator/main'
import type 原循环 from '../../../../周天功/simulator/main'
import type { 原生特殊规则, 原生模拟器 } from '../../通用/类型'

export const 特殊规则: 原生特殊规则 = {
  预检浅恢复: { 实例原型: 技能统一类.prototype },
  查询释放: (模拟, 名称, 索引, 截止) => {
    const 原 = 模拟 as unknown as 原循环
    const 技能 = 原.技能基础数据.find((项) => 项.技能名称 === 名称)
    const 实例 = 原.技能类实例集合[名称]
    if (!技能 || !实例 || 索引 === 0) return undefined
    if (
      (原.校验奇穴是否存在('蛰微') && 原.校验奇穴是否存在('风萦')) ||
      (原.校验奇穴是否存在('一阳来复') && 原.校验奇穴是否存在('风徊絮转')) ||
      (名称 === '劈风令' && 原.当前自身buff列表.茫缈?.当前层数)
    )
      return undefined
    实例.释放前初始化?.({ 宏执行: 1 })
    const 计划 = 原.技能释放前(技能, 实例, 索引)
    if (截止 !== undefined && 计划.技能预估释放时间 > 截止 + 0.000001)
      return { 可以释放: false, 时间: 计划.技能预估释放时间 }
    const 读条时间 = 实例.获取读条时间?.(索引) || 0
    if (读条时间) 实例.读条?.(计划.技能预估释放时间)
    原.待生效事件结算(计划.技能预估释放时间)
    原.技能GCD和CD处理(计划.等待CD, 计划.技能预估释放时间, 技能, 实例)
    原.技能成功开始释放(技能, 实例, !!读条时间)
    const 结果 = 原.技能释放校验(实例, 技能)
    const 时间 = 读条时间 ? 计划.技能预估释放时间 : 原.当前时间
    原.清空已经消失的buff()
    return { 可以释放: 结果.可以释放, 时间 }
  },
  释放计划依赖后续技能: (实例) => {
    const 原实例 = 实例 as unknown as 技能统一类
    return 原实例.检查GCD !== 技能统一类.prototype.检查GCD || 原实例.本次释放延迟 === 'GCD'
  },
  加载构造器: async () => {
    const { default: 原模拟器 } = await import('../../../../周天功/simulator/main')
    return (参数) => new 原模拟器(参数 as unknown as SimulatorCycleProps) as unknown as 原生模拟器
  },
}
