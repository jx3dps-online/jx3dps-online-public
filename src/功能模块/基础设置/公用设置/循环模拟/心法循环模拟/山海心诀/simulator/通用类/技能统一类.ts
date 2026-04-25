import 循环主类类型 from '../main'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'

class 技能统一类 {
  模拟循环: 循环主类类型 = {} as any
  本次释放记录: 技能释放记录结果 = {}
  本次释放延迟: number | 'GCD' = 0
  本次是否在领胡内: boolean = false
  本次是否在连珠内: boolean = false

  constructor(模拟循环) {
    this.模拟循环 = 模拟循环
    return
  }

  检查GCD(索引, 当前技能?: 循环基础技能数据类型) {
    const 后一个技能 = this.模拟循环?.测试循环?.[索引 + 1]
    const GCD组 = 当前技能?.技能GCD组 === '自身' ? 当前技能?.技能名称 : 当前技能?.技能GCD组 || ''
    let GCD = this.模拟循环?.GCD组?.[GCD组] || 0
    let 等待GCD = 0

    if (this.本次释放延迟) {
      if (GCD组 === '公共') {
        GCD = GCD + this.本次释放延迟
      }
      // 如果存在后面的技能，判断后面的技能当前的GCD为多少，推进到后一个技能。这样可以让灭卡在后面的技能释放前释放
      else if (this.本次释放延迟 === 'GCD' && 后一个技能) {
        const 当前技能 = this?.模拟循环?.技能基础数据?.find((item) => item?.技能名称 === 后一个技能)
        if (当前技能 && 当前技能?.技能GCD组) {
          const 技能实例 = this?.模拟循环?.技能类实例集合?.[当前技能?.技能名称]
          const 后一个技能GCD = this.模拟循环?.检查GCD?.(当前技能, 技能实例, 索引 + 1) || 0
          等待GCD = 后一个技能GCD
        }
      } else {
        等待GCD = Number(this.本次释放延迟)
      }
      if (等待GCD) {
        GCD = Math.max(等待GCD, GCD)
      }
    }
    this.本次释放延迟 = 0
    return GCD
  }

  释放前初始化(额外信息) {
    if (额外信息?.延迟) {
      this.本次释放延迟 = 额外信息?.延迟
    }
    // 重置释放记录
    this.本次释放记录 = {}
  }

  成功释放() {
    this.本次是否在领胡内 = !!this.模拟循环.当前自身buff列表?.['领胡']?.当前层数
    this.本次是否在连珠内 = !!this.模拟循环.当前自身buff列表?.['连珠']?.当前层数
  }

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
  ) {
    this.模拟循环.技能造成伤害?.(伤害名称, 伤害次数, 额外增益列表, 触发伤害时间)
  }

  获取技能释放记录结果() {
    return {
      ...this.本次释放记录,
      背景容器: !!this.本次是否在领胡内, // background
      底部标识: !!this.本次是否在连珠内,
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
