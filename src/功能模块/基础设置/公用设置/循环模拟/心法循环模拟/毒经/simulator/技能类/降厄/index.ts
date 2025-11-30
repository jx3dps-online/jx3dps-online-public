import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 降厄 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '降厄')

  constructor(模拟循环) {
    super(模拟循环)
    降厄.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '降厄')
    this.初始化技能运行数据()
  }

  释放() {

  }

  命中() {
    this.模拟循环.添加buff({ 名称: '降厄', 对象: '自身', 新增层数: 1 })
    this.圣蝎献祭处理()
    this.保存释放记录()
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('降厄')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 降厄

export const 降厄类型 = typeof 降厄
