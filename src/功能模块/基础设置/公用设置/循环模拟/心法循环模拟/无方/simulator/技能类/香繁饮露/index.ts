import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 香繁饮露 extends 有CD技能通用类 {
  // scripts/skill/北天药宗/北天药宗_香繁饮露.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '香繁饮露')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '香繁饮露', 对象: '自身' })
    this.保存释放记录()
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('香繁饮露')
    this.本次释放记录 = {
      ...(造成buff数据 ? { 造成buff数据 } : {}),
      重要buff列表: this.获取当前重要buff列表(['相使']),
    }
  }
}

export default 香繁饮露

export const 香繁饮露类型 = typeof 香繁饮露
