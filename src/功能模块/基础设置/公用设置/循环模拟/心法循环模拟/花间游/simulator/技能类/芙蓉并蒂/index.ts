import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 芙蓉并蒂 extends 有CD技能通用类 {
  // scripts/skill/万花/万花_百花拂穴手_芙蓉并蒂.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '芙蓉并蒂')
  static 获得墨意 = 5

  constructor(模拟循环) {
    super(模拟循环)
  }

  命中() {
    this.触发伤害行为('芙蓉并蒂')
    this.获得故幽()
    this.刷新DOT()
    this.墨意变化(芙蓉并蒂.获得墨意)
    this.保存释放记录('芙蓉并蒂')
    this?.涓流函数()
  }

  获得故幽() {
    this.模拟循环.添加buff({ 名称: '故幽', 对象: '自身' })
  }

  刷新DOT() {
    // 商
    if (this?.模拟循环?.技能类实例集合?.DOT_商阳指?.DOT运行数据?.当前层数) {
      this.模拟循环.技能类实例集合.DOT_商阳指.获得和刷新商阳指('芙蓉')
    }
    // 兰
    if (this?.模拟循环?.技能类实例集合?.DOT_兰摧玉折?.DOT运行数据?.当前层数) {
      this.模拟循环.技能类实例集合.DOT_兰摧玉折.获得和刷新兰摧玉折('芙蓉')
    }
    // 钟
    if (this?.模拟循环?.技能类实例集合?.DOT_钟林毓秀?.DOT运行数据?.当前层数) {
      this.模拟循环.技能类实例集合.DOT_钟林毓秀.获得和刷新钟林毓秀('芙蓉')
    }
  }

  保存释放记录(名称) {
    const 保存显示段数 = this.模拟循环.显示涓流层数
      ? this.模拟循环.当前自身buff列表['涓流']?.当前层数 || 0
      : undefined

    this.本次释放记录 = {
      伤害段数: 保存显示段数,
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['钟灵', '倚天', '涓流', '乱洒青荷', '布散畅和']),
    }
  }
}

export default 芙蓉并蒂

export const 芙蓉并蒂类型 = typeof 芙蓉并蒂
