import { 每秒郭氏帧 } from '@/数据/常量'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 触发橙武 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放() {
    if (!this.模拟循环.大橙武模拟) {
      return { 可以释放: false, 异常信息: '触发橙武需要装备启用大橙武特效' }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '橙武', 对象: '自身', 覆盖层数: 3 })
    const Buff = this.模拟循环.当前自身buff列表
    if (!Buff.破势二段) {
      this.模拟循环.技能类实例集合.万世不竭.获得飞剑(每秒郭氏帧 * 25)
    }
  }
}

export default 触发橙武
