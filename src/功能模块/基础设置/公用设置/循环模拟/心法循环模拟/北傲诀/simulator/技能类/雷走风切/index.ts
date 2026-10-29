import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 雷走风切 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '雷走风切')
  }

  命中() {
    this.模拟循环.开始战斗()
  }

  造成伤害() {
    this.触发伤害行为('雷走风切')
  }
}

export default 雷走风切
