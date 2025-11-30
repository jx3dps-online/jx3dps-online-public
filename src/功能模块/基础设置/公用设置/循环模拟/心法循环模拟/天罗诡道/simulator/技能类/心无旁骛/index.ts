import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 心无旁骛 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '心无旁骛')

  constructor(模拟循环:any) {
    super(模拟循环)
  }
  释放() {
    // 神机值满
    this.模拟循环.神机值变化?.(心无旁骛.技能数据!)
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环?.添加buff({ 名称: '心无旁骛', 对象: '自身' })
    this.保存释放记录()
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('心无旁骛')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }

}

export default 心无旁骛

export const 心无旁骛类型 = typeof 心无旁骛
