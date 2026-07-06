// import 循环主类 from '../main'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 孤风破浪 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '孤风破浪')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  造成伤害() {
    const buff列表: string[] = []
    const 当前锐意 = this.模拟循环.角色状态信息?.锐意 || 0

    const 满锐 = 当前锐意 >= 60
    const 半锐 = 当前锐意 >= 30 && 当前锐意 < 60

    if (满锐) {
      buff列表.push('满锐增伤')
      this.模拟循环.添加buff?.({ 名称: '孤锋满锐', 对象: '自身' })
    } else if (半锐) {
      buff列表.push('半锐增伤')
    }

    this.触发伤害行为('孤风破浪·悟', 1, buff列表)
  }

  释放后() {
    this.保存释放记录()
    const 当前锐意 = this.模拟循环.角色状态信息?.锐意 || 0

    if (当前锐意 >= 60) {
      this.触发伤害行为('截辕·悟')
      this.模拟循环.技能类实例集合?.截辕?.获得和刷新截辕?.()
    }

    if (this.模拟循环.大橙武模拟) {
      this.模拟循环.添加buff?.({ 名称: '大橙武增伤', 对象: '自身' })
    }

    this.触发消耗锐意(60, '孤风破浪·悟')
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('大橙武增伤')
    this.本次释放记录 = {
      造成buff数据: 造成buff数据 ? 造成buff数据 : undefined,
      重要buff列表: this.获取当前重要buff列表(['灭影追风·悟', '披靡·悟', '横云一式', '大橙武增伤']),
    }
  }

  技能释放后更新运行数据() {
    // 非潋风奇穴的识破决，释放后重置技能CD
    const 当前锐意 = this.模拟循环.角色状态信息?.锐意 || 0
    const 减少CD = 当前锐意 >= 60 ? 每秒郭氏帧 * 5 : 0
    if (孤风破浪.技能数据) {
      this?.模拟循环?.技能释放后更新运行数据?.(
        孤风破浪.技能数据,
        this,
        (孤风破浪.技能数据.技能CD || 0) - 减少CD,
      )
    }
  }
}

export default 孤风破浪

export const 孤风破浪类型 = typeof 孤风破浪
