import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 时乘六龙 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '时乘六龙')!
  技能名称 = '时乘六龙'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(-this.模拟循环.获取内力消耗(时乘六龙.技能数据), this.技能名称)
    this.模拟循环.添加buff({ 名称: '狂龙乱舞', 对象: '自身' })
  }

  造成伤害() {
    this.登记伤害('时乘六龙', 8)
  }
  释放后() {
    this.触发苍龙()
  }
}

export default 时乘六龙
