// import 循环主类 from '../main'
import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 奇门飞宫贰 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '奇门飞宫·贰')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    const 已释放技能: Set<string> | undefined = (this.模拟循环 as any)?.已释放技能
    const 已释放关键技能 =
      !!已释放技能?.has('天斗旋·悟') ||
      !!已释放技能?.has('兵主逆') ||
      !!已释放技能?.has('杀星在尾') ||
      !!已释放技能?.has('列宿游')

    // 未释放关键技能前：奇门飞宫·贰不造成伤害
    if (已释放关键技能) {
      this.触发伤害行为('飞宫·悟', 3)
    }

    // 重置返闭惊魂的调息时间
    const 返闭惊魂实例 = this.模拟循环.技能类实例集合?.['返闭惊魂']
    if (返闭惊魂实例?.重置调息时间) {
      返闭惊魂实例.重置调息时间()
    }

    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['大橙武增伤', '灵灯·悟']),
    }
  }

  技能释放后更新运行数据() {
    // 奇门飞宫贰本体取消调息时间，因为可使用的时候一定是CD好的
    // 不设置调息时间
  }
}

export default 奇门飞宫贰

export const 奇门飞宫贰类型 = typeof 奇门飞宫贰
