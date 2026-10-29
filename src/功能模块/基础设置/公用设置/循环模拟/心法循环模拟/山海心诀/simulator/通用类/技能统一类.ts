import 循环主类类型 from '../main'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'
import { 每秒郭氏帧 } from '@/数据/常量'

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
    this.触发乘黄附伤(伤害名称, 触发伤害时间)
  }

  开启乘黄之威续期(来源: '游雾乘云' | '澄神醒梦') {
    if (!this.模拟循环.校验奇穴是否存在('佑主')) return
    const 来源状态 = this.模拟循环.当前自身buff列表[来源]
    const 开始时间 = 来源状态.刷新时间!
    this.模拟循环.获得乘黄之威(开始时间)
    this.模拟循环.添加待生效事件队列(
      Array.from({ length: 来源状态.最大持续时间! / 每秒郭氏帧 }, (_, 索引) => ({
        事件名称: '乘黄之威续期',
        事件时间: 开始时间 + (索引 + 1) * 每秒郭氏帧,
        事件备注: { 来源, 刷新时间: 开始时间 },
      })),
    )
  }

  触发乘黄附伤(来源: string, 造成时间 = this.模拟循环.当前时间) {
    // SkillEvent 3201 包含风矢，不包含贯穿、标鹄、宠物和乘黄附伤自身。
    const 乘黄状态 = this.模拟循环.当前自身buff列表['乘黄之威']
    if (
      this.模拟循环.校验奇穴是否存在('佑主') &&
      [
        '风矢',
        '劲风簇',
        '饮羽簇',
        '白虹贯日',
        '朝仪万汇',
        '聚势摧霆',
        '聚势摧霆·蓄力',
        '领胡',
      ].includes(来源) &&
      乘黄状态?.当前层数 &&
      造成时间 >= 乘黄状态.刷新时间! &&
      造成时间 <= 乘黄状态.刷新时间! + 乘黄状态.最大持续时间! &&
      造成时间 >= this.模拟循环.乘黄附伤可触发时间
    ) {
      this.模拟循环.乘黄附伤可触发时间 = 造成时间 + 每秒郭氏帧 / 2
      this.模拟循环.技能造成伤害('乘黄之威', 1, [], 造成时间)
    }
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
