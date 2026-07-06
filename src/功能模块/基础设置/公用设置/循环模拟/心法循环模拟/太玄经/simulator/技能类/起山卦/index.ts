import 循环模拟技能基础数据 from '../../../constant/skill'
import 起卦统一类 from '../../通用类/起卦统一类'

class 起山卦 extends 起卦统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '起卦')
  static 本次释放卦象 = ''

  constructor(模拟循环) {
    super(模拟循环)
    起山卦.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '起卦')
    this.初始化技能运行数据()
  }

  命中() {
    // 24832 衍天\套路及子技能\占术_山艮起卦.lua
    this.模拟循环.添加buff({ 名称: '起山卦', 对象: '自身' })
    this.延迟起卦('山')

    this.应卦震符触发判定()

    this.保存释放记录()
  }
}

export default 起山卦

export const 起卦类型 = typeof 起山卦
