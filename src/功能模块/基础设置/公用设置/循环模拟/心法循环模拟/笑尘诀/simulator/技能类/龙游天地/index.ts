import 技能统一类 from '../../通用类/技能统一类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 龙游天地 extends 技能统一类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '龙游天地')!
  技能名称 = '龙游天地'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(-this.模拟循环.获取内力消耗(龙游天地.技能数据), this.技能名称)
    this.模拟循环.技能类实例集合.蛟龙翻江?.更新连招Buff('龙腾五岳')
  }

  造成伤害() {
    ;['一', '二', '三'].forEach((段, 索引) => this.登记伤害('龙游天地·' + 段, 索引 + 1))
  }

  释放后() {
    this.触发苍龙()
  }
}

export default 龙游天地
