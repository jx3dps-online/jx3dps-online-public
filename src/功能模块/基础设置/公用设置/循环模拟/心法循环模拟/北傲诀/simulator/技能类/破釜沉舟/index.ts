import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 破釜沉舟 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '破釜沉舟')
  }

  释放() {
    if (this.模拟循环.角色状态信息.狂意 < this.获取消耗数量()) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }

  获取消耗数量() {
    const Buff列表 = this.模拟循环.当前自身buff列表
    return Buff列表.斩狂枭 || Buff列表.橙武破釜沉舟 ? 0 : this.技能数据.消耗数量!
  }

  技能释放后更新运行数据() {
    if (!this.模拟循环.当前自身buff列表.橙武破釜沉舟) super.技能释放后更新运行数据()
  }

  命中() {
    this.模拟循环.变更资源('狂意', -this.获取消耗数量(), '破釜沉舟')
    this.模拟循环.开始战斗()
    if (this.模拟循环.当前自身buff列表.斩狂枭) this.重置调息时间()
    if (this.模拟循环.奇穴.includes('冥鼓'))
      this.模拟循环.添加buff({ 名称: '冥鼓无视', 对象: '自身' })
  }

  造成伤害() {
    this.触发伤害行为('破釜沉舟')
    if (this.模拟循环.当前自身buff列表.斩狂枭) this.触发伤害行为('楚歌', 1, [], undefined, 3)
    const 橙武 = this.模拟循环.当前自身buff列表.橙武破釜沉舟
    if (橙武) {
      this.触发伤害行为('背水沉舟')
      this.模拟循环.技能类实例集合['沉舟(DOT)'].获得和刷新沉舟()
      this.模拟循环.卸除buff({
        名称: '橙武破釜沉舟',
        对象: '自身',
        buff刷新时间: 橙武.刷新时间,
      })
    }
  }
}

export default 破釜沉舟
