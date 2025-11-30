import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 飞星遁影 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '飞星遁影')

  constructor(模拟循环: any) {
    super(模拟循环)
  }

  释放() {
    // 检查神机值是否足够
    const 当前神机值 = this.模拟循环?.角色状态信息?.神机值 || 100
    const 消耗神机值 = 飞星遁影.技能数据!.消耗神机值 ?? 0
    if (当前神机值 < 消耗神机值) {
      return {
        可以释放: false,
        异常信息: {信息:`神机值不足，当前神机值：${当前神机值}，所需神机值：${消耗神机值}`}
      }
    }
    this.模拟循环.神机值变化(飞星遁影.技能数据!)
    return { 可以释放: true }
  }

  命中() {
    // this.模拟循环?.添加buff({ 名称: '连星', 对象: '自身' })
    this.保存释放记录()
  }



  保存释放记录() {
    // const 造成buff数据 = this.获取施加重要buff信息('连星')
    const 造成buff数据 = null
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 飞星遁影

export const 飞星遁影类型 = typeof 飞星遁影
