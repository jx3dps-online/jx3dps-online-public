import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 每秒郭氏帧 } from '@/数据/常量'

class 降厄 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '降厄')

  constructor(模拟循环) {
    super(模拟循环)
    降厄.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '降厄')
    this.初始化技能运行数据()
  }

  释放() {}

  命中() {
    this.模拟循环.添加buff({ 名称: '降厄', 对象: '自身', 新增层数: 1 })
    this.圣蝎献祭处理()
    this.处理薄瘴()
    this.保存释放记录('降厄')
  }

  处理薄瘴() {
    return // 03/31 薄瘴不再于 PVE 生效
    if (this.模拟循环.校验奇穴是否存在('薄瘴')) {
      // 每 1 秒触发一次，共 6 次 (6.5s)
      for (let i = 1; i <= 6; i++) {
        this.模拟循环.添加待生效事件队列([
          {
            事件名称: '薄瘴Tick',
            事件时间: this.模拟循环.当前时间 + 每秒郭氏帧 * i,
            事件备注: {},
          },
        ])
      }
    }
  }

  薄瘴Tick() {
    this.触发伤害行为('降厄·薄瘴', 1)
    this.模拟循环.技能类实例集合?.蛇影DOT?.提前生效一跳()
    this.模拟循环.技能类实例集合?.百足DOT?.提前生效一跳()
    this.模拟循环.技能类实例集合?.蟾啸DOT?.提前生效一跳()
  }

  保存释放记录(名称) {
    const 造成buff数据 = this.获取施加重要buff信息(['降厄'])
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['引魂', '降厄', '圣蝎献祭']),
      造成buff数据: 造成buff数据 ? { ...造成buff数据 } : undefined,
    }
  }
}

export default 降厄

export const 降厄类型 = typeof 降厄
