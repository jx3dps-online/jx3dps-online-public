import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 战八方 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '战八方')

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    this.触发伤害行为('战八方·一')
    this.触发伤害行为('战八方·二三', 1, [], this.模拟循环.当前时间 + 4)
    this.触发伤害行为('战八方·二三', 1, [], this.模拟循环.当前时间 + 8)
    this.本次释放记录 = {
      实际伤害技能: '战八方·一',
      伤害段数: 3,
      重要buff列表: this.获取当前重要buff列表(['牧云', '驰骋·1', '驰骋·2', '激雷', '夜征', '渊']),
    }
  }
}

export default 战八方

export const 战八方类型 = typeof 战八方
