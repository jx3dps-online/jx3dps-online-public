import { 获取实际帧数 } from '@/工具函数/data'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 千丝 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '千丝')

  constructor(模拟循环) {
    super(模拟循环)
    千丝.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '千丝')
    this.初始化技能运行数据()
  }

  释放() {}

  命中() {
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: '技能延迟生效',
        事件时间: this.模拟循环.当前时间 + 每秒郭氏帧 * 4.5625,
        事件备注: {
          技能名称: '千丝',
        },
      },
    ])
    this.触发残香()
    this.触发降厄('千丝')
    this.处理虫魄('千丝')
    this.触发荒息('千丝')
    this.圣蝎献祭处理()
    this.保存释放记录('千丝')
  }

  读条伤害() {
    if (this.模拟循环.校验奇穴是否存在('蛛魄')) {
      this.触发伤害行为('千丝', 1)
    }
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['引魂', '降厄', '圣蝎献祭']),
    }
  }
}

export default 千丝

export const 千丝类型 = typeof 千丝
