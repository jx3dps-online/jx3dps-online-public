import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 待生效事件 } from '../../type'
import { 每秒郭氏帧 } from '@/数据/常量'

class 梅洒血雨 extends 有CD技能通用类 {
  // lua入口 19737
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '梅洒血雨')
  static 伤害时间 = 109 // 约6.8秒 近似值
  static 僵直时间 = 每秒郭氏帧 * 13 // 约6.8秒 近似值

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    this.模拟循环.添加战斗日志?.({
      日志: '梅洒血雨',
      日志类型: '释放技能',
    })
    // 开始读条
    this.释放梅洒血雨()
    return
  }

  释放后() {
    const 当前公共GCD组 = this.模拟循环.GCD组?.公共 || 0
    this.模拟循环.GCD组.公共 = 当前公共GCD组 + 梅洒血雨.僵直时间
  }

  释放梅洒血雨() {
    const 待生效事件: 待生效事件[] = [
      {
        事件名称: `梅洒血雨伤害`,
        事件时间: this.模拟循环.当前时间 + 梅洒血雨.伤害时间,
      },
    ]

    this.模拟循环.添加待生效事件队列(待生效事件)
    this.模拟循环.添加buff({ 名称: '梅洒血雨僵直', 对象: '自身' })
  }

  梅洒血雨伤害() {
    this.触发伤害行为('梅洒血雨')
  }

  保存释放记录(名称, 段数) {
    this.本次释放记录 = {
      伤害段数: 段数,
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['太息', '游仙', '梦悠']),
    }
  }
}

export default 梅洒血雨

export const 击水三千类型 = typeof 梅洒血雨
