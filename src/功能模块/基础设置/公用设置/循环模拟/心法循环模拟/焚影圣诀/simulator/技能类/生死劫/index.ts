import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'
import type { 循环基础技能数据类型 } from '../../type'
class 生死劫 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '生死劫')

  constructor(模拟循环) {
    super(模拟循环)
  }
  释放(当前技能?: 循环基础技能数据类型) {
    const 指定颜色 = 当前技能?.技能名称.split('·')[1]
    const 满灵 = this.模拟循环.角色状态信息.满灵
    return 满灵 && (!指定颜色 || 满灵 === 指定颜色)
      ? { 可以释放: true }
      : { 可以释放: false, 异常信息: ERROR_ACTION.满灵不足 }
  }
  命中() {
    this.模拟循环.技能类实例集合.赤日轮.当前段数 = 0
    this.模拟循环.技能类实例集合.幽月轮.当前段数 = 0
    this.消耗满灵(true)
  }
  造成伤害() {
    this.保存释放记录()
    const 颜色 = this.本次消耗满灵!
    this.触发伤害行为('生死劫·' + 颜色, 1)
    this.触发伤害行为('通用武伤', 1, [], undefined, false, 颜色 === '日' ? 3 : 4)
    this.诛邪镇魔(true)
    if (this.模拟循环.校验奇穴是否存在('靡业报劫'))
      this.模拟循环.技能类实例集合['靡业报劫' + 颜色].获得和刷新()
  }
  释放后() {
    this.满灵技能结束()
  }
  保存释放记录() {
    const 实际伤害技能 = '生死劫·' + this.本次消耗满灵
    this.本次释放记录 = {
      实际伤害技能,
      伤害段数: 1,
      重要buff列表: this.模拟循环.获取伤害增益列表(实际伤害技能),
      特殊标记: this.本次消耗满灵,
    }
  }
}
export default 生死劫
