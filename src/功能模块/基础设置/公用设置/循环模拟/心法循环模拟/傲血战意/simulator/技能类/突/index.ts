import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 突 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '突')

  constructor(模拟循环) {
    super(模拟循环)
    突.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '突')
    this.初始化技能运行数据()
  }

  命中() {
    this.下马处理()
    //if (this.模拟循环.校验奇穴是否存在('牧云')) {
    //  this.模拟循环.卸除buff?.({ 名称: '牧云', 对象: '自身', 卸除层数: 4 })
    // this.模拟循环.添加buff?.({ 名称: '牧云', 对象: '自身', 新增层数: 1 })
    //}
    this.触发伤害行为('突')

    //this.保存释放记录()
  }

  //保存释放记录() {
  //const 造成buff数据 = this.获取施加重要buff信息('牧云')
  //this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  //}
}

export default 突

export const 突类型 = typeof 突

// /cast [rage>4] 龙牙
// /cast [rage<4] 灭
// /cast [rage<4] 龙吟
// /cast 穿云
