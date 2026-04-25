import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 龙马出河 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '龙马出河')

  constructor(模拟循环) {
    super(模拟循环)
    龙马出河.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '龙马出河')
    this.初始化技能运行数据()
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '龙马出河', 对象: '自身' })
    this.保存释放记录()
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('龙马出河')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 龙马出河

export const 列宿游类型 = typeof 龙马出河
