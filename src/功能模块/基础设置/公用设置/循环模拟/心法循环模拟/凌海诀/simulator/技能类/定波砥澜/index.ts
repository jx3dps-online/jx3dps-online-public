import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 定波砥澜 extends 有CD技能通用类 {
  // lua入口 19827
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '定波砥澜')

  constructor(模拟循环) {
    super(模拟循环)
    定波砥澜.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '定波砥澜')
    this.初始化技能运行数据()
  }

  命中() {
    if (this.模拟循环.校验奇穴是否存在('浪斥')) {
      if (this.模拟循环?.技能类实例集合?.振翅图南?.存在振翅图南校验()) {
        this.触发伤害行为('浪斥', 1, ['风车增伤'])
      } else {
        this.触发伤害行为('浪斥')
      }
    }

    this.保存释放记录('定波砥澜')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['太息', '游仙', '梦悠']),
    }
  }
}

export default 定波砥澜

export const 定波砥澜类型 = typeof 定波砥澜
