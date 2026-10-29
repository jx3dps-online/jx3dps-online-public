import { 获取实际技能数据 } from '../../../通用/通用函数'
import 循环主类类型 from '../main'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'
class 技能统一类 {
  模拟循环: 循环主类类型
  本次释放记录: 技能释放记录结果 = {}
  本次释放延迟: number | 'GCD' = 0
  constructor(模拟循环: 循环主类类型) {
    this.模拟循环 = 模拟循环
  }
  检查GCD(索引, 当前技能?: 循环基础技能数据类型) {
    const GCD组 = 当前技能?.技能GCD组 === '自身' ? 当前技能?.技能名称 : 当前技能?.技能GCD组 || ''
    let GCD = this.模拟循环?.GCD组?.[GCD组] || 0
    let 等待GCD = 0

    if (this.本次释放延迟) {
      if (GCD组 === '公共' && typeof this.本次释放延迟 === 'number') {
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

      if (目标基础技能?.技能GCD组 === '自身') continue

      if (目标基础技能 && 目标基础技能?.技能GCD组) {
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
  获取技能释放记录结果() {
    return {
      ...this.本次释放记录,
    }
  }
  触发伤害行为(
    伤害名称: string,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1,
    排除实时增益: string[] = [],
  ) {
    this.模拟循环.技能造成伤害(
      伤害名称,
      伤害次数,
      额外增益列表,
      触发伤害时间,
      false,
      技能等级,
      排除实时增益,
    )
  }
}
export default 技能统一类
