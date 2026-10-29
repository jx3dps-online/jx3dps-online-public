import { 每秒郭氏帧 } from '@/数据/常量'
import 技能统一类 from '../../通用类/技能统一类'

class 蛰微 extends 技能统一类 {
  累计督脉余量 = 0

  获得蛰微(层数: number) {
    const 当前层数 = this.模拟循环.当前自身buff列表.蛰微?.当前层数 || 0
    const 新增层数 = Math.min(层数, 50 - 当前层数)
    if (新增层数 <= 0) return

    this.模拟循环.添加buff({ 名称: '蛰微', 对象: '自身', 新增层数 })
    if (this.模拟循环.校验奇穴是否存在('一阳来复')) {
      this.模拟循环.技能类实例集合.一阳来复.减少调息时间(新增层数 * 每秒郭氏帧)
    }
  }

  累计消耗督脉(消耗督脉: number) {
    if (!this.模拟循环.校验奇穴是否存在('蛰微')) return
    if ((this.模拟循环.当前自身buff列表.蛰微?.当前层数 || 0) >= 50) return

    const 累计消耗 = this.累计督脉余量 + 消耗督脉
    this.获得蛰微(Math.floor(累计消耗 / 20))
    this.累计督脉余量 = 累计消耗 % 20
  }

  引窍引爆(督脉倍率: number, 增益: string[]) {
    const 层数 = this.模拟循环.当前自身buff列表.蛰微?.当前层数 || 0
    if (!层数) return

    this.模拟循环.卸除buff({ 名称: '蛰微', 对象: '自身', 卸除层数: 层数 })
    this.触发伤害行为('蛰微', 1, [...增益, '蛰微督脉·' + 督脉倍率], undefined, 层数)
  }
}

export default 蛰微
