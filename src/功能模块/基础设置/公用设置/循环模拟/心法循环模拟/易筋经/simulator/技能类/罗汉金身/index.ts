import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 罗汉金身 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '罗汉金身')

  constructor(模拟循环) {
    super(模拟循环)
    罗汉金身.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '罗汉金身')
    this.初始化技能运行数据()
  }

  命中() {
    const 当前禅那 = this.模拟循环.角色状态信息.禅那
    this.模拟循环.Buff和Dot数据.罗汉金身.最大持续时间 = 每秒郭氏帧 * 10 * 当前禅那
    this.模拟循环.添加buff?.({ 名称: '罗汉金身', 对象: '自身', 新增层数: 当前禅那 })
    this.消耗禅那('罗汉金身', 当前禅那)
    this.保存释放记录('罗汉金身')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['布泽', '普渡', '擒龙', '罗汉金身', '身意']),
    }
  }
}

export default 罗汉金身

export const 罗汉金身类型 = typeof 罗汉金身
