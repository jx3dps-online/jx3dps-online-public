import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 等待1秒 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '等待1秒')

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    this.模拟循环.增加时间?.(每秒郭氏帧)
  }
}

export default 等待1秒

export const 等待1秒类型 = typeof 等待1秒
