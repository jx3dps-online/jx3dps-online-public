import 技能统一类 from '../../通用类/技能统一类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 换行 extends 技能统一类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '换行')!
  技能名称 = '换行'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  命中() {}
}

export default 换行
