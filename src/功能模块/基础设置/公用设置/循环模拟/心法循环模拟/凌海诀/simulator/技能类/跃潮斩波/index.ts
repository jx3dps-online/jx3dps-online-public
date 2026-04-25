import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 跃潮斩波 extends 有CD技能通用类 {
  // lua入口 19818
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '跃潮斩波')

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    this.跃潮斩波造成伤害()

    // 溯徊
    if (this.模拟循环.校验奇穴是否存在('溯徊')) {
      this.获得梦悠()
    }

    if (this.模拟循环.当前自身buff列表?.['物化天行']?.当前层数) {
      this.折伞落地()
    }

    this.保存释放记录('跃潮斩波')
  }

  跃潮斩波造成伤害() {
    this.触发伤害行为('跃潮斩波')
    this.触发伤害行为('破', 1, [], undefined, 5)
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['太息', '游仙', '梦悠']),
    }
  }
}

export default 跃潮斩波

export const 跃潮斩波类型 = typeof 跃潮斩波
