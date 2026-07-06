import { ERROR_ACTION } from '../../utils'
import 技能统一类 from '../../通用类/技能统一类'
import 循环模拟技能基础数据 from '../../../constant/skill'

class 钩吻断肠追加 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '钩吻断肠·悟·追加')

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    const 钩吻追加层数 = this.模拟循环.当前自身buff列表?.['钩吻追加']?.当前层数
    if (!钩吻追加层数) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    }
  }

  造成伤害() {
    this.触发伤害行为('钩吻断肠·悟·追加')
    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['钩吻追加']),
    }
  }

  释放后() {
    // 先挂BUFF，再改变温寒，确保中和触发的中毒DOT快照能吃到
    this.模拟循环.添加buff?.({ 名称: '钩吻断肠绝章', 对象: '自身' })
    this.模拟循环.卸除buff?.({ 名称: '钩吻追加', 对象: '自身', 卸除层数: 1 })
    this.改变温寒(-1, '钩吻断肠·悟·追加') // 获得1点寒性
  }
}

export default 钩吻断肠追加

export const 钩吻断肠追加类型 = typeof 钩吻断肠追加
