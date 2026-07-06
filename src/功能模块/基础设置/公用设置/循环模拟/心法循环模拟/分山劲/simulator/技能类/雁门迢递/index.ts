// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 雁门迢递 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '雁门迢递')
  static 回复怒气 = 0

  constructor(模拟循环) {
    super(模拟循环)

    雁门迢递.回复怒气 = 15
  }
  释放() {
    const 雁门迢递可释放 = this.模拟循环.当前自身buff列表?.['雁门迢递可释放标记']?.当前层数

    if (雁门迢递可释放) {
      // 释放雁门迢递，移除月照标记，添加雁门迢递标记
      this.模拟循环.卸除buff?.({ 名称: '雁门迢递可释放标记', 对象: '自身', 卸除层数: 1 })
    } else {
      return {
        可以释放: false,
        异常信息: '雁门迢递不可释放，缺少雁门迢递可释放标记',
      }
    }
    return { 可以释放: true }
  }
  造成伤害(索引) {
    this.触发伤害行为('雁门迢递')
    // 阵云破招是9级
    this.触发伤害行为('破', 1, [], undefined, false, 9)
  }

  释放后() {
    this.触发回复怒气(雁门迢递.回复怒气, 雁门迢递.技能数据?.技能名称)
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

export default 雁门迢递
export const 雁门迢递类型 = typeof 雁门迢递
