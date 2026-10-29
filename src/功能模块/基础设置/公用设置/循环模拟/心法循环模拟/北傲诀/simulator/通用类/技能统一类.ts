import 通用技能统一类 from '../../../通用/通用技能/通用类/技能统一类'
import type 循环主类 from '../main'
import type { 循环基础技能数据类型 } from '../type'

class 技能统一类 extends 通用技能统一类 {
  模拟循环: 循环主类
  技能数据!: 循环基础技能数据类型

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.模拟循环 = 模拟循环
  }
}

export default 技能统一类
