import 技能统一类 from '../../通用类/技能统一类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 犬牙交错 extends 技能统一类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '犬牙交错')!
  技能名称 = '犬牙交错'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(50, this.技能名称)
    this.模拟循环.卸除buff({ 名称: '犬牙交错', 对象: '自身' })
  }

  造成伤害() {
    this.登记伤害(
      '犬牙交错',
      this.模拟循环.当前自身buff列表.逍遥 ? 2 : 0,
      1,
      this.模拟循环.校验奇穴是否存在('反截') ? 2 : 1,
    )
  }
}

export default 犬牙交错
