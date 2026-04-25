import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 星楼月影 extends 有CD技能通用类 {
  // scripts/skill/万花\万花_养心决_星楼月影.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '星楼月影')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
    星楼月影.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '星楼月影')
  }

  命中() {
    this.墨意变化(20)
  }
}

export default 星楼月影

export const 星楼月影类型 = typeof 星楼月影
