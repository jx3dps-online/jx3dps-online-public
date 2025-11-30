import { 按数字生成数组 } from '@/工具函数/help'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 获取实际帧数 } from '@/工具函数/data'
import { 每秒郭氏帧 } from '@/数据/常量'

class 骤风令 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '骤风令')

  constructor(模拟循环) {
    super(模拟循环)

    骤风令.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '骤风令')
    const 循环加速值 = this.模拟循环.加速值
    if (骤风令?.技能数据?.技能CD) {
      const 原始CD = 每秒郭氏帧 * 25
      const 加速后帧数 = 获取实际帧数(原始CD, 循环加速值)
      骤风令.技能数据.技能CD = 加速后帧数
    }
    this.初始化技能运行数据()
  }

  命中() {
    this.创建NPC骤风持续造成伤害()

    if (this.模拟循环.校验奇穴是否存在('茫缈')) {
      this.模拟循环.添加buff({ 名称: '茫缈', 对象: '自身' })
    }

    this.模拟循环.GCD组.公共 = Math.max((this.模拟循环.GCD组.公共 || 0) - 8)
  }

  减少调息时间(减少帧数) {
    const 待充能时间点 = this.技能运行数据.待充能时间点
    if (待充能时间点?.length) {
      const 新待充能时间点 = 待充能时间点
        .map((item) => {
          return item - 减少帧数
        })
        ?.filter((item) => {
          return item > this.模拟循环.当前时间
        })
      this.更新技能运行数据({ 待充能时间点: 新待充能时间点 })
    }
  }

  创建NPC骤风持续造成伤害() {
    const 当前时间 = this.模拟循环.当前时间 || 0

    // 正常创建的风是8跳
    const 作用次数 = 10
    // 每12帧数一次,共8秒
    const 待生效事件 = 按数字生成数组(作用次数).map((次数) => {
      return {
        事件名称: `骤风造成伤害`,
        事件时间: 当前时间 + 12 * 次数,
      }
    })

    this.模拟循环.添加待生效事件队列(待生效事件)
    this.模拟循环.添加buff({ 名称: '骤风', 对象: '目标' })
  }

  骤风造成伤害() {
    this.触发伤害行为('骤风')
  }
}

export default 骤风令

export const 骤风令类型 = typeof 骤风令
