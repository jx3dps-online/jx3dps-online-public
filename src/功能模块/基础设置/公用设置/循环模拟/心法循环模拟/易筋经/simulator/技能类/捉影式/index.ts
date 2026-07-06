import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 捉影式 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '捉影式')
  剩余正念次数 = 0

  constructor(模拟循环) {
    super(模拟循环)
    捉影式.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '捉影式')
    this.初始化技能运行数据()
  }

  命中() {
    this.回复禅那('捉影式', 1)
    this.保存释放记录('捉影式')
    if (this.剩余正念次数 > 0) {
      this.剩余正念次数 = this.剩余正念次数 - 1
      this.重置调息时间()
    }
  }

  恢复正念次数() {
    this.剩余正念次数 = 1
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['擒龙', '风特效_快照', '金刚日轮']),
    }
  }
}

export default 捉影式

export const 捉影式类型 = typeof 捉影式
