import 技能统一类 from '../../通用类/技能统一类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 横打双獒 extends 技能统一类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '横打双獒')!
  技能名称 = '横打双獒'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(
      this.模拟循环.秘籍[this.技能名称]?.includes('回蓝3%') ? 18 : 15,
      this.技能名称,
    )
    this.模拟循环.卸除buff({ 名称: '横打双獒', 对象: '自身' })
  }

  造成伤害() {
    const 逍遥 = !!this.模拟循环.当前自身buff列表.逍遥
    this.登记伤害('横打双獒·一', 逍遥 ? 3 : 0)
    this.登记伤害('横打双獒·二', 逍遥 ? 11 : 0)
    if (this.模拟循环.校验奇穴是否存在('追远')) this.登记伤害('追远', 0, 2)
  }
}

export default 横打双獒
