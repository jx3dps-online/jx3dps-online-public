import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 江海凝光 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '江海凝光')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.触发伤害行为('江海凝光', 1)
    this.模拟循环.卸除buff({ 名称: '满堂', 对象: '自身', 卸除层数: 1 })
    this.消耗盈袖(3)
    this.模拟循环.技能类实例集合?.急曲?.引爆?.()
    this.新增钗燕层数('江海凝光')
    this.保存释放记录('江海凝光')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['繁音急节']),
    }
  }
}

export default 江海凝光

export const 江海凝光类型 = typeof 江海凝光
