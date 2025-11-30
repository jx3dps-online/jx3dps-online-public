import { 箭形态枚举 } from '../../../constant/enum'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 寒更晓箭 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '寒更晓箭')

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    // 向箭袋中补充箭袋黄箭至8支
    const 新箭袋信息 = [...(this.模拟循环.角色状态信息.箭袋信息 || [])]

    while (新箭袋信息.length < 8) {
      新箭袋信息.push({ 箭形态: 箭形态枚举.黄箭 })
    }

    this.模拟循环.角色状态信息.箭袋信息 = 新箭袋信息
  }

  命中() {
    this.模拟循环.GCD组.公共 = Math.max((this.模拟循环.GCD组.公共 || 0) - 8)
  }
}

export default 寒更晓箭

export const 寒更晓箭类型 = typeof 寒更晓箭
