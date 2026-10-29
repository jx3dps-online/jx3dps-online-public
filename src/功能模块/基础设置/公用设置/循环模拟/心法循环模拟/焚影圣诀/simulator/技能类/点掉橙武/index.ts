import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
class 点掉橙武 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '点掉橙武')
  命中() {
    this.模拟循环.卸除buff({ 名称: '橙武', 对象: '自身', 卸除层数: 4 })
  }
}
export default 点掉橙武
