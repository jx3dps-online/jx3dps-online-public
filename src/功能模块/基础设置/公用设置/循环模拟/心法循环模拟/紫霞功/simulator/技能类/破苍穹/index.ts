import { 每秒郭氏帧 } from '@/数据/常量'
import { 获取实际帧数 } from '@/工具函数/data'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 破苍穹Buff名称 } from '../../../constant'
import { 获取当前破苍穹 } from '../../utils'

class 破苍穹 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  获取读条时间() {
    return 获取实际帧数(每秒郭氏帧, this.模拟循环.加速值)
  }

  读条(开始时间: number) {
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: '技能读条',
        事件时间: 开始时间 + this.获取读条时间(),
        事件备注: { 技能名称: '破苍穹' },
      },
    ])
  }

  读条命中() {
    const Buff列表 = this.模拟循环.当前自身buff列表
    const 空位 = 破苍穹Buff名称.find((名称) => !Buff列表[名称]?.当前层数)
    const 名称 =
      空位 ?? 获取当前破苍穹(Buff列表).sort((甲, 乙) => 甲.刷新时间! - 乙.刷新时间!)[0].名称
    if (!空位) this.模拟循环.卸除buff({ 名称, 对象: '自身' })
    this.模拟循环.添加buff({ 名称, 对象: '自身' })
    const Buff = Buff列表[名称]
    this.本次释放记录 = {
      造成buff数据: {
        buff名称: 名称,
        buff开始时间: Buff.刷新时间!,
        buff结束时间: Buff.刷新时间! + Buff.最大持续时间!,
      },
    }
  }
}

export default 破苍穹
