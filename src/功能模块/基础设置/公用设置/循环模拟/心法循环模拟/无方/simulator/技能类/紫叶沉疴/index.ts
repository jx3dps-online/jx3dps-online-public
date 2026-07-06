import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 紫叶沉疴 extends 有CD技能通用类 {
  // scripts/skill/北天药宗/北天药宗_商陆其根.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '紫叶沉疴')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
    紫叶沉疴.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '紫叶沉疴')
  }

  命中() {
    if (this.模拟循环.校验奇穴是否存在('紫伏')) {
      this.模拟循环.添加buff({ 名称: '紫伏', 对象: '自身' })
      this.改变温寒(1, '紫叶沉疴')
    }

    this.保存释放记录()
  }
  保存释放记录() {
    const 造成buff数据 = this.模拟循环.校验奇穴是否存在('紫伏')
      ? this.获取施加重要buff信息('紫伏')
      : false
    this.本次释放记录 = {
      ...(造成buff数据 ? { 造成buff数据 } : {}),
      重要buff列表: this.获取当前重要buff列表([]),
    }
  }
}

export default 紫叶沉疴

export const 紫叶沉疴类型 = typeof 紫叶沉疴
