import 技能统一类 from '../../../../傲血战意/simulator/通用类/技能统一类'
import type { SimulatorCycleProps } from '../../../../傲血战意/simulator/main'
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
    const { default: 原模拟器 } = await import('../../../../傲血战意/simulator/main')
    const { default: 基础技能 } = await import('../../../../傲血战意/constant/skill')
    return (参数) => {
      // 龙牙构造器会修改技能 CD；每个模拟实例使用独立数据，避免重复计算加速。
      const 原数据 = [...基础技能]
      基础技能.splice(0, 基础技能.length, ...原数据.map((项) => ({ ...项 })))
      try {
        return new 原模拟器(参数 as unknown as SimulatorCycleProps) as unknown as 原生模拟器
      } finally {
        基础技能.splice(0, 基础技能.length, ...原数据)
      }
    }
  },
}
