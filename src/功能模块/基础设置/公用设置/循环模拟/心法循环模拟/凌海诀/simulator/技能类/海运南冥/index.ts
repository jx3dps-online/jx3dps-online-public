import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 海运南冥 extends 有CD技能通用类 {
  // lua入口 20715
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '海运南冥')
  static 释放重置 = false

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    海运南冥.释放重置 = false

    const 海碧判定通过 = this.海碧判定()
    const 抟空判定通过 = this.抟空校验()
    if (海碧判定通过 || 抟空判定通过) {
      if (海碧判定通过) {
        this.减少调息时间(每秒郭氏帧 * 6)
      } else if (抟空判定通过) {
        海运南冥.释放重置 = true
      }
      this.海碧结算()
    }
    if (抟空判定通过) {
      this.获得梦悠()
    }
    this.海运南冥造成伤害()
    this.清源判定()
    this.引爆青冥('海运南冥')
    this.天行判定()
    this.保存释放记录('海运南冥')
  }

  抟空校验() {
    const 抟空层数 = this.模拟循环.当前自身buff列表?.['抟空']?.当前层数 || 0
    if (抟空层数) {
      this.模拟循环.卸除buff?.({ 名称: '抟空', 对象: '自身' })
    }
    return !!抟空层数
  }

  释放后() {
    if (海运南冥.释放重置) {
      this.更新技能运行数据({ 待充能时间点: [] })
    }
    海运南冥.释放重置 = false
  }

  海运南冥造成伤害() {
    const 鸿轨增益 = this.鸿轨判定() ? ['鸿轨'] : []
    this.触发伤害行为('海运南冥·近', 1, 鸿轨增益)
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['驰行', '太息', '游仙', '梦悠']),
    }
  }
}

export default 海运南冥

export const 海运南冥类型 = typeof 海运南冥
