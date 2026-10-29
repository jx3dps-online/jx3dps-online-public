import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'

class 龙骧虎步 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '龙骧虎步')
  }

  释放() {
    if (this.模拟循环.角色状态信息.体态 === '雪絮金屏' && !this.模拟循环.奇穴.includes('荡岳'))
      return { 可以释放: false, 异常信息: ERROR_ACTION.体态错误 }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.开始战斗()
  }

  造成伤害() {
    const 模拟 = this.模拟循环
    if (模拟.角色状态信息.体态 === '松烟竹雾') this.触发伤害行为('龙骧虎步·双刀')
    else {
      const 二段 = !!模拟.当前自身buff列表['龙骧·二段']
      this.触发伤害行为(二段 ? '龙骧虎步·大刀2段' : '龙骧虎步·大刀1段')
      if (二段) 模拟.卸除buff({ 名称: '龙骧·二段', 对象: '自身' })
      else 模拟.添加buff({ 名称: '龙骧·二段', 对象: '自身' })
    }
    ;(['狂意', '刀魂', '气劲'] as const).forEach((资源) => 模拟.变更资源(资源, 30, '龙骧虎步'))
    模拟.添加buff({ 名称: '龙骧', 对象: '自身' })
  }
}

export default 龙骧虎步
