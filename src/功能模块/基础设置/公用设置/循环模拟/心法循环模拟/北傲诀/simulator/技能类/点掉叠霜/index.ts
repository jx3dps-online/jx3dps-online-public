import 技能统一类 from '../../通用类/技能统一类'

class 点掉叠霜 extends 技能统一类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '点掉叠霜')
  }

  命中() {
    this.模拟循环.卸除buff({ 名称: '叠霜', 对象: '自身', 卸除层数: 6, 来源: '点掉叠霜' })
  }
}

export default 点掉叠霜
