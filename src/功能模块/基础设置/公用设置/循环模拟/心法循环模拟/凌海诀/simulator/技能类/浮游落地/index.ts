import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 浮游落地 extends 有CD技能通用类 {
  // lua入口 20944
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '浮游落地')

  constructor(模拟循环) {
    super(模拟循环)
    浮游落地.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '浮游落地')
    this.初始化技能运行数据()
  }

  命中() {
    this.折伞落地()
    this.保存释放记录()
  }

  保存释放记录() {
    if (!this.模拟循环.校验奇穴是否存在('游仙')) {
      const 造成buff数据 = this.获取施加重要buff信息('太息·1')
      this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
    }
  }
}

export default 浮游落地

export const 浮游落地类型 = typeof 浮游落地
