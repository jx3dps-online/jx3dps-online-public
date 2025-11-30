// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 重置盾压 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '重置盾压')

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    this.重置盾压调息时间()
  }
}

export default 重置盾压

export const 重置盾压类型 = typeof 重置盾压
