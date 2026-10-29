import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 恶狗拦路 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '恶狗拦路')!
  技能名称 = '恶狗拦路'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    if (this.模拟循环.秘籍.恶狗拦路?.includes('回蓝10%')) this.模拟循环.更新内力(10, '恶狗拦路秘籍')
  }

  造成伤害() {
    this.登记伤害('恶狗拦路', this.模拟循环.校验奇穴是否存在('交错') ? 0 : 15)
  }

  延迟生效() {
    this.模拟循环.添加buff({ 名称: '犬牙交错', 对象: '自身' })
  }
}

export default 恶狗拦路
