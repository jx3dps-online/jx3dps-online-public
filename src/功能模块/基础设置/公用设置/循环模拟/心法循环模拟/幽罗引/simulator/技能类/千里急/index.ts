import { 获取实际帧数 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 千里急 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '千里急')
  当前千里急 = 1

  constructor(模拟循环) {
    super(模拟循环)
    千里急.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '千里急')
    this.初始化技能运行数据()
    this.当前千里急 = 1
  }

  判断当前是否释放千里急() {
    if (this.模拟循环?.GCD组?.['傀儡'] && this.模拟循环?.GCD组?.['傀儡'] > 0) {
      return false
    }
    return true
  }

  命中() {
    this.自动释放('千里急')
  }

  自动释放(名称: string, 开始时间?: number) {
    // console.log(名称, 开始时间, this.模拟循环.当前时间, this.模拟循环.上一个傀儡调释放时间, this.模拟循环.当前时间 - this.模拟循环.上一个傀儡调释放时间, 获取实际帧数(每秒郭氏帧 * 1.5, this.模拟循环.加速值))
    const 是否释放 = 名称 === '千里急' || this.判断当前是否释放千里急()
    if (!是否释放) {
      return false
    }
    const 缠绞层数 = this.模拟循环.当前目标buff列表?.['缠绞']?.当前层数
    const 是否傀儡内 = this.模拟循环.角色状态信息.状态 === '傀儡'
    const 额外buff列表 = [...(缠绞层数 ? [`缠绞·${缠绞层数}`] : []), ...(是否傀儡内 ? ['傀儡系数增伤'] : [])]
    switch (this.当前千里急) {
      case 1:
        this.触发伤害行为('千里急·壹', 1, 额外buff列表)
        this.保存释放记录('千里急·壹')
        break;
      case 2:
        this.触发伤害行为('千里急·贰', 1, 额外buff列表)
        this.保存释放记录('千里急·贰')
        break;
      case 3:
        this.触发伤害行为('千里急·叁', 1, 额外buff列表)
        this.保存释放记录('千里急·叁')
        break;
      case 4:
        this.触发伤害行为('千里急·肆', 1, 额外buff列表)
        this.保存释放记录('千里急·肆')
        break;
    }
    // this.触发伤害行为('谐调', 1)
    this.模拟循环.卸除buff?.({ 名称: '连环慢', 对象: '自身', 卸除层数: 1 })
    this.当前千里急 = (this.当前千里急) % 4 + 1
    this.模拟循环.GCD组['傀儡'] = 获取实际帧数(千里急.技能数据?.技能释放后添加GCD || 0, this.模拟循环.加速值)
    this.模拟循环.技能类实例集合?.勾线?.寄意减少CD?.()
    return true
  }


  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      伤害段数: (this.当前千里急 + 4) % 4 || 4,
      重要buff列表: this.获取当前重要buff列表(['钤束', '虚影']),
    }
  }

}

export default 千里急

export const 千里急类型 = typeof 千里急
