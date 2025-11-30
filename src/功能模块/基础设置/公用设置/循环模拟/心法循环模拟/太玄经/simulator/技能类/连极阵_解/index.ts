import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 连极阵_解 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '连极阵_解')

  constructor(模拟循环) {
    super(模拟循环)
    连极阵_解.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '连极阵_解')
    this.初始化技能运行数据()
  }

  命中() {
    this.模拟循环.删除待生效事件队列('自动三才')
    this.模拟循环.卸除buff({ 名称: '连极阵', 对象: '目标' })
  }
}

export default 连极阵_解
