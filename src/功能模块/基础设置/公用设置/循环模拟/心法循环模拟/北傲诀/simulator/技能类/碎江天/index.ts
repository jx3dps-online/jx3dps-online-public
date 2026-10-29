import 技能统一类 from '../../通用类/技能统一类'
import { ERROR_ACTION } from '../../utils'

class 碎江天 extends 技能统一类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '碎江天')
  }

  释放() {
    if (!this.模拟循环.当前自身buff列表.碎江天机会)
      return { 可以释放: false, 异常信息: ERROR_ACTION.BUFF错误 }
    if (this.模拟循环.角色状态信息.刀魂 < this.技能数据.消耗数量!) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }
  命中() {
    this.模拟循环.变更资源('刀魂', -this.技能数据.消耗数量!, '碎江天')
    this.模拟循环.开始战斗()
    this.模拟循环.卸除buff({ 名称: '碎江天机会', 对象: '自身' })
  }

  造成伤害() {
    this.触发伤害行为('碎江天')
    if (
      this.模拟循环.校验奇穴是否存在('碎影') &&
      this.模拟循环.技能类实例集合['闹须弥(DOT)'].获取当前DOT层数()
    )
      this.触发伤害行为('碎影')
  }
}

export default 碎江天
