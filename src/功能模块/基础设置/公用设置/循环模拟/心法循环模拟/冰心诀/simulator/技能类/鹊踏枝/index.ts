import { 每秒郭氏帧 } from '@/数据/常量'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 鹊踏枝 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    if (this.模拟循环.校验奇穴是否存在('朝露')) {
      this.模拟循环.技能类实例集合.剑影留痕.减少调息时间(5 * 每秒郭氏帧)
    }
  }

  释放后() {
    this.本次释放记录 = { 实际伤害技能: '鹊踏枝' }
  }
}

export default 鹊踏枝
