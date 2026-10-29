import 循环模拟技能基础数据 from '../../../constant/skill'
import { ERROR_ACTION } from '../../utils'

import 技能统一类 from '../../通用类/技能统一类'

class 骤风劈风 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '骤风劈风')

  constructor(模拟循环) {
    super(模拟循环)
  }

  检查GCD(索引) {
    // 骤风劈的骤风劈风卡GCD释放
    const 前一个技能 = this.模拟循环?.测试循环?.[索引 - 1]
    const 后一个技能 = this.模拟循环?.测试循环?.[索引 + 1]
    let GCD = this.模拟循环?.GCD组?.['公共'] || 0

    // 如果存在后面的技能，判断后面的技能当前的GCD为多少，推进到后一个技能。这样可以让灭卡在后面的技能释放前释放
    if (后一个技能 && 前一个技能 === '风流云散' && this.模拟循环.校验奇穴是否存在('茫缈')) {
      const 当前技能 = this?.模拟循环?.技能基础数据?.find((item) => item?.技能名称 === 后一个技能)
      if (当前技能 && 当前技能?.技能GCD组) {
        const 技能实例 = this?.模拟循环?.技能类实例集合?.[当前技能?.技能名称]
        GCD = this.模拟循环?.检查GCD?.(当前技能, 技能实例, 索引 + 1) || 0
      }
      return GCD || 0
    } else {
      return 0
    }
  }

  释放() {
    if (!this.模拟循环.当前自身buff列表?.['茫缈']?.当前层数) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
  }

  命中() {
    this.模拟循环.技能类实例集合.劈风令.命中()

    this.模拟循环.卸除buff({ 名称: '茫缈', 对象: '自身' })

    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['出岫']),
    }
  }
}

export default 骤风劈风

export const 骤风劈风类型 = typeof 骤风劈风
