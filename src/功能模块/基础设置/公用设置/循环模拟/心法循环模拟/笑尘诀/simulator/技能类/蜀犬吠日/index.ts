import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 蜀犬吠日 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '蜀犬吠日')!
  技能名称 = '蜀犬吠日'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(this.模拟循环.校验奇穴是否存在('自强') ? 100 : 60, this.技能名称)
  }

  造成伤害() {
    const 延迟 = this.模拟循环.当前自身buff列表.逍遥 ? [1, 3, 6, 10] : [0, 0, 0, 0]
    ;['一', '二', '三', '四'].forEach((段, 索引) => this.登记伤害('蜀犬吠日·' + 段, 延迟[索引]))
  }
}

export default 蜀犬吠日
