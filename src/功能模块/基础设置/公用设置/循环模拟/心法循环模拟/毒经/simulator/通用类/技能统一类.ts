import 循环主类类型 from '../main'
import { 获取实际帧数 } from '@/工具函数/data'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'

class 技能统一类 {
  模拟循环: 循环主类类型 = {} as any
  本次释放记录: 技能释放记录结果 = {}
  本次释放延迟: number | 'GCD' = 0

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

  获取DOT快照检测Buff列表(伤害名称) {
    if (伤害名称?.includes('DOT')) {
      return ['灵蛇献祭']
    } else {
      return []
    }
  }

  令怖伤害(令怖层数) {
    this.触发伤害行为('令怖', 1, [], undefined, 令怖层数)
  }

  获取虫魄状态(技能名称: '蝎心' | '蛇影' | '百足' | '蟾啸' | '千丝') {
    return this.模拟循环.角色状态信息.虫魄状态[技能名称]
  }

  处理虫魄(技能名称: '蝎心' | '蛇影' | '百足' | '蟾啸' | '千丝') {
    this.模拟循环.角色状态信息.虫魄状态[技能名称] = true
    if (Object.values(this.模拟循环.角色状态信息.虫魄状态).every((item) => item)) {
      this.触发伤害行为('虫魄', 5)
      this.触发伤害行为('破', 5, [], undefined, 2)
      const 当前令怖层数 = this.模拟循环.当前自身buff列表?.['令怖']?.当前层数 || 0
      if (this.模拟循环.校验奇穴是否存在('令怖') && 当前令怖层数 > 0) {
        // 每 0.25s 触发一次
        for (let i = 1; i <= 5; i++) {
          this.模拟循环.添加待生效事件队列([
            {
              事件名称: '令怖伤害',
              事件时间: this.模拟循环.当前时间 + 4 * i,
              事件备注: 当前令怖层数,
            },
          ])
        }
      }
      this.模拟循环.卸除buff?.({ 名称: '令怖', 对象: '自身', 卸除层数: 当前令怖层数 })

      if (this.模拟循环.校验奇穴是否存在('降厄')) {
        this?.模拟循环?.技能类实例集合?.['降厄']?.减少调息时间(每秒郭氏帧 * 5)
      }

      this.模拟循环.角色状态信息.虫魄状态 = {
        蝎心: false,
        蛇影: false,
        百足: false,
        蟾啸: false,
        千丝: false,
      }
    }
  }

  触发荒息(技能名称: string) {
    if (this.模拟循环.校验奇穴是否存在('荒息') && this.模拟循环.当前自身buff列表.凤凰蛊?.当前层数) {
      this.模拟循环.荒息计数 += 1
      const 触发荒息次数 = Math.floor(this.模拟循环.荒息计数 / 2)
      if (触发荒息次数 > 0) {
        this.触发伤害行为('荒息', 触发荒息次数)
        this.触发伤害行为('破', 触发荒息次数, [], undefined, 1)
        this.模拟循环.荒息计数 = this.模拟循环.荒息计数 % 2
      }
    }
  }

  触发降厄(技能名称: '蝎心' | '蛇影' | '百足' | '蟾啸' | '千丝') {
    if (this.模拟循环.当前自身buff列表.降厄?.当前层数) {
      this.触发伤害行为('降厄', 1)
    }
  }

  获取实际加速帧数(原始帧数, 加速等级) {
    const 是否处于降厄加速状态 = !!this.模拟循环.当前自身buff列表?.['降厄']?.当前层数
    const 是否处于狂暴加速状态 = !!this.模拟循环.当前自身buff列表?.['蛊虫狂暴']?.当前层数
    const 降厄加速值 = 512
    const 狂暴加速值 = 102
    const 生效加速值 =
      (是否处于降厄加速状态 ? 降厄加速值 : 0) + (是否处于狂暴加速状态 ? 狂暴加速值 : 0)

    return 获取实际帧数(原始帧数, 加速等级, 0, 生效加速值)
  }

  获取当前目标DOT() {
    const 当前目标DOT: string[] = []
    if (this.模拟循环.技能类实例集合?.蛇影DOT?.蛇影DOT存在判定()) {
      当前目标DOT.push('蛇影')
    }
    if (this.模拟循环.技能类实例集合?.百足DOT?.百足DOT存在判定()) {
      当前目标DOT.push('百足')
    }
    if (this.模拟循环.技能类实例集合?.蟾啸DOT?.蟾啸DOT存在判定()) {
      当前目标DOT.push('蟾啸')
    }
    if (this.模拟循环.技能类实例集合?.释灵DOT?.释灵DOT存在判定()) {
      当前目标DOT.push('释灵')
    }
    return 当前目标DOT
  }

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1,
    DOT跳数: number | undefined = undefined,
  ) {
    // 判断玉枕
    const 增益列表 = [...额外增益列表]
    const 快照检测Buff列表 = this.获取DOT快照检测Buff列表(伤害名称)

    // if (
    //   this.模拟循环?.当前自身buff列表?.['牧云']?.当前层数 &&
    //   !增益列表?.some((item) => item?.includes('牧云'))
    // ) {
    //   增益列表.push(`牧云·${this.模拟循环?.当前自身buff列表?.['牧云']?.当前层数}`)
    // }

    // if (
    //   this.模拟循环?.当前自身buff列表?.['夜征']?.当前层数 &&
    //   伤害名称?.includes('DOT') &&
    //   !增益列表?.some((item) => item?.includes('夜征_常驻'))
    // ) {
    //   增益列表.push('夜征_常驻')
    // }
    // 当前技能数据?.宠物伤害
    this.模拟循环.技能造成伤害?.(
      伤害名称,
      伤害次数,
      增益列表,
      触发伤害时间,
      false,
      技能等级,
      快照检测Buff列表,
      DOT跳数,
    )
  }

  所有DOT触发一跳() {
    this.模拟循环.技能类实例集合?.蛇影DOT?.额外生效一跳()
    this.模拟循环.技能类实例集合?.百足DOT?.额外生效一跳()
    this.模拟循环.技能类实例集合?.蟾啸DOT?.额外生效一跳()
    // this.模拟循环.技能类实例集合?.释灵DOT?.额外生效一跳()
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
