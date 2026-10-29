import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 闹须弥 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '闹须弥')
  }

  释放() {
    if (this.模拟循环.角色状态信息.刀魂 < this.技能数据.消耗数量!) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.变更资源('刀魂', -this.技能数据.消耗数量!, '闹须弥')
    this.模拟循环.开始战斗()
    const 模拟 = this.模拟循环
    if (模拟.奇穴.includes('碎影')) 模拟.添加buff({ 名称: '碎江天机会', 对象: '自身' })
    模拟.技能类实例集合['闹须弥(DOT)'].获得和刷新闹须弥()
  }
}

export default 闹须弥
