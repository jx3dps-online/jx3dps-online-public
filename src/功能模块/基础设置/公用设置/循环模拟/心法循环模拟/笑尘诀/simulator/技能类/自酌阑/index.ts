import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 自酌阑 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '自酌阑')!
  技能名称 = '自酌阑'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放() {
    if (!this.模拟循环.当前自身buff列表.逍遥)
      return { 可以释放: false, 异常信息: '自酌阑只能在逍遥期间施展' }
    return { 可以释放: true }
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.添加buff({ 名称: '贞固', 对象: '自身' })
  }
}

export default 自酌阑
