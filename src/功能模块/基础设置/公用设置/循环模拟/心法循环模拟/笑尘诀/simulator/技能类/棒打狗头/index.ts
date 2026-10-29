import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 棒打狗头 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '棒打狗头')!
  技能名称 = '棒打狗头'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(30, this.技能名称)
  }

  造成伤害() {
    const 逍遥 = !!this.模拟循环.当前自身buff列表.逍遥
    this.登记伤害('棒打狗头·一', 逍遥 ? 4 : 0)
    this.登记伤害('棒打狗头·二', 逍遥 ? 6 : 0)
  }

  延迟生效(伤害名称: string) {
    if (伤害名称 === '棒打狗头·一' && this.模拟循环.当前自身buff列表.复征) {
      this.登记伤害('醉影·一', 0, 1, this.模拟循环.校验奇穴是否存在('棒挑') ? 6 : 5)
      this.模拟循环.卸除buff({ 名称: '复征', 对象: '自身' })
    }
  }
}

export default 棒打狗头
