import 通用有CD技能 from '../../../通用/通用技能/通用类/有CD技能通用类'
import type 循环主类 from '../main'
import type { 循环基础技能数据类型 } from '../type'

class 有CD技能通用类 extends 通用有CD技能 {
  模拟循环: 循环主类
  技能数据!: 循环基础技能数据类型

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.模拟循环 = 模拟循环
  }

  技能释放后更新运行数据() {
    const { 技能CD = 0, 透支 } = this.技能数据
    if (!透支) {
      this.模拟循环.技能释放后更新运行数据(this.技能数据, this)
      return
    }
    // 1157/1117追加未偿还调息，全额偿还时恢复所有透支次数。
    const 待充能时间点 = this.技能运行数据.待充能时间点.filter(
      (时间) => 时间 > this.模拟循环.当前时间,
    )
    const 偿还时间 = (待充能时间点[0] || this.模拟循环.当前时间) + 技能CD
    this.更新技能运行数据({ 待充能时间点: Array(待充能时间点.length + 1).fill(偿还时间) })
  }
}

export default 有CD技能通用类
