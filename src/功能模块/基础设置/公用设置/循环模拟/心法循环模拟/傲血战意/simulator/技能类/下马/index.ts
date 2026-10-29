import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 下马 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '下马')

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    this.下马处理()
  }
}

export default 下马

export const 下马类型 = typeof 下马
