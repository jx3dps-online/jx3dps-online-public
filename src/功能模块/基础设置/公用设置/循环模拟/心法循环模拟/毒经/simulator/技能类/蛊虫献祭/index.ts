import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 每秒郭氏帧 } from '@/数据/常量'

class 蛊虫献祭 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '蛊虫献祭')

  constructor(模拟循环) {
    super(模拟循环)
    蛊虫献祭.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '蛊虫献祭')
    this.初始化技能运行数据()
  }

  圣蝎判断() {
    if (this.模拟循环.当前自身buff列表?.['圣蝎存在']?.当前层数) {
      this.模拟循环.卸除buff({ 名称: '圣蝎存在', 对象: '自身', 事件时间: this.模拟循环.当前时间 })

      this.模拟循环.添加buff({
        名称: '圣蝎献祭',
        对象: '自身',
        新增层数: 1,
        事件时间: this.模拟循环.当前时间,
      })

      // 释放时判断正处于CD中的技能

      for (const 技能名称 in this.模拟循环.技能类实例集合) {
        const 技能实例 = this.模拟循环.技能类实例集合[技能名称]

        if (技能名称 !== '触发橙武' && 技能实例.技能运行数据?.待充能时间点.length > 0) {
          const 剩余时间 = 技能实例.技能运行数据?.待充能时间点[0] - this.模拟循环.当前时间
          if (剩余时间 > 0) {
            const 期望减少调息时间 = Math.floor((Math.min(8 * 每秒郭氏帧, 剩余时间) * 307) / 1024)
            技能实例.减少调息时间(期望减少调息时间)
          }
        }
      }
    }
  }
  释放() {}

  命中() {
    this.保存释放记录()
    this.圣蝎判断()
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('圣蝎献祭')
    this.本次释放记录 = 造成buff数据
      ? {
          造成buff数据,
        }
      : {}
  }
}

export default 蛊虫献祭

export const 蛊虫献祭类型 = typeof 蛊虫献祭
