import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 劲风簇 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '劲风簇')

  constructor(模拟循环) {
    super(模拟循环)
  }

  造成伤害() {
    this.模拟循环.棘矢引爆贯穿判定('劲风簇')
    this.模拟循环.金乌箭判定()
    this.模拟循环.标鹄判定()
    this.触发伤害行为('劲风簇')
  }

  命中() {
    this.模拟循环.GCD组.公共 = Math.max((this.模拟循环.GCD组.公共 || 0) - 8, 0)
  }

  释放后() {
    this.模拟循环.卸除buff?.({ 名称: '饮羽簇追', 对象: '自身' })
    this.模拟循环.添加buff({ 名称: '劲风簇追', 对象: '自身', 新增层数: 1 })
    this.模拟循环.消耗箭('劲风簇')
  }
}

export default 劲风簇

export const 劲风簇类型 = typeof 劲风簇
