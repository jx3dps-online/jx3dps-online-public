import 循环模拟技能基础数据 from '../../../../constant/skill'
import 特效统一类 from '../特效统一类'
import { ERROR_ACTION } from '../../../utils'

class 应卦震符 extends 特效统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '应卦震符')
  constructor(模拟循环) {
    super(模拟循环)
    应卦震符.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '应卦震符')
  }

  释放() {
    if (
      !this.模拟循环.当前自身buff列表?.['麒麟']?.当前层数 ||
      !this.模拟循环.当前自身buff列表?.['起符']?.当前层数
    ) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
  }

  // 读条命中，读条技能的伤害在这里触发
  命中() {
    if (应卦震符.技能数据) {
      this.模拟循环?.技能释放后更新运行数据?.(应卦震符.技能数据, this)
    }
    if (this.特效NPC存活判定()) {
      this.模拟循环.添加buff({ 名称: '应卦震符', 对象: '自身' })
    } else {
      this.释放结束()
    }
  }

  触发伤害() {
    if (!this.模拟循环.当前自身buff列表?.['麒麟']?.当前层数) {
      return
    }
    this.应卦震符伤害()
    this.释放结束()
  }

  // 读条技能在释放阶段不直接命中，避免重复触发
  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表([
        '荧入白',
        '祝祷',
        '鬼遁',
        '镇星',
        '明灯',
        '龙马出河',
      ]),
    }
  }
}

export default 应卦震符

export const 应卦震符类型 = typeof 应卦震符
