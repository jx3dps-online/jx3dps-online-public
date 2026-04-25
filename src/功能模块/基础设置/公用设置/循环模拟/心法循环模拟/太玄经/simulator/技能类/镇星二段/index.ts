import 循环模拟技能基础数据 from '../../../constant/skill'
import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 镇星二段 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '镇星入舆')

  constructor(模拟循环) {
    super(模拟循环)
    镇星二段.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '镇星入舆')
    this.初始化技能运行数据()
  }

  释放() {
    if (!this.模拟循环.当前自身buff列表?.['入舆']?.当前层数) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.BUFF错误 }
    }

    return { 可以释放: true }
  }

  命中() {
    this.触发伤害行为('镇星入舆')
    // this.刷新鬼遁()
    // this.延长火离()
    if (this.连局判定()) {
      this.模拟循环.添加buff({ 名称: '镇星', 对象: '自身' })
    }
    this.保存释放记录('镇星入舆')
    this.模拟循环.添加buff({ 名称: '入舆', 对象: '自身', 新增层数: -1 })
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['荧入白', '鬼遁', '镇星', '明灯']),
    }
  }

  // 延长火离() {
  //   if (this.模拟循环.技能类实例集合.DOT_祝由_火离.获取当前DOT层数()) {
  //     this.模拟循环.技能类实例集合.DOT_祝由_火离.延长跳数(5, '镇星二段')
  //   }
  // }
}

export default 镇星二段

export const 起卦类型 = typeof 镇星二段
