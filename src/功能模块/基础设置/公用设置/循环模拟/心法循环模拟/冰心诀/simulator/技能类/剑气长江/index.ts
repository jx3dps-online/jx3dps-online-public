import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 剑气长江 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '剑气长江')
  static 释放重置 = false

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.触发伤害行为('剑气长江', 1)
    if (this.模拟循环.当前自身buff列表.芳姿畅音?.当前层数) {
      this.模拟循环.添加buff({ 名称: '仙姿剑气', 对象: '自身', 新增层数: 1 })
      this.模拟循环.卸除buff({ 名称: '芳姿畅音', 对象: '自身' })
    }
    if (this.模拟循环.当前自身buff列表?.仙姿剑气?.当前层数) {
      this.触发伤害行为('留芳仙姿·剑气')
      this.新增钗燕层数('留芳仙姿·剑气')
      this.回复剑舞(1)
    }
    this.新增钗燕层数('剑气长江')
    this.回复剑舞(1)
    this.消耗盈袖(2)
    if (this.模拟循环.奇穴.includes('明空')) {
      this?.模拟循环?.技能类实例集合?.['剑破虚空']?.减少调息时间(每秒郭氏帧 * 0.5)
    }
    if (this.模拟循环.当前自身buff列表?.橙武?.当前层数) {
      this.模拟循环.技能类实例集合?.气吞长江?.获得和刷新气吞长江()
      this.减少调息时间(每秒郭氏帧 * 3)
      this.回复剑舞(1)
    }
    this.模拟循环.卸除buff({ 名称: '满堂', 对象: '自身', 卸除层数: 1 })
    this.保存释放记录('剑气长江')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['繁音急节', '仙姿剑气']),
    }
  }
}

export default 剑气长江

export const 剑气长江类型 = typeof 剑气长江
