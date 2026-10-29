import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 烽河 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '烽河')
  }

  释放() {
    if (!this.模拟循环.校验奇穴是否存在('烽河')) {
      return { 可以释放: false, 异常信息: { 信息: '未启用奇穴：烽河' } }
    }
    if (this.模拟循环.角色状态信息.气劲 < this.技能数据.消耗数量!) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.变更资源('气劲', -this.技能数据.消耗数量!, '烽河')
    this.模拟循环.开始战斗()
    // 实战确认共5跳：造成伤害立即1跳，随后每16帧1跳，共4次。
    this.模拟循环.添加待生效事件队列(
      Array.from({ length: 4 }, (_, i) => ({
        事件名称: '烽河持续伤害',
        事件时间: this.模拟循环.当前时间 + (i + 1) * 16,
        事件备注: { 技能名称: this.技能数据.技能名称 },
      })),
    )
  }

  造成伤害() {
    const 蓄势层数 = this.模拟循环.当前自身buff列表.蓄势?.当前层数
    this.触发伤害行为('烽河', 1, 蓄势层数 ? [`蓄势·${蓄势层数}`] : [])
  }
}

export default 烽河
