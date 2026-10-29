import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
class 暗尘弥散 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '暗尘弥散')

  constructor(模拟循环) {
    super(模拟循环)
  }
  命中() {
    this.模拟循环.技能类实例集合.赤日轮.当前段数 = 0
    this.模拟循环.技能类实例集合.幽月轮.当前段数 = 0
    this.模拟循环.技能类实例集合.驱夜断愁.重置调息时间()
    this.保存释放记录()
  }
  保存释放记录() {
    this.本次释放记录 = {}
  }
}
export default 暗尘弥散
