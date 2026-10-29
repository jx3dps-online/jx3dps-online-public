import type { SimulatorCycleProps } from '../../../../北傲诀/simulator/main'
import type { 原生特殊规则, 原生模拟器 } from '../../通用/类型'

export const 特殊规则: 原生特殊规则 = {
  加载构造器: async () => {
    const { default: 原模拟器 } = await import('../../../../北傲诀/simulator/main')
    return (参数) => new 原模拟器(参数 as unknown as SimulatorCycleProps) as unknown as 原生模拟器
  },
}
