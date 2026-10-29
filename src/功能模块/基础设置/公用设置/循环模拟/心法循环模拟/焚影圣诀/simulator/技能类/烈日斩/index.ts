import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
class 烈日斩 extends 有CD技能通用类 {
  技能等级 = 32
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '烈日斩')

  constructor(模拟循环) {
    super(模拟循环)
  }
  命中() {
    this.模拟循环.技能类实例集合.赤日轮.当前段数 = 0
    this.模拟循环.技能类实例集合.幽月轮.当前段数 = 0
    this.回复灵力(40, 0, '烈日斩')
    this.添加储备('日')
  }
  造成伤害() {
    this.保存释放记录()
    this.触发伤害行为('烈日斩')
    this.触发伤害行为('通用武伤', 1, [], undefined, false, 2)
    this.模拟循环.添加buff({ 名称: '烈日', 对象: '目标' })
  }
  保存释放记录() {
    const 实际伤害技能 = '烈日斩'
    this.本次释放记录 = {
      实际伤害技能,
      伤害段数: 1,
      重要buff列表: this.模拟循环.获取伤害增益列表(实际伤害技能),
    }
  }
}
export default 烈日斩
