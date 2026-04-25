import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 镇星入舆 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '镇星入舆')

  constructor(模拟循环) {
    super(模拟循环)
    镇星入舆.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '镇星入舆')
    this.初始化技能运行数据()
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '镇星入舆_临', 对象: '自身' })
    this.模拟循环.添加buff({ 名称: '镇星入舆_兵', 对象: '自身' })
    this.模拟循环.添加buff({ 名称: '镇星入舆_斗', 对象: '自身' })

    this.模拟循环.添加buff({ 名称: '入舆', 对象: '自身', 覆盖层数: 2 })
  }
}

export default 镇星入舆

export const 起卦类型 = typeof 镇星入舆
