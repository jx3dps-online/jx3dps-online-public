import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 毒刹 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '毒刹')

  constructor(模拟循环: any) {
    super(模拟循环)
  }

  命中() {
    this?.模拟循环?.技能类实例集合?.DOT_毒刹?.获得毒刹()
    this?.保存释放记录('毒刹')
  }



  保存释放记录(名称: string) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['心无旁骛', '扬威', '神机好穷内攻增伤', '秋风散影','催寒','气魄','弩心','天风汲雨']),
    }
  }
}

export default 毒刹

export const 毒刹类型 = typeof 毒刹
