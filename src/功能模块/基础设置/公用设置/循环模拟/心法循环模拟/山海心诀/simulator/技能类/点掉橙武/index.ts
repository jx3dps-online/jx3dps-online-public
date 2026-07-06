// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 点掉橙武 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '点掉橙武')

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    if (this.模拟循环.大橙武模拟 && this.模拟循环?.当前自身buff列表?.['橙武']?.当前层数) {
      this.模拟循环.卸除buff?.({ 名称: '橙武', 对象: '自身' })
    }
  }
}

export default 点掉橙武

export const 点掉橙武类型 = typeof 点掉橙武
