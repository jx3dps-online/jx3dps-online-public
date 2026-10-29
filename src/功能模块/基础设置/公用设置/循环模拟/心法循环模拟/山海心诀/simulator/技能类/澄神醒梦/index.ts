import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'

class 澄神醒梦 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '澄神醒梦')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放() {
    return this.模拟循环.当前自身buff列表['游雾乘云']?.当前层数
      ? { 可以释放: false, 异常信息: ERROR_ACTION.BUFF错误 }
      : { 可以释放: true }
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '澄神醒梦', 对象: '自身' })
    this.开启乘黄之威续期('澄神醒梦')
    this.本次释放记录 = { 造成buff数据: this.获取施加重要buff信息('澄神醒梦') || undefined }
  }
}

export default 澄神醒梦
