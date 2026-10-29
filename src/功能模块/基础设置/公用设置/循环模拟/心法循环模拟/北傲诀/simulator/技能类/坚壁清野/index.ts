import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 坚壁清野 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '坚壁清野')
  }

  释放() {
    if (this.模拟循环.角色状态信息.气劲 < this.技能数据.消耗数量!) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.变更资源('气劲', -this.技能数据.消耗数量!, '坚壁清野')
    this.模拟循环.开始战斗()
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: '坚壁清野直伤',
        事件时间: this.模拟循环.当前时间 + 2,
        事件备注: { 技能名称: this.技能数据.技能名称, 直伤: true },
      },
    ])
    this.模拟循环.添加待生效事件队列(
      Array.from({ length: 10 }, (_, i) => ({
        事件名称: '坚壁清野残留',
        事件时间: this.模拟循环.当前时间 + (i + 1) * 16,
        事件备注: { 技能名称: this.技能数据.技能名称 },
      })),
    )
  }

  延迟伤害(直伤: boolean) {
    const 蓄势层数 = this.模拟循环.当前自身buff列表.蓄势?.当前层数
    this.触发伤害行为(
      直伤 ? '坚壁清野·直伤' : '坚壁清野·残留',
      1,
      蓄势层数 ? [`蓄势·${蓄势层数}`] : [],
    )
  }
}

export default 坚壁清野
