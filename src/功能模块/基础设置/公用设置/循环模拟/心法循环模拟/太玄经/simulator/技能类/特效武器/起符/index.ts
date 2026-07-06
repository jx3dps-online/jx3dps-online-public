import 循环模拟技能基础数据 from '../../../../constant/skill'
import { 每秒郭氏帧 } from '@/数据/常量'
import 特效统一类 from '../特效统一类'
import { 待生效事件 } from '../../../type'
import { ERROR_ACTION } from '../../../utils'

class 起符 extends 特效统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '起符')
  static 读条时间 = 每秒郭氏帧 * 2.5
  // 临时变量存储起符快照的buff列表
  constructor(模拟循环) {
    super(模拟循环)
    起符.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '起符')
  }

  获取读条时间() {
    this.保存释放记录('起符')

    return 起符.读条时间
  }

  释放() {
    if (!this.模拟循环.当前自身buff列表?.['麒麟']?.当前层数) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
  }

  读条(读条开始时间) {
    const 待生效事件队列: 待生效事件[] = []
    待生效事件队列.push({
      事件名称: '技能读条',
      事件时间: 读条开始时间 + 起符.读条时间,
      事件备注: {
        技能名称: '起符',
      },
    })
    this.模拟循环.添加待生效事件队列(待生效事件队列)
  }

  // 读条命中，起符本身不造成伤害，仅完成读条
  读条命中() {
    if (起符.技能数据) {
      this.模拟循环?.技能释放后更新运行数据?.(起符.技能数据, this)
    }
    this.模拟循环.添加buff({ 名称: '起符', 对象: '自身' })
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

export default 起符

export const 起符类型 = typeof 起符
