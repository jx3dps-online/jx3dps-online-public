import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 获取实际帧数 } from '@/工具函数/data'

class 刀啸风吟 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '刀啸风吟')
  }

  释放() {
    if (this.模拟循环.角色状态信息.气劲 < this.技能数据.消耗数量!) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.变更资源('气劲', -this.技能数据.消耗数量!, '刀啸风吟')
    this.模拟循环.开始战斗()
  }

  读条时间() {
    return Math.max(1, 获取实际帧数(24, this.模拟循环.加速值))
  }

  读条(开始时间: number) {
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: '刀啸技能读条',
        事件时间: 开始时间 + this.读条时间(),
        事件备注: { 技能名称: this.技能数据.技能名称 },
      },
    ])
  }

  读条伤害() {
    const 蓄势层数 = this.模拟循环.当前自身buff列表.蓄势?.当前层数
    this.触发伤害行为('刀啸风吟', 1, 蓄势层数 ? [`蓄势·${蓄势层数}`] : [])
    if (this.模拟循环.奇穴.includes('绝期')) this.模拟循环.添加buff({ 名称: '绝期', 对象: '自身' })
  }
}

export default 刀啸风吟
