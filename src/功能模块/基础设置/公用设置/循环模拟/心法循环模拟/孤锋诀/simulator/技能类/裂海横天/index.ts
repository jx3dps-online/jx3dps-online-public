import 循环模拟技能基础数据 from '../../../constant/skill'
import cangyi from '../../../assets/dandao.png'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 裂海横天 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '裂海横天')

  constructor(模拟循环) {
    super(模拟循环)

    // 因为横断技能充能信息受奇穴影响，这里做覆盖
    裂海横天.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '裂海横天')

    this.初始化技能运行数据()
  }

  命中() {
    this.保存释放记录()
    if (this.模拟循环.当前自身buff列表?.['沧逸']?.当前层数) {
      this.模拟循环.添加buff?.({ 名称: '倾怒', 对象: '自身' })
      this.模拟循环.卸除buff?.({ 名称: '沧逸', 对象: '自身' })
    } else {
      this.模拟循环.添加buff?.({ 名称: '沧逸', 对象: '自身' })
      this.模拟循环.卸除buff?.({ 名称: '倾怒', 对象: '自身' })
    }
  }

  沧逸初始化() {
    this.模拟循环.添加buff?.({ 名称: '沧逸', 对象: '自身' })
  }

  保存释放记录() {
    const 实际伤害技能 = this.模拟循环.当前自身buff列表?.['沧逸']?.当前层数 ? '倾怒' : '沧逸'

    const 实际图标 =
      实际伤害技能 === '沧逸'
        ? 'https://icon.jx3box.com/icon/27096.png'
        : 'https://icon.jx3box.com/icon/27097.png'

    this.本次释放记录 = {
      实际伤害技能: 实际伤害技能,
      实际图标: 实际图标,
    } as any
  }
}

export default 裂海横天

export const 裂海横天类型 = typeof 裂海横天
