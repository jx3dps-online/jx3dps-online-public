import { 获取实际技能数据 } from '../../../通用/通用函数'
import 循环主类类型 from '../main'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'

class 技能统一类 {
  模拟循环: 循环主类类型 = {} as any
  本次释放记录: 技能释放记录结果 = {}
  本次释放延迟: number | 'GCD' = 0


  constructor(模拟循环:any) {
    this.模拟循环 = 模拟循环
    return
  }

  检查GCD(索引:any, 当前技能?: 循环基础技能数据类型) {
    const 后一个技能 = this.模拟循环?.测试循环?.[索引 + 1]
    const GCD组 = 当前技能?.技能GCD组 === '自身' ? 当前技能?.技能名称 : 当前技能?.技能GCD组 || ''
    let GCD = this.模拟循环?.GCD组?.[GCD组] || 0
    let 等待GCD = 0
    let 释放延迟判定 = this.本次释放延迟
    if (当前技能?.技能名称 && ['触发橙武', '心无旁骛','扬威']?.includes(当前技能?.技能名称)) {
      释放延迟判定 = 'GCD'
    }

    if (释放延迟判定) {
      if (GCD组 === '公共') {
        GCD = GCD + 释放延迟判定
      }
      // 如果存在后面的技能，判断后面的技能当前的GCD为多少，推进到后一个技能。这样可以让灭卡在后面的技能释放前释放
      else if (释放延迟判定 === 'GCD' && 后一个技能) {
        const 后一个技能实际名称 = 获取实际技能数据(后一个技能)?.实际技能名称
        const 当前技能 = this?.模拟循环?.技能基础数据?.find(
          (item) => item?.技能名称 === 后一个技能实际名称
        )
        if (当前技能 && 当前技能?.技能GCD组) {
          const 延迟等待 = this.模拟循环?.当前时间 ? this.模拟循环?.网络延迟 : 0

          if (当前技能?.技能GCD组 !== ('自身' as any)) {
            const 技能实例 = this?.模拟循环?.技能类实例集合?.[当前技能?.技能名称]
            const 后一个技能GCD = this.模拟循环?.检查GCD?.(当前技能, 技能实例, 索引 + 1) || 0
            等待GCD = Math.max(后一个技能GCD - 延迟等待, 0)
          } else {
            const 再下一个技能实际名称 = 获取实际技能数据(
              this.模拟循环?.测试循环?.[索引 + 2]
            )?.实际技能名称
            const 再下一个技能 = this?.模拟循环?.技能基础数据?.find(
              (item) => item?.技能名称 === 再下一个技能实际名称
            )
            if (再下一个技能 && 再下一个技能?.技能GCD组 !== ('自身' as any)) {
              const 技能实例 = this?.模拟循环?.技能类实例集合?.[再下一个技能?.技能名称]
              const 后一个技能GCD = this.模拟循环?.检查GCD?.(再下一个技能, 技能实例, 索引 + 2) || 0
              等待GCD = Math.max(后一个技能GCD - 延迟等待, 0)
            }
          }
        }
      } else {
        等待GCD = Number(释放延迟判定)
      }
      if (等待GCD) {
        GCD = Math.max(等待GCD, GCD)
      }
    }
    this.本次释放延迟 = 0
    return GCD
  }

  释放前初始化(额外信息:any) {
    if (额外信息?.延迟) {
      this.本次释放延迟 = 额外信息?.延迟
    }
    // 重置释放记录
    this.本次释放记录 = {}
  }

  触发伤害行为(
    伤害名称:any,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1
  ) {
    const 增益列表 = [...额外增益列表]
    const 快照检测Buff列表 = this.获取DOT快照检测Buff列表(伤害名称)
    this.触发BUFF()
    this.鬼斧弹药检测(伤害名称)
    this.模拟循环.技能造成伤害?.(
      伤害名称,
      伤害次数,
      增益列表,
      触发伤害时间,
      false,
      技能等级,
      // 快照检测Buff列表
    )
  }

  鬼斧弹药检测(伤害名称: any){
    if (伤害名称.includes('连弩')) {
      const 鬼斧弹药层数 = this.模拟循环.当前自身buff列表?.['鬼斧弹药']?.当前层数 || 0
      return 鬼斧弹药层数 > 0 ? '连弩·二' : '连弩·一'
    } else if (伤害名称.includes('重弩')) {
      const 鬼斧弹药层数 = this.模拟循环.当前自身buff列表?.['鬼斧弹药']?.当前层数 || 0
      return 鬼斧弹药层数 > 0 ? '重弩·二' : '重弩·一'
    }
    return 伤害名称
  }

  触发BUFF() {
    if (this?.模拟循环?.校验奇穴是否存在('秋风散影')) {
        this.模拟循环?.添加buff({ 名称: '秋风散影', 对象: '自身' })
    }
    if (this?.模拟循环?.校验奇穴是否存在('曙色催寒')) {
      this.模拟循环?.添加buff({ 名称: '催寒', 对象: '自身' })
    }
    if (this?.模拟循环?.校验奇穴是否存在('弩击急骤')) {
      this.模拟循环?.添加buff({ 名称: '弩心', 对象: '自身' })
    }
  }

  获取DOT快照检测Buff列表(伤害名称: any) {
    if (伤害名称?.includes('DOT') || !(伤害名称?.includes('暗藏杀机') || 伤害名称?.includes('天绝地灭'))) {
      return ['心无旁骛', '扬威', '神机好穷内攻增伤', '秋风散影','催寒','气魄','弩心']
    } else if(伤害名称?.includes('暗藏杀机') || 伤害名称?.includes('天绝地灭')){
      return ['心无旁骛', '扬威', '神机好穷内攻增伤','神机好穷陷阱增伤', '秋风散影','催寒','气魄','弩心']
    }
    else {
      return []
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

  获取施加重要buff信息(buff名称: string) {
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
    if (this?.模拟循环?.当前自身buff列表?.['心无旁骛']?.当前层数) {
      buff列表.push('心无旁骛')
    }
    if (this?.模拟循环?.当前自身buff列表?.['扬威']?.当前层数) {
      buff列表.push('扬威')
    }
    if (this?.模拟循环?.当前自身buff列表?.['秋风散影']?.当前层数) {
      buff列表.push(`秋风散影`)
    }
    if (this?.模拟循环?.当前自身buff列表?.['神机好穷内攻增伤']?.当前层数) {
      buff列表.push(`神机好穷内攻增伤`)
    }
    if (this?.模拟循环?.当前自身buff列表?.['催寒']?.当前层数) {
      buff列表.push(`催寒`)
    }
    if (this?.模拟循环?.当前自身buff列表?.['气魄']?.当前层数) {
      buff列表.push(`气魄·${this?.模拟循环?.当前自身buff列表?.['气魄']?.当前层数}`)
    }
    if (this?.模拟循环?.当前自身buff列表?.['弩心']?.当前层数) {
      buff列表.push(`弩心`)
    }
    return buff列表
  }
}

export default 技能统一类
