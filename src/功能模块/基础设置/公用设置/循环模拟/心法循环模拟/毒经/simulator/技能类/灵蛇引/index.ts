import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 灵蛇引 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '灵蛇引')

  constructor(模拟循环) {
    super(模拟循环)
    灵蛇引.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '灵蛇引')
    this.初始化技能运行数据()
  }

  释放() {}

  命中() {
    this.模拟循环.添加buff({
      名称: '灵蛇存在',
      对象: '自身',
      新增层数: 1,
      事件时间: this.模拟循环.当前时间,
    })
    if (this.模拟循环.当前自身buff列表?.['圣蝎存在']?.当前层数) {
      this.模拟循环.卸除buff({ 名称: '圣蝎存在', 对象: '自身', 事件时间: this.模拟循环.当前时间 })
    }
    this.模拟循环.添加buff({ 名称: '引魂', 对象: '自身', 新增层数: 1 })
    this.模拟循环.添加buff({ 名称: '不鸣', 对象: '自身', 新增层数: 1 })
    this.保存释放记录('灵蛇引')
    this.圣蝎献祭处理()
  }

  保存释放记录(名称) {
    const 造成buff数据 = this.获取施加重要buff信息(['引魂'])
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['引魂', '降厄', '圣蝎献祭']),
      造成buff数据: 造成buff数据 ? { ...造成buff数据 } : undefined,
    }
  }
}

export default 灵蛇引

export const 灵蛇引类型 = typeof 灵蛇引
