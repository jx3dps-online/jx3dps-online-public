import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
class 光明相 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据.find((技能) => 技能.技能名称 === '光明相')

  constructor(模拟循环) {
    super(模拟循环)
  }
  命中() {
    this.模拟循环.技能类实例集合.赤日轮.当前段数 = 0
    this.模拟循环.技能类实例集合.幽月轮.当前段数 = 0
    this.模拟循环.添加buff({
      名称: '光明相',
      对象: '自身',
      新增层数: this.模拟循环.校验奇穴是否存在('夷数神光') ? 3 : 1,
    })
    this.保存释放记录()
  }
  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: ['光明相'],
    }
  }
}
export default 光明相
