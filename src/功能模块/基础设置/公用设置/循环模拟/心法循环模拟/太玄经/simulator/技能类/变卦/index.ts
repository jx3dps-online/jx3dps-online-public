import 循环模拟技能基础数据 from '../../../constant/skill'
import 变卦统一类 from '../../通用类/变卦统一类'

class 变卦 extends 变卦统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '变卦')

  constructor(模拟循环) {
    super(模拟循环)
    变卦.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '变卦')
    this.初始化技能运行数据()
  }

  命中() {
    let 消耗 = 40
    if (this.模拟循环.秘籍['变卦']?.includes('顺序变卦')) {
      消耗 = 50
    }
    this.消耗星运(消耗, '变卦')
    const 当前存在祝由释放允许 = this.模拟循环.当前自身buff列表?.['祝由释放允许']?.当前层数
    const 当前卦象 = this.判断当前卦象()
    this.卦象清除()
    if (this.模拟循环.秘籍['变卦']?.includes('顺序变卦')) {
      let 下一个卦象 = '水'
      if (当前卦象 === '水') {
        下一个卦象 = '火'
      } else if (当前卦象 === '火') {
        下一个卦象 = '山'
      } else if (当前卦象 === '山') {
        下一个卦象 = '水'
      }
      const 卦象映射 = { 水: '水坎', 火: '火离', 山: '山艮' }
      this.模拟循环.添加buff({ 名称: `卦象_${卦象映射[下一个卦象]}`, 对象: '自身' })
    }
    this.统一变卦生效(当前存在祝由释放允许)
    this.保存释放记录()
  }
}

export default 变卦

export const 起卦类型 = typeof 变卦
