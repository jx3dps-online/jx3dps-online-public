import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 截阳 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '截阳')

  constructor(模拟循环) {
    super(模拟循环)

    //
    截阳.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '截阳')

    this.初始化技能运行数据()
  }

  减少调息时间(减少帧数) {
    const 待充能时间点 = this.技能运行数据.待充能时间点
    if (待充能时间点?.length) {
      const 新待充能时间点 = 待充能时间点
        .map((item) => {
          return item - 减少帧数
        })
        ?.filter((item) => {
          return item > this.模拟循环.当前时间
        })
      this.更新技能运行数据({ 待充能时间点: 新待充能时间点 })
    }
  }

  命中() {
    this.一阳指胧雾观花云散校验()

    this?.模拟循环?.回复能量(20, '督脉')
    this.触发伤害行为?.('截阳')

    this.模拟循环.添加buff?.({ 名称: '绝脉', 对象: '目标' })
    this.模拟循环.添加buff?.({ 名称: '绝脉', 对象: '目标' })
    this.模拟循环.添加buff?.({ 名称: '绝脉', 对象: '目标' })

    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['出岫']),
    }
  }
}

export default 截阳

export const 截阳类型 = typeof 截阳
