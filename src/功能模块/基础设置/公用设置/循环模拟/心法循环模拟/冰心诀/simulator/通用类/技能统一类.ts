import 获取快照增益 from '@/心法模块/统一数据/快照增益'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环主类类型 from '../main'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'

class 技能统一类 {
  模拟循环: 循环主类类型 = {} as any
  本次释放记录: 技能释放记录结果 = {}
  本次释放延迟: number | 'GCD' = 0
  枕上待触发 = false

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
    this.枕上待触发 = false
  }

  获取DOT快照检测Buff列表(伤害名称) {
    if (伤害名称?.includes('DOT')) {
      const 快照增益 = 获取快照增益()
      return [
        '繁音急节',
        '嗔怒',
        '元君',
        '剑舞长空',
        '化冰',
        '满堂·1',
        '满堂·2',
        '满堂·3',
        '满堂·4',
        '满堂·5',
      ].concat(快照增益.map((item) => item.增益名称))
    } else {
      return []
    }
  }

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1,
    排除实时增益: string[] = [],
  ) {
    const 增益列表 = [...额外增益列表]
    const 快照检测Buff列表 = this.获取DOT快照检测Buff列表(伤害名称).concat(排除实时增益)

    this.模拟循环.技能造成伤害?.(
      伤害名称,
      伤害次数,
      增益列表,
      触发伤害时间,
      false,
      技能等级,
      快照检测Buff列表,
    )
    if (
      ['玳弦急曲·2', '剑气长江', '剑破虚空', '剑影留痕'].includes(伤害名称) ||
      伤害名称.startsWith('留芳仙姿·')
    ) {
      this.标记枕上触发()
    }
  }

  标记枕上触发() {
    if (this.模拟循环.校验奇穴是否存在('枕上')) {
      this.枕上待触发 = true
    }
  }

  结算枕上触发() {
    if (this.枕上待触发) {
      // 保留确定性触发；同次命中的伤害与挂DOT先结算，不追溯新获得的枕上。
      this.模拟循环.添加buff({ 名称: '枕上', 对象: '自身' })
      this.模拟循环.获取实际加速值()
      this.枕上待触发 = false
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
    return [...new Set([...重要buff列表, '风特效_快照'])]
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

  新增钗燕层数(技能名称: string) {
    if (!this.模拟循环.校验奇穴是否存在('钗燕')) return
    const 记录 = this.模拟循环.角色状态信息.钗燕技能记录
    if (记录[技能名称] !== undefined) {
      this.模拟循环.清除钗燕计数(技能名称 === '江海凝光')
      return
    }
    记录[技能名称] = this.模拟循环.当前时间 + 每秒郭氏帧 * 60
    this.模拟循环.添加buff({ 名称: '钗燕', 对象: '自身' })
    if (Object.keys(记录).length === 3) {
      this.模拟循环.清除钗燕计数()
      if (技能名称 === '玳弦急曲') {
        // 23089在通道开始时获得，伤害脚本末尾消耗，不参与下一轮计数。
        this.模拟循环.添加buff({ 名称: '玳弦钗燕', 对象: '自身' })
      } else {
        this.结算钗燕伤害()
      }
    }
  }

  结算钗燕伤害() {
    this.触发伤害行为('钗燕', 1)
    this.模拟循环.技能类实例集合.急曲.获得和刷新急曲('钗燕')
  }

  消耗盈袖(技能等级: number) {
    const 盈袖 = this.模拟循环.当前目标buff列表.盈袖
    if (盈袖?.当前层数) {
      this.触发伤害行为('盈袖', 1, [], undefined, 技能等级)
      this.模拟循环.卸除buff({
        名称: '盈袖',
        对象: '目标',
        卸除层数: 1,
        buff刷新时间: 盈袖.刷新时间,
      })
    }
  }

  回复剑舞(层数 = 1) {
    this.模拟循环.角色状态信息.剑舞 += 层数
    this.模拟循环.角色状态信息.剑舞 = Math.min(this.模拟循环.角色状态信息.剑舞, 5)
  }

  获取当前快照buff(类型 = 'DOT') {
    const buff列表: string[] = []
    buff列表.push('相使')
    return buff列表
    console.log('类型', 类型)
  }
}

export default 技能统一类
