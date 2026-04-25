import 循环模拟技能基础数据 from '../../../constant/skill'
import 变卦统一类 from '../../通用类/变卦统一类'

class 变水卦 extends 变卦统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '变卦')
  static 本次释放卦象 = ''

  constructor(模拟循环) {
    super(模拟循环)
    变水卦.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '变卦')
    this.初始化技能运行数据()
  }

  命中() {
    this.消耗星运(40, '变水卦')
    const 当前存在祝由释放允许 = this.模拟循环.当前自身buff列表?.['祝由释放允许']?.当前层数
    this.卦象清除()
    this.变卦生效(当前存在祝由释放允许)
    this.保存释放记录()
  }

  变卦生效(当前存在祝由释放允许) {
    this.卦象清除()
    this.模拟循环.添加buff({ 名称: `卦象_水坎`, 对象: '自身' })
    this.统一变卦生效(当前存在祝由释放允许)
  }
}

export default 变水卦

export const 起卦类型 = typeof 变水卦
