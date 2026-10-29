import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 龙战于野 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '龙战于野')!
  技能名称 = '龙战于野'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(-this.模拟循环.获取内力消耗(龙战于野.技能数据), this.技能名称)
    if (this.模拟循环.大橙武模拟) {
      this.触发伤害行为('龙战于野·神兵', 512 / 1024)
    }
  }

  造成伤害() {
    const 延迟 = this.模拟循环.当前自身buff列表.逍遥 ? [3, 9, 14] : [0, 0, 0]
    ;['一', '二', '三'].forEach((段, 索引) => this.登记伤害('龙战于野·' + 段, 延迟[索引]))
  }
  释放后() {
    this.触发苍龙()
  }
}

export default 龙战于野
