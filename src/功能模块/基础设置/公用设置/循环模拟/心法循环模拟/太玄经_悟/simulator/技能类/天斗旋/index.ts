// import 循环主类 from '../main'
import { 获取实际帧数 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import { 待生效事件 } from '../../type'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 每秒郭氏帧 } from '@/数据/常量'

class 天斗旋 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '天斗旋·悟')

  constructor(模拟循环) {
    super(模拟循环)
    天斗旋.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '天斗旋·悟')
    this.初始化技能运行数据()
  }

  获取读条时间() {
    return 获取实际帧数(天斗旋.技能数据?.读条时间, this.模拟循环.加速值)
  }

  读条(读条开始时间) {
    const 待生效事件队列: 待生效事件[] = []
    const 读条帧数 = this.获取读条时间()

    待生效事件队列.push({
      事件名称: '技能读条',
      事件时间: 读条开始时间 + 读条帧数,
      事件备注: {
        技能名称: '天斗旋·悟',
      },
    })
    this.模拟循环.添加待生效事件队列?.(待生效事件队列)
  }

  读条结束后() {
    this.保存释放记录()
    this.延长持续时间('灵灯')
    this.触发伤害行为('天斗旋·悟', 1)
    this.触发伤害行为('天斗旋·悟·秘籍', 1)
    this.触发伤害行为('辰星·悟', 1)
  }

  延长持续时间(Buff名称: string) {
    this.模拟循环.延长Buff?.({
      名称: Buff名称,
      对象: '自身',
      来源: '天斗旋·悟',
      延长时间: 每秒郭氏帧 * 1, // 延长1秒
    })
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['明灯·悟', '灵灯·悟', '大招增伤']),
    }
  }
}

export default 天斗旋

export const 天斗旋类型 = typeof 天斗旋
