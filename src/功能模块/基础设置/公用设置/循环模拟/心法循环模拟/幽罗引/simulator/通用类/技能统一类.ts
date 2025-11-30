import { 每秒郭氏帧 } from '@/数据/常量'
import 循环主类类型 from '../main'
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
      if (GCD组 === '公共' || GCD组 === '傀儡') {
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

  回复心络(来源: string, 回复数量) {
    const 变化后心络 = Math.min(100, this.模拟循环.角色状态信息.心络 + 回复数量)
    this.模拟循环.角色状态信息.心络 = 变化后心络
    this.模拟循环?.添加战斗日志({
      日志: `${来源}回复心络【${回复数量}】心络变为${变化后心络}`,
      日志类型: '自身buff变动',
      日志时间: this.模拟循环?.当前时间,
    })
  }

  消耗心络(来源: string, 消耗数量) {
    const 变化后心络 = Math.max(0, this.模拟循环.角色状态信息.心络 - 消耗数量)
    this.模拟循环.角色状态信息.心络 = 变化后心络
    this.模拟循环?.添加战斗日志({
      日志: `${来源}消耗心络【${消耗数量}】心络变为${变化后心络}`,
      日志类型: '自身buff变动',
      日志时间: this.模拟循环?.当前时间,
    })
    const 寄线次数 = Math.floor(消耗数量 / 10)
    // const 当前时间 = this.模拟循环.当前时间
    // const 目标寄线层数 = this.模拟循环.当前目标buff列表?.['寄线']?.当前层数 || 0
    // this.模拟循环.技能造成伤害?.('寄线', 寄线次数, [`寄线·${目标寄线层数}`])
    this.模拟循环.技能造成伤害?.('寄线', 寄线次数, [])
    this.模拟循环.技能造成伤害?.('破', 寄线次数)
    // this.模拟循环.添加buff?.({ 名称: '寄线', 对象: '目标' })
    // this.模拟循环.添加待生效事件队列([{
    //   事件名称: '寄线触发',
    //   事件时间: 当前时间 + 每秒郭氏帧 * 1.5,
    //   事件备注: {
    //     寄线次数: 寄线次数,
    //   }
    // }])
  }

  获取DOT快照检测Buff列表(伤害名称) {
    if (伤害名称?.includes('DOT')) {
      return ['连环慢', '钤束',]
    } else {
      return []
    }
  }

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1
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
      快照检测Buff列表
    )
  }


  获得龙驭判定(层数 = 1) {
    if (this.模拟循环.校验奇穴是否存在('龙驭')) {
      this.模拟循环.添加buff?.({ 名称: '龙驭', 对象: '自身', 新增层数: 层数 })
    }
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
