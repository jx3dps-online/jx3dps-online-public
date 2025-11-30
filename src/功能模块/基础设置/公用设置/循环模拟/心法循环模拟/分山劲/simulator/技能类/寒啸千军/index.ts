// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 寒啸千军 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '寒啸千军')
  // static 消耗格挡 = 0

  constructor(模拟循环) {
    super(模拟循环)

    // 寒啸千军.消耗格挡 = 20

    this.初始化技能运行数据()
  }

  命中() {
    this.模拟循环.添加buff?.({ 名称: '寒啸千军', 对象: '自身', 新增层数: 1 })
  }

  释放后() {
    // this.触发消耗格挡(寒啸千军.消耗格挡, 寒啸千军.技能数据?.技能名称)
    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['血怒', '血怒_惊涌', '麟光玄甲', '援戈', '橙武',]),
    }
  }
}

export default 寒啸千军
export const 寒啸千军类型 = typeof 寒啸千军
