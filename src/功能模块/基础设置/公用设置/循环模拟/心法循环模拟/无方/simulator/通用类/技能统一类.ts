import 循环主类类型 from '../main'
import { 循环基础技能数据类型, 技能释放记录结果 } from '../type'
import 沾衣未妨 from '../技能类/沾衣未妨'

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

  触发伤害行为(
    伤害名称,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    触发伤害时间: number | undefined = undefined,
    技能等级 = 1,
  ) {
    // 判断玉枕
    const 增益列表 = [...额外增益列表]
    const 快照检测Buff列表 = this.获取DOT快照检测Buff列表(伤害名称)
    // 当前技能数据?.宠物伤害
    //if (
    //this.模拟循环.校验奇穴是否存在('凄骨') &&
    //!增益列表?.some((item) => item?.includes('凄骨'))
    //) {
    //增益列表.push('凄骨')
    //}
    if (
      this.模拟循环.校验奇穴是否存在('养荣') &&
      !增益列表?.some((item) => item?.includes('养荣'))
    ) {
      增益列表.push('养荣')
    }
    this.模拟循环.技能造成伤害?.(
      伤害名称,
      伤害次数,
      增益列表,
      触发伤害时间,
      false,
      技能等级,
      快照检测Buff列表,
    )
  }

  获取DOT快照检测Buff列表(伤害名称) {
    if (伤害名称?.includes('DOT')) {
      return this.获取当前快照buff()
    } else {
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
    if (this.模拟循环.当前自身buff列表?.['千枝绽蕊']?.当前层数) {
      重要buff列表.push('千枝绽蕊')
    }
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

  温寒文案 = (值) => {
    return 值 > 0 ? '温' : '寒'
  }

  /**
   * @name 改变温寒
   * @param 变更值 -1获得寒性 +1 获得温性
   * @description 温寒值范围为[-5, 5]
   */
  改变温寒(变更值, 来源) {
    const 当前温寒 = this.模拟循环?.角色状态信息?.温寒
    let 本次中和触发炮阳 = false
    if (this.模拟循环.校验奇穴是否存在('炮阳') && 当前温寒 < 0) {
      本次中和触发炮阳 = true
    }
    let 本次中和触发荆障 = false
    if (this.模拟循环.校验奇穴是否存在('荆障') && 当前温寒 > 0 && 来源 === '沾衣未妨') {
      本次中和触发荆障 = true
    }
    let 目标温寒 = 当前温寒 + 变更值
    if (目标温寒 > 5) {
      目标温寒 = 5
    } else if (目标温寒 < -5) {
      目标温寒 = -5
    }
    this.模拟循环.角色状态信息.温寒 = 目标温寒

    this.模拟循环.添加战斗日志?.({
      日志: `【${来源}】触发变化【${Math.abs(变更值)}】点${this.温寒文案(变更值)}性`,
      日志类型: '技能释放结果',
    })

    this.模拟循环.添加战斗日志?.({
      日志: `温寒值变为【${Math.abs(目标温寒)}】${this.温寒文案(目标温寒)}`,
      日志类型: '技能释放结果',
    })

    const 中和次数 = this.计算中和变化(当前温寒, 变更值)

    if (中和次数) {
      this.模拟循环.添加战斗日志?.({
        日志: `【${来源}】触发【${中和次数}】次中和`,
        日志类型: '技能释放结果',
      })
      for (let i = 0; i < 中和次数; i++) {
        if (本次中和触发炮阳) {
          this.触发伤害行为('无方中和', 1, ['炮阳'])
        } else {
          this.触发伤害行为('无方中和')
          this?.模拟循环?.回复内力(0.25)
          this.触发伤害行为('破', 1, [], undefined, 2)
        }
        // 疾根
        if (this.模拟循环.校验奇穴是否存在('疾根')) {
          const 当前逆乱层数 = this.模拟循环?.技能类实例集合?.逆乱?.获取当前DOT层数?.() || 0
          if (当前逆乱层数 >= 4) {
            this.触发伤害行为('疾根')
          }
        }
        this.模拟循环.技能类实例集合?.逆乱?.获得和刷新逆乱?.()
        if (this.模拟循环.当前自身buff列表?.['紫伏']?.当前层数) {
          this.触发伤害行为('紫伏')
        }
        // 千枝
        if (this.模拟循环.当前自身buff列表?.['千枝绽蕊']?.当前层数) {
          this.触发伤害行为('无方中和')
          this?.模拟循环?.回复内力(0.25)
          this.触发伤害行为('破', 1, [], undefined, 2)
          if (this.模拟循环.校验奇穴是否存在('疾根')) {
            this.触发伤害行为('疾根')
          }
          if (this.模拟循环.当前自身buff列表?.['紫伏']?.当前层数) {
            this.触发伤害行为('紫伏')
          }
        }
        //荆障
        if (本次中和触发荆障 && this.模拟循环.当前自身buff列表?.['苍棘缚地']?.当前层数) {
          this.触发伤害行为('荆障')
        }
      }
    }
  }

  /**
   * @name 计算中和变化
   * @description 根据中和变化差值计算触发中和次数
   */
  计算中和变化(当前温寒, 变更值) {
    if (当前温寒 * 变更值 >= 0) return 0
    return Math.min(Math.abs(当前温寒), Math.abs(变更值))
  }

  /**
   * @name 逆转温寒
   * @description 温寒值范围为[-5, 5]
   */
  逆转温寒(来源) {
    const 当前温寒 = this.模拟循环?.角色状态信息?.温寒
    const 目标温寒 = -当前温寒
    this.模拟循环.角色状态信息.温寒 = 目标温寒

    this.模拟循环.添加战斗日志?.({
      日志: `【${来源}】触发温寒逆转`,
      日志类型: '技能释放结果',
    })

    this.模拟循环.添加战斗日志?.({
      日志: `温寒值变为【${Math.abs(目标温寒)}】${this.温寒文案(目标温寒)}`,
      日志类型: '技能释放结果',
    })
  }

  获取当前快照buff(类型 = 'DOT') {
    const buff列表: string[] = ['相使']
    // buff列表.push('相使')
    return buff列表
    console.log('类型', 类型)
  }
}

export default 技能统一类
