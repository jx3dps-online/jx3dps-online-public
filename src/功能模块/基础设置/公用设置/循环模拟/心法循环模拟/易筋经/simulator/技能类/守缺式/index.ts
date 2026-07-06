import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 守缺式 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '守缺式')

  constructor(模拟循环) {
    super(模拟循环)
    守缺式.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '守缺式')
    this.初始化技能运行数据()
  }

  释放前初始化() {
    const 当前技能 = this.模拟循环.技能基础数据?.find((item) => item.技能名称 === '守缺式')
    if (this.模拟循环.当前自身buff列表?.无诤?.当前层数) {
      this.获得一层拿云()
    }
    if (当前技能) {
      当前技能.技能GCD组 = this.是否处于小飞棍减CD模式() ? '小飞棍' : '公共'
    }
  }

  命中() {
    this.触发伤害行为('守缺式', 1)

    this.身意触发()

    this.回复禅那('守缺式', 1)
    if (this.模拟循环.当前自身buff列表?.橙武?.当前层数) {
      this.重置调息时间()
    }

    this.概率触发拿云()

    this.保存释放记录('守缺式')
  }

  刷新自身CD() {
    this.更新技能运行数据({ 待充能时间点: [] })
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      造成buff数据: this.获取施加重要buff信息('身意') || undefined,
      重要buff列表: this.获取当前重要buff列表(['擒龙', '风特效_快照', '金刚日轮']),
    }
  }
}

export default 守缺式

export const 守缺式类型 = typeof 守缺式
