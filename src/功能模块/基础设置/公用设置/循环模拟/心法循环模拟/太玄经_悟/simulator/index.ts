/**
 * 定义模拟循环类
 */

import { 团队增益轴类型 } from '@/@types/团队增益'
import 循环主类 from './main'
import { 起手Buff配置 } from '../../通用/通用框架/类型定义/Buff'

interface SimulatorCycleProps {
  测试循环: string[]
  加速值: number
  网络延迟: number
  奇穴: string[]
  // 当前自身buff列表?: Buff枚举
  // 当前目标buff列表?: Buff枚举
  大橙武模拟: boolean
  开启武学助手: boolean
  启用团队增益快照?: boolean
  团队增益轴?: 团队增益轴类型
  起手Buff配置?: 起手Buff配置
}

const 模拟循环 = (props: SimulatorCycleProps) => {
  const 模拟实例 = new 循环主类(props)
  模拟实例.模拟()

  模拟实例.日志排序()

  const 当前各技能运行状态 = 模拟实例.获取当前各技能的运行状态()
  const 当前DOT运行状态 = 模拟实例.获取各DOT的运行状态()

  return {
    最终日志: 模拟实例.战斗日志,
    当前自身buff列表: 模拟实例.当前自身buff列表,
    当前目标buff列表: 模拟实例.当前目标buff列表,
    战斗开始时间: (模拟实例 as any).战斗开始时间,
    当前时间: 模拟实例.当前时间,
    循环执行结果: 模拟实例.循环执行结果,
    循环异常信息: 模拟实例.循环异常信息,
    技能释放记录: 模拟实例.技能释放记录,
    当前各技能运行状态,
    当前DOT运行状态,
    当前GCD组: 模拟实例.GCD组,
    技能基础数据: 模拟实例.技能基础数据,
  }
}

export default 模拟循环
