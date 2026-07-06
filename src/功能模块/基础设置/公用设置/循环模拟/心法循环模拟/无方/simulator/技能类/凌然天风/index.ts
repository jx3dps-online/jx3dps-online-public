import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 凌然天风 extends 有CD技能通用类 {
  // scripts/skill/北天药宗/北天药宗_商陆其根.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '凌然天风')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
    凌然天风.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '凌然天风')
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '凌然天风', 对象: '自身' })
    this.保存释放记录()
  }
  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('凌然天风')
    this.本次释放记录 = {
      ...(造成buff数据 ? { 造成buff数据 } : {}),
      重要buff列表: this.获取当前重要buff列表([]),
    }
  }
}

export default 凌然天风

export const 凌然天风类型 = typeof 凌然天风
