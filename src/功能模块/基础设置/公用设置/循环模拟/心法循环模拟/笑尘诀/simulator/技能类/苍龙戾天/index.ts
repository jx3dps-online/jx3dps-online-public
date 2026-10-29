import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import 技能基础数据 from '../../../constant/skill'

class 苍龙戾天 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '苍龙戾天')!
  技能名称 = '苍龙戾天'

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  造成伤害() {
    this.登记伤害('苍龙戾天', 28)
    this.保存释放记录()
  }

  延迟生效() {
    this.模拟循环.添加buff({ 名称: '苍龙', 对象: '自身' })
    this.模拟循环.添加buff({ 名称: '苍龙标记', 对象: '目标' })
  }
}

export default 苍龙戾天
