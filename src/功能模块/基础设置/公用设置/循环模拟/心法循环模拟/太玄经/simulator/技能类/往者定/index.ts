import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 往者定 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '往者定')

  constructor(模拟循环) {
    super(模拟循环)
    往者定.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '往者定')
  }

  // 顺序不可随意更改
  命中() {
    this.获取星芒()
    this.触发伤害行为('往者定')
    this.保存释放记录('往者定')
    this.模拟循环.技能类实例集合?.太白蚀昴?.命中()
  }
  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['荧入白', '祝祷', '鬼遁', '镇星', '明灯']),
    }
  }
}

export default 往者定

export const 往者定类型 = typeof 往者定
