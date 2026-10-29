import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 灭影追风 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '灭')

  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  // 这里单独写灭的卡GCD释放逻辑

  命中() {
    this.模拟循环.添加buff?.({ 名称: '灭影追风', 对象: '自身' })

    this.模拟循环.切换角色体态?.('双刀', 灭影追风.技能数据?.技能名称)
    if (this.模拟循环.校验奇穴是否存在?.('威声')) {
      this.模拟循环.添加buff?.({ 名称: '威声', 对象: '自身' })
    }

    if (this.模拟循环.校验奇穴是否存在?.('观衅')) {
      this.模拟循环.技能类实例集合?.弱点?.立即获得并刷新弱点()
    }

    this.保存释放记录()
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('灭影追风')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 灭影追风

export const 灭影随风类型 = typeof 灭影追风
