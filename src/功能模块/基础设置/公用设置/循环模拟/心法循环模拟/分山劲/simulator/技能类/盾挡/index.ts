// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 盾挡 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '盾挡')
  static 消耗怒气等级 = 0
  static 最低消耗怒气 = 10
  static 最高消耗怒气 = 100

  constructor(模拟循环) {
    super(模拟循环)
    const 存在坚韧奇穴 = this.模拟循环.校验奇穴是否存在?.('坚韧')
    if (存在坚韧奇穴) {
      盾挡.最高消耗怒气 = 200
    } else {
      盾挡.最高消耗怒气 = 100
    }
  }
  释放() {
    const 当前怒气 = this.模拟循环.角色状态信息?.怒气 || 0
    if (当前怒气 < 盾挡.最低消耗怒气) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.怒气不足,
      }
    }
    return { 可以释放: true }
  }

  判定盾挡怒气消耗() {
    const 当前怒气 = this.模拟循环.角色状态信息?.怒气 || 0
    const 消耗怒气等级 = Math.floor(Math.min(当前怒气, 盾挡.最高消耗怒气) / 10)
    return {
      消耗怒气等级: 消耗怒气等级,
    }
  }
  命中() {
    const 盾挡等级 = this.判定盾挡怒气消耗()
    this.触发消耗怒气(盾挡等级.消耗怒气等级 * 10, 盾挡.技能数据?.技能名称)
    this.模拟循环.添加buff?.({ 名称: '盾挡', 对象: '自身', ...盾挡等级 })
    this.模拟循环.添加buff?.({ 名称: '振奋', 对象: '自身', 新增层数: 88 })
  }

  释放后() {
    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['血怒', '血怒_惊涌', '麟光玄甲', '援戈', '橙武']),
    }
  }

  获取技能释放记录结果() {
    return {
      ...this.本次释放记录,
      底部标识: this.技能释放时怒气 || 0,
    }
  }
}

export default 盾挡
export const 盾挡类型 = typeof 盾挡
