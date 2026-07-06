import 循环模拟技能基础数据 from '../../../../constant/skill'
import { 每秒郭氏帧 } from '@/数据/常量'
import 特效统一类 from '../特效统一类'
import { 待生效事件 } from '../../../type'
import { ERROR_ACTION } from '../../../utils'

class 化卦坠符 extends 特效统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '化卦坠符')
  constructor(模拟循环) {
    super(模拟循环)
    化卦坠符.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '化卦坠符')
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

  // 读条命中，起符本身不造成伤害，仅完成读条
  命中() {
    if (this.特效NPC存活判定()) {
      // 有山立刻触发
      if (!!this.模拟循环.当前自身buff列表?.['卦象_山艮']?.当前层数) {
        this.触发伤害()
      } else {
        // 梅山添加buff，buff期间获得山时触发
        this.模拟循环.添加buff({ 名称: '化卦坠符', 对象: '自身' })
      }
    } else {
      this.释放结束()
    }
  }

  触发伤害() {
    if (!this.模拟循环.当前自身buff列表?.['麒麟']?.当前层数) {
      return
    }
    this.化卦坠符伤害()
    this.释放结束()
  }

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

export default 化卦坠符

export const 化卦坠符类型 = typeof 化卦坠符
