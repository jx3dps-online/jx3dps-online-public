import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 触发橙武 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '触发橙武')!
  技能名称 = '触发橙武'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放() {
    return { 可以释放: this.模拟循环.大橙武模拟, 异常信息: '未启用大橙武模拟' }
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '暴龙震江', 对象: '自身' })
    this.保存释放记录()
  }
}

export default 触发橙武
