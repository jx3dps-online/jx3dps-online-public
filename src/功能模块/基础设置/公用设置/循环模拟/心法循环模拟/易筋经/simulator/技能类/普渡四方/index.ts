import { 获取实际帧数 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 每秒郭氏帧 } from '@/数据/常量'
import { ERROR_ACTION } from '../../utils'
class 普渡四方 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '普渡四方')

  constructor(模拟循环) {
    super(模拟循环)
    普渡四方.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '普渡四方')
    const 循环加速值 = this.模拟循环.加速值
    if (普渡四方?.技能数据?.技能CD) {
      const 加速后帧数 = 获取实际帧数(普渡四方?.技能数据?.技能CD, 循环加速值)
      普渡四方.技能数据.技能CD = 加速后帧数
    }
    this.初始化技能运行数据()
  }

  命中() {
    this.触发伤害行为('普渡四方', 1)
    this.触发伤害行为('普渡四方·武伤', 1)
    this.保存释放记录('普渡四方')
    this.回复禅那('普渡四方', 1)
    this.概率触发拿云()
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['擒龙', '风特效_快照', '金刚日轮']),
    }
  }
}

export default 普渡四方

export const 普渡四方类型 = typeof 普渡四方
