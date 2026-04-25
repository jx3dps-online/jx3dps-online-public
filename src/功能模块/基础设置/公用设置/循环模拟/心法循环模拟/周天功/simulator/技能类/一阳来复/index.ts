import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'

class 一阳来复 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '一阳来复')
  static 释放时涣风层数 = 0

  constructor(模拟循环) {
    super(模拟循环)

    一阳来复.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '一阳来复')

    this.初始化技能运行数据()
  }

  释放() {
    const 来复 = this.模拟循环.当前自身buff列表?.['来复']?.当前层数
    if (!来复) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
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

  重置调息时间() {
    this.更新技能运行数据({ 待充能时间点: [] })
  }

  命中() {
    一阳来复.释放时涣风层数 = this.模拟循环.当前目标buff列表?.['涣风']?.当前层数 || 0

    // 分身施展
    this.模拟循环.技能类实例集合?.破穴?.命中(false, true)
    this.模拟循环.添加buff({ 名称: '一阳来复', 对象: '自身' })

    const 原来复刷新时间 = this.模拟循环.当前自身buff列表?.['来复']?.刷新时间 || 0
    this.模拟循环.卸除buff({
      名称: '来复',
      对象: '自身',
      卸除层数: 1,
      buff刷新时间: 原来复刷新时间,
    })

    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {}

    if (一阳来复.释放时涣风层数) {
      this.本次释放记录.特殊标记 = 一阳来复.释放时涣风层数
    }
  }
}

export default 一阳来复

export const 一阳来复类型 = typeof 一阳来复
