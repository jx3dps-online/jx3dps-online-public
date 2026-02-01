// import 循环主类 from '../main'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 返闭惊魂 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '返闭惊魂')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放() {
    // 返闭惊魂释放时添加20%通用无界增伤和20%无双
    this.模拟循环.添加buff?.({ 名称: '返闭增伤', 对象: '自身' })
    this.模拟循环.添加buff?.({ 名称: '返闭无双', 对象: '自身' })
  }

  释放后() {
    this.保存释放记录()

    // 返闭惊魂减少四秒绝技调息时间
    this.减少绝技技能CD(每秒郭氏帧 * 4)
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['返闭无双', '大橙武增伤']),
    }
  }
}

export default 返闭惊魂

export const 返闭惊魂类型 = typeof 返闭惊魂
