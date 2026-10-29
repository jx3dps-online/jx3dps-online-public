import 循环模拟技能基础数据 from '../../../constant/skill'
import 起卦统一类 from '../../通用类/起卦统一类'

class 起火卦 extends 起卦统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '起卦')
  static 本次释放卦象 = ''

  constructor(模拟循环) {
    super(模拟循环)
    起火卦.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '起卦')
    this.初始化技能运行数据()
  }

  命中() {
    // 24833 衍天\套路及子技能\占术_火离起卦.lua
    const 实际卦象 = this.获取实际起卦卦象('火')
    this.模拟循环.添加buff({ 名称: `起${实际卦象}卦`, 对象: '自身' })
    this.延迟起卦(实际卦象)
    this.保存释放记录()
  }
}

export default 起火卦

export const 起卦类型 = typeof 起火卦
