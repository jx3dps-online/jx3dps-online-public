import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 返闭惊魂 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '返闭惊魂')
  constructor(模拟循环) {
    super(模拟循环)
    返闭惊魂.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '返闭惊魂')
    this.初始化技能运行数据()
  }

  命中() {
    this.添加灯()
    this.保存释放记录()
    this.刷新鬼遁(true)
  }

  延长持续时间(Buff名称) {
    this.模拟循环.延长Buff({
      名称: Buff名称,
      对象: '目标',
      来源: '返闭惊魂',
      延长时间: 每秒郭氏帧 * 10,
    })
  }

  添加灯() {
    if (this.模拟循环.秘籍?.['返闭惊魂']?.includes('延长灯魂') && this.连局判定()) {
      this.延长持续时间(`灯魂_0`)
      this.延长持续时间(`灯魂_1`)
      this.延长持续时间(`灯魂_2`)
    } else {
      let 最短索引 = 0
      const 灯0层数 = this.模拟循环.当前目标buff列表['灯魂_0']?.当前层数
      const 灯1层数 = this.模拟循环.当前目标buff列表['灯魂_1']?.当前层数
      const 灯2层数 = this.模拟循环.当前目标buff列表['灯魂_2']?.当前层数
      if (灯0层数 && 灯1层数 && 灯2层数) {
        const 灯0时间 = this.模拟循环.当前目标buff列表['灯魂_0']?.刷新时间 || 0
        const 灯1时间 = this.模拟循环.当前目标buff列表['灯魂_1']?.刷新时间 || 0
        const 灯2时间 = this.模拟循环.当前目标buff列表['灯魂_2']?.刷新时间 || 0
        const 最短时间 = Math.min(灯0时间, 灯1时间, 灯2时间)
        if (最短时间 === 灯0时间) {
          最短索引 = 0
        } else if (最短时间 === 灯1时间) {
          最短索引 = 1
        } else if (最短时间 === 灯2时间) {
          最短索引 = 2
        }
      } else if (!灯0层数 && !灯1层数 && !灯2层数) {
        最短索引 = 0
      } else if (!灯0层数 && !灯1层数) {
        最短索引 = 2
      } else if (!灯0层数) {
        最短索引 = 1
      } else {
        最短索引 = 0
      }
      const 本次灯魂名称 = `灯魂_${最短索引}`
      this.模拟循环.添加buff?.({ 名称: 本次灯魂名称, 对象: '目标' })
    }
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('明灯')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 返闭惊魂

export const 返闭惊魂类型 = typeof 返闭惊魂
