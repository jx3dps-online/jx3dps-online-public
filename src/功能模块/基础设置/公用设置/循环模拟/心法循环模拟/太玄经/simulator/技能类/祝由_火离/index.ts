import 循环模拟技能基础数据 from '../../../constant/skill'
import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 祝由_火离 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '祝由_火离')

  constructor(模拟循环) {
    super(模拟循环)
    祝由_火离.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '祝由_火离')
    this.初始化技能运行数据()
  }
  // 暂留，此处为焚诀预备模块
  // 统一初始化(额外信息) {
  //   super.统一初始化(额外信息)
  //   this.本次释放延迟 = 额外信息?.延迟 ?? 16
  // }

  释放() {
    if (
      !this.模拟循环.当前自身buff列表?.['祝由释放允许']?.当前层数 ||
      !this.模拟循环.当前自身buff列表?.['卦象_火离']?.当前层数
    ) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.BUFF错误 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.技能类实例集合?.['DOT_祝由_火离']?.获得和刷新祝由_火离()
    this.模拟循环.卸除buff({ 名称: '祝由释放允许', 卸除层数: 1 })
    // 世降：施展祝由·火离后6秒内消耗星运会产生共鸣
    if (this.模拟循环.校验奇穴是否存在('世降')) {
      this.模拟循环.添加buff({ 名称: '世降共鸣', 对象: '自身' })
    }
  }

  // 世降共鸣：每次消耗星运时延长火离DOT 2秒并对附着目标额外造成伤害
  世降共鸣处理() {
    if (
      !this.模拟循环.校验奇穴是否存在('世降') ||
      !this.模拟循环.当前自身buff列表?.['世降共鸣']?.当前层数
    ) {
      return
    }
    const DOT实例 = this.模拟循环.技能类实例集合?.['DOT_祝由_火离']
    if (!DOT实例?.获取当前DOT层数()) {
      return
    }
    DOT实例.延长持续2秒('世降')
    this.触发伤害行为('世降')
  }
}

export default 祝由_火离

export const 祝由_火离类型 = typeof 祝由_火离
