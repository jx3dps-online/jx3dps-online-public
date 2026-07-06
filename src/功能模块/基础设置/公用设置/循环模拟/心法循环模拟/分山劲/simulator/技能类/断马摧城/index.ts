// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 断马摧城 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '断马摧城')
  static 回复怒气 = 0

  constructor(模拟循环) {
    super(模拟循环)

    断马摧城.回复怒气 = 20

    this.初始化技能运行数据()
  }

  命中() {}

  造成伤害() {
    this.触发伤害行为('断马摧城')
  }

  释放后() {
    this.触发回复怒气(断马摧城.回复怒气, 断马摧城.技能数据?.技能名称)
    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['血怒', '血怒_惊涌', '麟光玄甲', '援戈', '橙武']),
    }
  }

  获取技能释放记录结果() {
    return {
      ...this.本次释放记录,
      底部标识: this.技能释放时怒气 || 0,
    }
  }
}

export default 断马摧城
export const 断马摧城类型 = typeof 断马摧城
