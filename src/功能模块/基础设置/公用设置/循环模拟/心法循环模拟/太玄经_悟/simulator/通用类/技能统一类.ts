import 循环主类类型 from '../main'
import { 技能释放记录结果 } from '../type'

class 技能统一类 {
  模拟循环: Partial<循环主类类型> = {}
  本次释放记录: 技能释放记录结果 = {}

  constructor(模拟循环) {
    this.模拟循环 = 模拟循环
    return
  }

  释放前初始化() {
    // 重置释放记录
    this.本次释放记录 = {}
  }

  减少对阵技能CD(减少时间 = 16) {
    // 减少对阵技能CD
    console.log(减少时间)
  }

  减少绝技技能CD(减少时间 = 32) {
    this.模拟循环.技能类实例集合?.列宿游?.减少调息时间?.(减少时间)
  }

  对阵招式橙武减少绝技技能CD() {
    if (this.模拟循环.大橙武模拟) {
      // this.模拟循环.技能类实例集合?.列宿游?.减少调息时间?.(0.3125 * 16)
      this.模拟循环.技能类实例集合?.列宿游?.减少调息时间?.(0.3125 * 16)
    }
  }

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    DOT伤害 = false,
  ) {
    const 增益列表 = this.获取多层增益([...额外增益列表])
    this.模拟循环.技能造成伤害?.(伤害名称, 伤害次数, 增益列表, 触发伤害时间, DOT伤害)
  }

  获取多层增益(增益列表) {
    // const 待判断多层增益 = ['断脉']
    // let 最终增益列表 = 增益列表
    // 最终增益列表.push(最终增益列表) {

    // }
    return 增益列表
  }

  获取技能释放记录结果() {
    return {
      ...this.本次释放记录,
    }
  }

  获取当前重要buff列表(技能依赖自身buff列表: string[] = [], 技能依赖目标buff列表: string[] = []) {
    const 重要buff列表: string[] = []
    技能依赖自身buff列表.forEach((buff) => {
      if (this.模拟循环.当前自身buff列表?.[buff]?.当前层数) {
        重要buff列表.push(buff)
      }
    })
    技能依赖目标buff列表.forEach((buff) => {
      if (this.模拟循环.当前目标buff列表?.[buff]?.当前层数) {
        重要buff列表.push(buff)
      }
    })
    return 重要buff列表 || []
  }

  获取施加重要buff信息(buff名称) {
    const 当前时间 = this.模拟循环.当前时间 || 0
    const buff对象 = this.模拟循环.Buff和Dot数据?.[buff名称]

    return buff对象
      ? {
          buff名称: buff名称,
          buff开始时间: 当前时间,
          buff结束时间: 当前时间 + (buff对象?.最大持续时间 || 0),
        }
      : null
  }
}

export default 技能统一类
