import { 获取实际技能数据 } from '../../通用函数'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../../通用框架/类型定义/技能'

class 技能统一类 {
  模拟循环: any
  本次释放记录: 技能释放记录结果 = {}
  本次释放延迟: number | 'GCD' = 0

  constructor(模拟循环) {
    this.模拟循环 = 模拟循环
    return
  }

  检查GCD(索引, 当前技能?: 循环基础技能数据类型) {
    const GCD组 = 当前技能?.技能GCD组 === '自身' ? 当前技能?.技能名称 : 当前技能?.技能GCD组 || ''
    let GCD = this.模拟循环?.GCD组?.[GCD组] || 0
    let 等待GCD = 0

    if (this.本次释放延迟) {
      if (GCD组 === '公共') {
        GCD = GCD + this.本次释放延迟
      } else if (this.本次释放延迟 === 'GCD') {
        等待GCD = this.查找下一个有效技能GCD(索引)
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

  /**
   * 从当前索引往后扫描（最多3步），找到第一个满足条件的技能并获取其GCD。
   * 用于处理"灭"等需要推进时间到后续技能GCD前释放的场景。
   * 跳过的技能：不存在、额外延迟为 'GCD'、无GCD组且无检测GCD组。
   */
  查找下一个有效技能GCD(当前索引: number): number {
    const 最大向前步数 = 5

    for (let 步数 = 1; 步数 <= 最大向前步数; 步数++) {
      const 目标技能 = this.模拟循环?.测试循环?.[当前索引 + 步数]
      if (!目标技能) continue

      const 目标技能实际数据: any = 获取实际技能数据(目标技能)

      // 延迟为 'GCD' 的技能本身也会处理 GCD 推进，跳过
      if (目标技能实际数据?.额外信息?.延迟 === 'GCD') continue

      const 目标基础技能 = this?.模拟循环?.技能基础数据?.find(
        (item) => item?.技能名称 === 目标技能实际数据?.实际技能名称,
      )

      if (目标基础技能?.技能GCD组 === ('自身' as any)) continue

      if (目标基础技能 && (目标基础技能?.技能GCD组 || 目标基础技能?.检测GCD组?.length)) {
        const 技能实例 = this?.模拟循环?.技能类实例集合?.[目标基础技能?.技能名称]
        return this.模拟循环?.检查GCD?.(目标基础技能, 技能实例, 当前索引 + 步数) || 0
      }
    }

    return 0
  }

  释放前初始化(额外信息) {
    if (额外信息?.延迟) {
      this.本次释放延迟 = 额外信息?.延迟
    }
    // 重置释放记录
    this.本次释放记录 = {}
  }

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1,
  ) {
    const 增益列表 = [...额外增益列表]
    this.模拟循环.技能造成伤害?.(伤害名称, 伤害次数, 增益列表, 触发伤害时间, false, 技能等级)
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

  获取当前快照buff() {
    const buff列表: string[] = []
    buff列表.push('相使')
    return buff列表
  }
}

export default 技能统一类
