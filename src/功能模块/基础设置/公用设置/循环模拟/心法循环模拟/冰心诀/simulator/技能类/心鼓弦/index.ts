import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 心鼓弦 extends 有CD技能通用类 {
  // scripts/skill/北天药宗/北天药宗_奚毒射罔.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '心鼓弦')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    if (this.模拟循环.校验奇穴是否存在('化冰')) {
      this.模拟循环.添加buff({ 名称: '化冰', 对象: '自身' })
    }
  }

  释放后() {
    this.保存释放记录('心鼓弦')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['相使']),
    }
  }
}

export default 心鼓弦

export const 心鼓弦类型 = typeof 心鼓弦
