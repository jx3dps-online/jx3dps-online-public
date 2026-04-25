import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'
import { 待生效事件 } from '../../type'

class 汇灵合契 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '汇灵合契')
  static 领胡首次攻击间隔 = 36
  static 领胡攻击间隔 = 24

  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  释放() {
    const 唤灵印层数 = Object.values(this.模拟循环?.角色状态信息?.换灵印)?.filter((a) => !!a).length
    if (唤灵印层数 < 4) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
  }

  命中() {
    this.保存释放记录()
    this.消耗唤灵印()
    this.释放领胡()
  }

  释放领胡() {
    if (this.模拟循环.校验奇穴是否存在('领胡')) {
      const 待生效事件: 待生效事件[] = []

      for (let i = 0; i < 4; i++) {
        const 事件时间 =
          this.模拟循环.当前时间 + 汇灵合契.领胡首次攻击间隔 + 汇灵合契.领胡攻击间隔 * i
        待生效事件.push({
          事件名称: `领胡攻击`,
          事件时间: 事件时间,
        })
      }

      this.模拟循环.添加待生效事件队列(待生效事件)
    }
  }

  领胡攻击() {
    this.触发伤害行为('领胡')
    this.模拟循环.添加buff?.({ 名称: '领胡', 对象: '自身', 新增层数: 1 })
  }

  消耗唤灵印() {
    if (this.模拟循环?.角色状态信息?.换灵印) {
      let 消耗数量 = 0
      const 当前唤灵印 = { ...this.模拟循环?.角色状态信息?.换灵印 }
      Object.keys(当前唤灵印).forEach((key) => {
        if (当前唤灵印[key] && 消耗数量 < 4) {
          当前唤灵印[key] = false
          消耗数量++
          this.模拟循环?.获得承契()
        }
      })

      this.模拟循环.角色状态信息.换灵印 = 当前唤灵印
    }
  }

  保存释放记录() {
    const 造成buff数据 = this.模拟循环.校验奇穴是否存在?.('领胡')
      ? this.获取施加重要buff信息('领胡')
      : undefined
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 汇灵合契

export const 引风唤灵类型 = typeof 汇灵合契
