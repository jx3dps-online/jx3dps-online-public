import 技能统一类 from '../../通用类/技能统一类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 龙腾五岳 extends 技能统一类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '龙腾五岳')!
  技能名称 = '龙腾五岳'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(-this.模拟循环.获取内力消耗(龙腾五岳.技能数据), this.技能名称)
    this.模拟循环.技能类实例集合.蛟龙翻江?.更新连招Buff()
  }

  造成伤害() {
    this.登记伤害('龙腾五岳', 1)
  }

  释放后() {
    this.触发苍龙()
  }
}

export default 龙腾五岳
