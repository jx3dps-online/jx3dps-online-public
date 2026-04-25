import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 灵蛊 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '灵蛊')

  constructor(模拟循环) {
    super(模拟循环)
    灵蛊.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '灵蛊')
    this.初始化技能运行数据()
  }

  释放() {}

  命中() {
    this.模拟循环.添加buff({ 名称: '灵蛊', 对象: '自身', 新增层数: 1 })
    if (this.模拟循环.校验奇穴是否存在('令怖')) {
      this.模拟循环.添加buff({ 名称: '令怖', 对象: '自身', 新增层数: 1 })
    }
    this.模拟循环.添加buff({ 名称: '嗜蛊', 对象: '自身', 新增层数: 1 })
    this.触发荒息('灵蛊')
    this.圣蝎献祭处理()
    this.保存释放记录('灵蛊')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['引魂']),
    }
  }
}

export default 灵蛊

export const 灵蛊类型 = typeof 灵蛊
