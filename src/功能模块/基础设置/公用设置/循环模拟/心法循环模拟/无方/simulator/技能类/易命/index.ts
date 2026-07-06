import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 易命 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '易命')

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    // 检查当前身上是否存在 易命10 或 易命·20
    const 有易命 = !!this?.模拟循环?.当前自身buff列表?.['易命']

    if (!有易命) {
      this.模拟循环.添加buff?.({ 名称: '易命', 对象: '自身', 新增层数: 1 })
    } else if (有易命) {
      this.模拟循环.卸除buff?.({ 名称: '易命', 对象: '自身', 卸除层数: 1 })
    }
    return
  }
}

export default 易命

export const 易命类型 = typeof 易命
