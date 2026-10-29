import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { 切换武器选项 } from '../../../武器切换'
import { 额外信息类型 } from '../../type'

class 切换武器 extends 有CD技能通用类 {
  目标武器ID?: number

  释放前初始化(额外信息?: 额外信息类型) {
    this.目标武器ID = 额外信息?.目标武器ID
  }

  释放() {
    if (!切换武器选项.some((item) => item.value === this.目标武器ID)) {
      return {
        可以释放: false,
        异常信息: { 信息: '切换武器缺少有效的目标武器，请从武器列表选择' },
      }
    }
    if (!this.模拟循环.武器装备) {
      return {
        可以释放: false,
        异常信息: { 信息: '切换武器需要完整配装和可识别的起手武器，请先使用配装器' },
      }
    }
    if (this.目标武器ID === this.模拟循环.当前武器ID) {
      return { 可以释放: false, 异常信息: { 信息: '当前已持有目标武器，本次切换未消耗冷却' } }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.切换当前武器(this.目标武器ID!)
  }
}

export default 切换武器
