import { 获取实际帧数, 获取倒读条实际帧数分布 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 连缘蛊 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '连缘蛊')

  constructor(模拟循环) {
    super(模拟循环)
    连缘蛊.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '连缘蛊')
    this.初始化技能运行数据()
  }

  释放() {
    this.圣蝎献祭处理()
  }

  获取读条时间() {
    return 获取实际帧数(连缘蛊.技能数据?.读条时间, this.模拟循环.加速值)
  }

  读条() {
    const 读条分布 = 获取倒读条实际帧数分布(连缘蛊.技能数据?.读条时间, 5, this.模拟循环.加速值)
    const 读条开始时间 = this.模拟循环.当前时间
    const 当前目标DOT = this.获取当前目标DOT()
    for (let i = 0; i < 读条分布.length; i++) {
      this.模拟循环.添加待生效事件队列([
        {
          事件名称: '技能读条',
          事件时间: 读条开始时间 + 读条分布[i],
          事件备注: {
            技能名称: '连缘蛊',
            技能次数: i + 1,
            DOT数量: 当前目标DOT.length,
          },
        },
      ])
    }
  }

  读条伤害(事件备注: { 技能次数: number; DOT数量: number }) {
    const 当前目标DOT = this.获取当前目标DOT()
    this.触发伤害行为('连缘蛊', 1, [`连缘蛊·${事件备注?.DOT数量}`])
    this.触发荒息('连缘蛊')
    if (this.模拟循环.校验奇穴是否存在('令怖')) {
      this.模拟循环.添加buff({ 名称: '令怖', 对象: '自身', 新增层数: 1 })
    }
    if (事件备注?.技能次数 === 5) {
      this.触发伤害行为('连缘蛊·额外', 1, [], undefined, 当前目标DOT.length + 1)
      this.触发荒息('连缘蛊·额外')
      if (this.模拟循环.校验奇穴是否存在('令怖')) {
        this.模拟循环.添加buff({ 名称: '令怖', 对象: '自身', 新增层数: 1 })
      }
    }
  }

  命中() {
    this.保存释放记录('连缘蛊')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['引魂', '圣蝎献祭']),
    }
  }
}

export default 连缘蛊

export const 连缘蛊类型 = typeof 连缘蛊
