import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'

class 游雾乘云 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '游雾乘云')

  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  释放() {
    const 唤灵印层数 = Object.values(this.模拟循环?.角色状态信息?.换灵印)?.filter((a) => !!a).length
    const 校验层数 = this.模拟循环.校验奇穴是否存在('星烨') ? 2 : 1
    if (唤灵印层数 < 校验层数) {
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
    this.模拟循环?.添加buff({ 名称: '游雾乘云', 对象: '自身' })
    this.开启乘黄之威续期('游雾乘云')
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: `下马`,
        事件时间: this.模拟循环.当前时间 + 每秒郭氏帧 * 10,
      },
    ])
    if (this.模拟循环.校验奇穴是否存在('星烨')) {
      this.模拟循环?.添加buff({ 名称: '星烨', 对象: '自身' })
      this.消耗唤灵印(true)
      this.重置调息时间()
    } else {
      this.消耗唤灵印(false)
    }

    this.模拟循环?.获得承契()
  }

  消耗唤灵印(全部消耗?) {
    if (this.模拟循环?.角色状态信息?.换灵印) {
      const 当前唤灵印 = { ...this.模拟循环?.角色状态信息?.换灵印 }
      if (全部消耗) {
        Object.keys(当前唤灵印).forEach((key) => {
          if (当前唤灵印[key]) {
            当前唤灵印[key] = false
          }
        })
      } else {
        let 已消耗 = false
        Object.keys(当前唤灵印).forEach((key) => {
          if (当前唤灵印[key] && !已消耗) {
            当前唤灵印[key] = false
            已消耗 = true
          }
        })
      }

      this.模拟循环.角色状态信息.换灵印 = 当前唤灵印
    }
  }

  保存释放记录() {
    const 造成buff数据 = this.模拟循环.校验奇穴是否存在?.('星烨')
      ? this.获取施加重要buff信息('星烨')
      : undefined
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 游雾乘云

export const 引风唤灵类型 = typeof 游雾乘云
