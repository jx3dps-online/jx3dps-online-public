import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 剑影留痕 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '剑影留痕')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    if (this.模拟循环.当前自身buff列表.芳姿畅音?.当前层数) {
      this.模拟循环.添加buff({ 名称: '仙姿剑影', 对象: '自身', 新增层数: 1 })
      this.模拟循环.卸除buff({ 名称: '芳姿畅音', 对象: '自身' })
    }
    if (this.模拟循环.当前自身buff列表?.仙姿剑影?.当前层数) {
      this.触发伤害行为('留芳仙姿·剑影')
      this.新增钗燕层数('留芳仙姿·剑影')
      this.回复剑舞(1)
    }
    this.新增钗燕层数('剑影留痕')
    if (this.模拟循环.校验奇穴是否存在('流玉')) {
      const 流玉次数 = this.模拟循环.当前自身buff列表.繁音急节?.当前层数 ? 2 : 1
      this.模拟循环.添加buff({ 名称: '流玉', 对象: '自身', 覆盖层数: 流玉次数 })
    }
    this.消耗盈袖(1)
    this.保存释放记录('剑影留痕')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['繁音急节', '仙姿剑影']),
    }
  }
}

export default 剑影留痕

export const 剑影留痕类型 = typeof 剑影留痕
