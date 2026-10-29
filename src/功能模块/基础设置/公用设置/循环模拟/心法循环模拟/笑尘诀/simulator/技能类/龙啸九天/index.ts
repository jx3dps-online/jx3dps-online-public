import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 龙啸九天 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '龙啸九天')!
  技能名称 = '龙啸九天'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  造成伤害() {
    this.保存释放记录()
    this.登记伤害('龙啸九天')
  }
  释放后() {
    this.触发苍龙()
  }
}

export default 龙啸九天
