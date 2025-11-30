import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 千机连环 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '千机连环')

  constructor(模拟循环: any) {
    super(模拟循环)
  }

  命中() {
    this?.模拟循环?.技能类实例集合?.DOT_千机连环?.获得千机连环()
    this?.保存释放记录('千机连环')
  }



  保存释放记录(名称: string) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['心无旁骛', '扬威', '神机好穷内攻增伤', '秋风散影','催寒','气魄','弩心','天风汲雨']),
    }
  }
}

export default 千机连环

export const 千机连环类型 = typeof 千机连环
