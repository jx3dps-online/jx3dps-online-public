import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 龙吟 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '龙吟')
  static 释放重置 = false

  constructor(模拟循环) {
    super(模拟循环)
    龙吟.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '龙吟')
    this.初始化技能运行数据()
  }

  释放后() {
    if (龙吟.释放重置) {
      this.更新技能运行数据({ 待充能时间点: [] })
    }
    龙吟.释放重置 = false
  }

  命中() {
    龙吟.释放重置 = false

    if (this.模拟循环.当前自身buff列表?.['橙武']?.当前层数) {
      龙吟.释放重置 = true
    }
    if (this.模拟循环.校验奇穴是否存在('牧云')) {
      this.模拟循环.添加buff?.({ 名称: '牧云', 对象: '自身', 新增层数: 1 })
    }
    this.龙吟造成伤害()

    this.保存释放记录('龙吟')
  }

  龙吟造成伤害() {
    this.触发伤害行为('龙吟')
    this?.模拟循环?.技能类实例集合?.['流血']?.获得和刷新流血()
    this.回复战意('龙吟', 2)
    this.保存释放记录('龙吟')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['牧云', '驰骋·1', '驰骋·2', '激雷', '夜征', '渊']),
    }
  }
}

export default 龙吟

export const 龙吟类型 = typeof 龙吟
