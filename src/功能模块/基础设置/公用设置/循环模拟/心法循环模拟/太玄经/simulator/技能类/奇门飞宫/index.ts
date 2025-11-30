import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 奇门飞宫 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '奇门飞宫')
  static 个数索引 = -1
  static 最大索引 = 3
  constructor(模拟循环) {
    super(模拟循环)
    奇门飞宫.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '奇门飞宫')
    奇门飞宫.个数索引 = -1

    // 踏斗
    if (this.模拟循环.校验奇穴是否存在('踏斗')) {
      奇门飞宫.最大索引 = 1
    } else {
      奇门飞宫.最大索引 = 3
    }

    this.初始化技能运行数据()
  }

  命中() {
    this.添加灯()
    this.刷新鬼遁()
  }

  添加灯() {
    const 本次索引 = (奇门飞宫.个数索引 + 1) % 奇门飞宫.最大索引
    奇门飞宫.个数索引 = 本次索引
    const 本次灯魂名称 = `灯魂_${本次索引}`
    this.模拟循环.添加buff?.({ 名称: 本次灯魂名称, 对象: '目标' })

    // this?.模拟循环?.技能类实例集合?.['纵横三才']?.自动三才校验?.()
  }

  灯存在判定() {
    return (
      this.模拟循环.当前目标buff列表['灯魂_0']?.当前层数 ||
      this.模拟循环.当前目标buff列表['灯魂_1']?.当前层数 ||
      this.模拟循环.当前目标buff列表['灯魂_2']?.当前层数
    )
  }

  // 保存释放记录() {
  //   const 造成buff数据 = this.获取施加重要buff信息()
  //   this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  // }
}

export default 奇门飞宫

export const 奇门飞宫类型 = typeof 奇门飞宫
