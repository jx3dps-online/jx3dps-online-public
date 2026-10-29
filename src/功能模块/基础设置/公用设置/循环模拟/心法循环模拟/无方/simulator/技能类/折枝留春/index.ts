import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 循环基础技能数据类型 } from '../../type'
import { ERROR_ACTION } from '../../utils'

class 折枝留春 extends 有CD技能通用类 {
  检查GCD(索引, 当前技能?: 循环基础技能数据类型) {
    return Math.max(super.检查GCD(索引, 当前技能), this.模拟循环.GCD组['折枝拂露'] || 0)
  }

  释放() {
    if (!this.模拟循环.校验奇穴是否存在('折枝拂露')) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.折枝奇穴 }
    }
    if (!this.模拟循环.当前自身buff列表['折枝留春']?.当前层数) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.BUFF错误 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.本次释放记录 = {
      实际伤害技能: '折枝留春',
      重要buff列表: this.获取当前重要buff列表(['相使']),
    }
    this.模拟循环.卸除buff({ 名称: '折枝留春', 对象: '自身' })
    this.模拟循环.添加待生效事件队列([
      { 事件名称: '折枝留春伤害', 事件时间: this.模拟循环.当前时间 + 8 },
    ])
  }

  延迟命中() {
    this.触发伤害行为('折枝留春')
  }
}

export default 折枝留春
