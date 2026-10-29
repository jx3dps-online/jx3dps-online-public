import 技能统一类 from '../../../../花间游/simulator/通用类/技能统一类'
import type { SimulatorCycleProps } from '../../../../花间游/simulator/main'
import type { 原生特殊规则, 原生模拟器 } from '../../通用/类型'

export const 特殊规则: 原生特殊规则 = {
  预检浅恢复: { 实例原型: 技能统一类.prototype },
  禁用原生续演: (奇穴) => 奇穴.includes('定式黑白'), // 棋子状态在原实例之外，不能用实例快照续演。
  释放计划依赖后续技能: (实例, 技能) => {
    const 原实例 = 实例 as unknown as 技能统一类
    return (
      原实例.检查GCD !== 技能统一类.prototype.检查GCD ||
      原实例.本次释放延迟 === 'GCD' ||
      ['触发橙武', '水月无间'].includes(技能.技能名称)
    )
  },
  教师等待GCD技能: ['水月无间'],
  加载构造器: async () => {
    const { default: 原模拟器 } = await import('../../../../花间游/simulator/main')
    return (参数) => new 原模拟器(参数 as unknown as SimulatorCycleProps) as unknown as 原生模拟器
  },
}
