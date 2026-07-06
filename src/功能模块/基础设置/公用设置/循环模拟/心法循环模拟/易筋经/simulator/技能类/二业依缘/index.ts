import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 二业依缘 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '二业依缘')

  constructor(模拟循环) {
    super(模拟循环)
    二业依缘.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '二业依缘')
    this.初始化技能运行数据()
  }

  命中() {
    const 当前状态 = this.模拟循环.角色状态信息.状态
    this.模拟循环.角色状态信息.状态 = 当前状态 === '伏魔' ? '袈裟' : '伏魔'
    if (当前状态 === '伏魔') {
      this.减少调息时间(每秒郭氏帧 * 60)
    } else {
      this.模拟循环.技能类实例集合.守缺式?.刷新自身CD()
    }
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['擒龙', '风特效_快照', '金刚日轮']),
    }
  }
}

export default 二业依缘

export const 二业依缘类型 = typeof 二业依缘
