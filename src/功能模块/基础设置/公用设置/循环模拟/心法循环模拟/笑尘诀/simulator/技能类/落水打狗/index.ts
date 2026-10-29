import { 获取实际帧数 } from '@/工具函数/data'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 落水打狗 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '落水打狗')!
  技能名称 = '落水打狗'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  读条时间() {
    return 获取实际帧数(落水打狗.技能数据.读条时间!, this.模拟循环.加速值)
  }

  命中() {
    this.保存释放记录()
  }

  读条() {
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: '技能读条',
        事件时间: this.模拟循环.当前时间 + this.读条时间(),
        事件备注: { 技能名称: this.技能名称 },
      },
    ])
  }

  读条伤害() {
    this.触发伤害行为('落水打狗·命中')
    this.模拟循环.添加buff({ 名称: '落水打狗', 新增层数: 5 })
  }
}

export default 落水打狗
