// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 盾刀 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '盾刀')
  static 回复怒气 = 0
  static 技能图标 = 'https://icon.jx3box.com/icon/6327.png'

  constructor(模拟循环) {
    super(模拟循环)

    盾刀.回复怒气 = 5
  }
  判断盾刀触发伤害() {
    const 盾刀层数 = this.模拟循环.当前自身buff列表?.['盾刀标记']?.当前层数
    if (!盾刀层数) {
      this.触发伤害行为?.('盾刀·一')
      // 添加隐藏BUFF用于触发二段
      this.模拟循环.添加buff?.({ 名称: '盾刀标记', 对象: '自身', 新增层数: 1 })
    } else if (盾刀层数 === 1) {
      this.触发伤害行为?.('盾刀·二')
      // 消耗二段buff，添加三段buff
      this.模拟循环.添加buff?.({ 名称: '盾刀标记', 对象: '自身', 新增层数: 1 })
    } else if (盾刀层数 === 2) {
      this.触发伤害行为?.('盾刀·三')
      if (this?.模拟循环?.秘籍?.['盾刀']?.some((a) => a === '三段回怒')) {
        this.模拟循环?.回复怒气?.(5, '盾刀')
      }
      // 消耗三段buff
      this.模拟循环.卸除buff?.({ 名称: '盾刀标记', 对象: '自身', 卸除层数: 2 })
    }
  }
  命中() {
    盾刀.技能图标 = this.判断盾刀图标()
    this.保存释放记录()
  }

  造成伤害() {
    this.判断盾刀触发伤害()
  }

  释放后() {
    this.触发回复怒气(盾刀.回复怒气, 盾刀.技能数据?.技能名称)
  }

  判断盾刀图标() {
    if (this.模拟循环?.当前自身buff列表?.['盾刀标记']?.当前层数 === 1) {
      return 'https://icon.jx3box.com/icon/6328.png'
    } else if (this.模拟循环?.当前自身buff列表?.['盾刀标记']?.当前层数 === 2) {
      return 'https://icon.jx3box.com/icon/6329.png'
    } else {
      return 'https://icon.jx3box.com/icon/6327.png'
    }
  }

  保存释放记录() {
    this.本次释放记录 = {
      实际图标: 盾刀.技能图标,
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

export default 盾刀
export const 盾刀类型 = typeof 盾刀
