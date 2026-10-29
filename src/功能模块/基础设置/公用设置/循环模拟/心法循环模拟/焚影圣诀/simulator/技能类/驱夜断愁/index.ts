import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'
class 驱夜断愁 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '驱夜断愁')

  constructor(模拟循环) {
    super(模拟循环)
  }
  释放() {
    return this.模拟循环.背后攻击 || this.模拟循环.校验奇穴是否存在('明焰续夜')
      ? { 可以释放: true }
      : { 可以释放: false, 异常信息: ERROR_ACTION.方位错误 }
  }
  命中() {
    this.模拟循环.技能类实例集合.赤日轮.当前段数 = 0
    this.模拟循环.技能类实例集合.幽月轮.当前段数 = 0
    if (this.模拟循环.校验奇穴是否存在('明焰续夜')) {
      const Buff = this.模拟循环.当前自身buff列表
      if (Buff.日珥?.当前层数) this.回复灵力(40, 0, '驱夜断愁')
      else if (Buff.月芒?.当前层数) this.回复灵力(0, 40, '驱夜断愁')
    } else this.回复灵力(60, 60, '驱夜断愁')
  }
  造成伤害() {
    this.保存释放记录()
    this.触发伤害行为('驱夜断愁', 1, [], undefined, false, this.模拟循环.背后攻击 ? 58 : 29)
    this.触发伤害行为('通用武伤', 1, [], undefined, false, 9)
  }
  保存释放记录() {
    const 实际伤害技能 = '驱夜断愁'
    this.本次释放记录 = {
      实际伤害技能,
      伤害段数: 1,
      重要buff列表: this.模拟循环.获取伤害增益列表(
        实际伤害技能,
        this.模拟循环.当前时间,
        this.模拟循环.背后攻击 ? 58 : 29,
      ),
    }
  }
}
export default 驱夜断愁
