import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 断魂刺 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '断魂刺')

  constructor(模拟循环) {
    super(模拟循环)
    断魂刺.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '断魂刺')
    this.初始化技能运行数据()
  }

  命中() {
    if (this.模拟循环.角色状态信息.体态 === '骑乘') {
      this.回复战意('断魂刺', 3)
      this.触发伤害行为('断魂刺')
    }
  }
}

export default 断魂刺

export const 断魂刺类型 = typeof 断魂刺
