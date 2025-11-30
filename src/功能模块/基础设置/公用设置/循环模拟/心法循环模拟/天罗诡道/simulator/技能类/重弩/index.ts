import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/通用/通用技能/通用类/有CD技能通用类'
import { ERROR_ACTION } from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/天罗诡道/simulator/utils'

class 重弩 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '重弩')

  constructor(模拟循环: any) {
    super(模拟循环)
  }
  释放(){
    const 千机变存在 = this?.模拟循环?.技能类实例集合?.千机变?.存在()
    if (!千机变存在) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.千机变不存在,
      }
    } else {
      return { 可以释放: true }
    }
  }

  命中() {
    const 连弩存在 = this?.模拟循环?.技能类实例集合?.DOT_重弩?.存在()
    let 来源 = '千机变'
    if (连弩存在){
      来源 = '连弩'
    }
    this.模拟循环.技能类实例集合?.DOT_重弩?.获得重弩(来源)
    this.模拟循环?.技能释放后更新运行数据?.(重弩.技能数据!, this)
    this?.保存释放记录('重弩')
  }



  保存释放记录(名称: string) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['心无旁骛', '扬威', '神机好穷内攻增伤', '秋风散影','催寒','气魄','弩心','天风汲雨']),
    }
  }
}

export default 重弩

export const 重弩类型 = typeof 重弩
