// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 触发橙武 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '触发橙武')

  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  命中() {
    if (this.模拟循环.大橙武模拟) {
      this.模拟循环.添加buff?.({ 名称: '橙武', 对象: '自身', 覆盖层数: 3 })

      this.保存释放记录()
    }
  }

  释放() {
    if (this.模拟循环.武器切换启用 && !this.模拟循环.大橙武模拟) {
      return { 可以释放: false, 异常信息: { 信息: '当前武器不是橙武，不能触发橙武' } }
    }
    return { 可以释放: true }
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('橙武')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 触发橙武

export const 触发橙武类型 = typeof 触发橙武
