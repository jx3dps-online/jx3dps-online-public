// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环基础技能数据类型 } from '../../type'

class 触发橙武 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '触发橙武')
  本次指定延迟 = false

  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  释放前初始化(额外信息) {
    super.释放前初始化(额外信息)
    this.本次指定延迟 = 额外信息?.延迟 !== undefined
  }

  检查GCD(索引, 当前技能?: 循环基础技能数据类型) {
    if (this.本次指定延迟) {
      return super.检查GCD(索引, 当前技能)
    }
    return Math.max(
      0,
      (this.模拟循环.GCD组.公共 || 0) - 每秒郭氏帧 * 0.5,
      this.模拟循环.GCD组['触发橙武'] || 0,
    )
  }

  命中() {
    if (this.模拟循环.大橙武模拟) {
      this.模拟循环.添加buff?.({ 名称: '橙武', 对象: '自身', 新增层数: 1 })

      this.回复战意('橙武', 5)
    }
  }
}

export default 触发橙武

export const 触发橙武类型 = typeof 触发橙武
