import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 溟海御波 extends 有CD技能通用类 {
  // lua入口 20083
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '溟海御波')
  static 释放重置 = false

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    溟海御波.释放重置 = false

    const 海碧判定通过 = this.海碧判定()
    if (海碧判定通过) {
      this.减少调息时间(每秒郭氏帧 * 6)
      this.海碧结算()
    }
    this.溟海御波造成伤害()
    this.清源判定()
    this.引爆青冥('溟海御波')
    this.天行判定()

    if (this.模拟循环.当前自身buff列表?.['橙武']?.当前层数) {
      溟海御波.释放重置 = true
      this.模拟循环.技能类实例集合?.御波驾澜?.获得和刷新御波驾澜?.()
    }

    this.保存释放记录('溟海御波')
  }

  释放后() {
    if (溟海御波.释放重置) {
      this.更新技能运行数据({ 待充能时间点: [] })
    }
    溟海御波.释放重置 = false
  }

  溟海御波造成伤害() {
    const 鸿轨增益 = this.鸿轨判定() ? ['鸿轨'] : []
    this.触发伤害行为('溟海御波', 1, 鸿轨增益)
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['驰行', '太息', '游仙', '梦悠']),
    }
  }
}

export default 溟海御波

export const 溟海御波类型 = typeof 溟海御波
