import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 捕风式 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '捕风式')

  constructor(模拟循环) {
    super(模拟循环)
    捕风式.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '捕风式')
    this.初始化技能运行数据()
  }

  释放前初始化() {
    const 当前技能 = this.模拟循环.技能基础数据?.find((item) => item.技能名称 === '捕风式')
    if (当前技能) {
      当前技能.技能GCD组 = this.是否处于小飞棍减CD模式() ? '小飞棍' : '公共'
    }
  }

  命中() {
    this.回复禅那('捕风式', 1)
    this.触发伤害行为('捕风式', 1)
    const 消贪层数 = this.触发贪破()
    this.概率触发拿云()
    this.保存释放记录('捕风式', 消贪层数)
  }

  保存释放记录(名称, 消贪层数) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      特殊标记: 消贪层数,
      重要buff列表: this.获取当前重要buff列表(['擒龙', '风特效_快照', '金刚日轮']),
    }
  }
}

export default 捕风式

export const 捕风式类型 = typeof 捕风式
