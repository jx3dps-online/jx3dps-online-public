import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 每秒郭氏帧 } from '@/数据/常量'

class 绊线 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '穿云')

  constructor(模拟循环) {
    super(模拟循环)
    绊线.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '绊线')
    this.初始化技能运行数据()
  }

  命中() {
    this.消耗心络('绊线', 10)
    this.保存释放记录('绊线')
    this.触发伤害行为('绊线', 1)
    this.模拟循环.添加buff?.({ 名称: '钤束', 对象: '自身', 新增层数: 1 })
    this.模拟循环.添加buff?.({ 名称: '缠绞', 对象: '目标', 新增层数: 1 })
    if (this.模拟循环.当前自身buff列表?.['迭影']?.当前层数) {
      // 减少0.5秒 gcd
      this.回复心络('绊线', 10)
    }
    this.模拟循环.技能类实例集合?.千里急?.自动释放('绊线')
  }

  获取释放后GCD减少时间() {
    if (this.模拟循环.当前自身buff列表?.['迭影']?.当前层数) {
      return 每秒郭氏帧 * 0.5
    }
    return 0
  }

  保存释放记录(名称) {
    const 是否释放 = this.模拟循环.技能类实例集合?.千里急?.判断当前是否释放千里急()
    this.本次释放记录 = {
      实际伤害技能: 名称,
      伤害段数: 是否释放 ? this.模拟循环.技能类实例集合?.千里急?.当前千里急 : undefined,
      造成buff数据: this.获取施加重要buff信息('钤束') || undefined,
      重要buff列表: this.获取当前重要buff列表(['钤束', '虚影', '迭影']),
    }
  }
}

export default 绊线

export const 绊线类型 = typeof 绊线
