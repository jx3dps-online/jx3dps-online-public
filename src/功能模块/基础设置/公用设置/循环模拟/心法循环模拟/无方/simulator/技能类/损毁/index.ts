import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 损毁 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '损毁')

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    // 检查当前身上是否存在 唤醒10 或 唤醒·20
    const 有损毁20 = !!this?.模拟循环?.当前自身buff列表?.['损毁20']
    const 有损毁50 = !!this?.模拟循环?.当前自身buff列表?.['损毁50']

    if (!有损毁20 && !有损毁50) {
      // 当前自身没有唤醒10也没有唤醒20，添加BUFF唤醒10
      this.模拟循环.添加buff?.({ 名称: '损毁20', 对象: '自身', 新增层数: 1 })
    } else if (有损毁20) {
      // 当前自身有唤醒10，卸除BUFF唤醒10，添加BUFF唤醒20
      this.模拟循环.卸除buff({ 名称: '损毁20', 对象: '自身', 卸除层数: 1 })
      this.模拟循环.添加buff?.({ 名称: '损毁50', 对象: '自身', 新增层数: 1 })
    } else if (有损毁50) {
      // 当前自身有唤醒20，卸除BUFF唤醒20
      this.模拟循环.卸除buff({ 名称: '损毁50', 对象: '自身', 卸除层数: 1 })
    }

    return
  }
}

export default 损毁

export const 损毁类型 = typeof 损毁
