import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 玳弦急曲 extends 有CD技能通用类 {
  // scripts/skill/北天药宗/北天药宗_奚毒射罔.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '芳姿畅音')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  命中() {
    this.模拟循环.添加buff({ 名称: '芳姿畅音', 对象: '自身' })
  }

  释放后() {
    this.保存释放记录('芳姿畅音')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
    }
  }
}

export default 玳弦急曲

export const 玳弦急曲类型 = typeof 玳弦急曲
