import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 凤凰蛊 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '凤凰蛊')

  constructor(模拟循环) {
    super(模拟循环)
    凤凰蛊.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '凤凰蛊')
    this.初始化技能运行数据()
  }

  释放() {}

  命中() {
    this.模拟循环.添加buff({ 名称: '凤凰蛊', 对象: '自身', 新增层数: 1 })
    this.保存释放记录('凤凰蛊')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
    }
  }
}

export default 凤凰蛊

export const 凤凰蛊类型 = typeof 凤凰蛊
