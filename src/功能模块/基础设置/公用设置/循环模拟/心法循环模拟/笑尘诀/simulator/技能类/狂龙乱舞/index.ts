import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 狂龙乱舞 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '狂龙乱舞')!
  技能名称 = '狂龙乱舞'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(-this.模拟循环.获取内力消耗(狂龙乱舞.技能数据), this.技能名称)
    this.模拟循环.技能类实例集合.灼烧?.提前结算灼烧()
  }

  造成伤害() {
    ;['一', '二', '三', '四'].forEach((段, 索引) =>
      this.登记伤害('狂龙乱舞·' + 段, [13, 16, 19, 22][索引]),
    )
  }

  释放后() {
    this.触发苍龙()
  }
}

export default 狂龙乱舞
