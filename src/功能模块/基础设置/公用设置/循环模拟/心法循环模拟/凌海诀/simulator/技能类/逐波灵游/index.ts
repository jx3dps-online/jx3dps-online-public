import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 逐波灵游 extends 有CD技能通用类 {
  // lua入口 20084
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '逐波灵游')
  static 释放重置 = false

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    逐波灵游.释放重置 = false

    this.梦悠判定()
    this.逐波灵游造成伤害()
    this.清源判定()
    this.海碧判定()
    this.天行判定()

    if (this.模拟循环.当前自身buff列表?.['橙武']?.当前层数) {
      逐波灵游.释放重置 = true
      this.模拟循环.技能类实例集合?.御波驾澜?.获得和刷新御波驾澜?.()
    }

    this.保存释放记录('逐波灵游')
  }

  梦悠判定() {
    if (this.模拟循环.校验奇穴是否存在('梦悠')) {
      this.获得梦悠()
    } else {
      // this?.模拟循环?.技能类实例集合?.['驰风震域']?.获得驰风震域()
    }
  }

  释放后() {
    if (逐波灵游.释放重置) {
      this.更新技能运行数据({ 待充能时间点: [] })
    }
    逐波灵游.释放重置 = false
  }

  逐波灵游造成伤害() {
    const 鸿轨增益 = this.鸿轨判定() ? ['鸿轨'] : []
    this.触发伤害行为('逐波灵游', 1, 鸿轨增益)
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['驰行', '太息', '游仙', '梦悠']),
    }
  }
}

export default 逐波灵游

export const 逐波灵游类型 = typeof 逐波灵游
