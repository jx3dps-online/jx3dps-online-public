import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 笑醉狂 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '笑醉狂')!
  技能名称 = '笑醉狂'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  读条时间() {
    // return this.模拟循环.校验奇穴是否存在('酣饮') ? 160 : 48
    // 暂时做成1秒，因为1秒回蓝一次，一般就GCD里读一次
    // return this.模拟循环.校验奇穴是否存在('酣饮') ? 160 : 48
    return 16
  }

  命中() {
    this.保存释放记录()
  }

  读条() {
    const 时长 = this.读条时间()
    for (let 时间 = 16; 时间 <= 时长; 时间 += 16) {
      this.模拟循环.添加待生效事件队列([
        {
          事件名称: '技能读条',
          事件时间: this.模拟循环.当前时间 + 时间,
          事件备注: { 技能名称: this.技能名称, 最后一跳: 时间 === 时长 },
        },
      ])
    }
  }

  读条伤害(最后一跳: boolean) {
    if (this.模拟循环.秘籍.笑醉狂?.includes('内力回复')) this.模拟循环.更新内力(5, '笑醉狂秘籍')
    if (最后一跳 && this.模拟循环.校验奇穴是否存在('无咎')) this.模拟循环.更新内力(40, '无咎')
  }
}

export default 笑醉狂
