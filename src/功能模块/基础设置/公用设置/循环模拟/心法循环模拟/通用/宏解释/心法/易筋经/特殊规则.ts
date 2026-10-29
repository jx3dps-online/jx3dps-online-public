import 技能统一类 from '../../../../易筋经/simulator/通用类/技能统一类'
import type { SimulatorCycleProps } from '../../../../易筋经/simulator/main'
import type { 原生特殊规则, 原生模拟器 } from '../../通用/类型'
import { 查询非读条释放 } from '../../通用/查询非读条释放'

export const 特殊规则: 原生特殊规则 = {
  预检浅恢复: { 实例原型: 技能统一类.prototype },
  查询释放: 查询非读条释放,
  释放计划依赖后续技能: (实例) => {
    const 原实例 = 实例 as unknown as 技能统一类
    return 原实例.检查GCD !== 技能统一类.prototype.检查GCD || 原实例.本次释放延迟 === 'GCD'
  },
  加载构造器: async () => {
    const { default: 原模拟器 } = await import('../../../../易筋经/simulator/main')
    return (参数) => new 原模拟器(参数 as unknown as SimulatorCycleProps) as unknown as 原生模拟器
  },
}
