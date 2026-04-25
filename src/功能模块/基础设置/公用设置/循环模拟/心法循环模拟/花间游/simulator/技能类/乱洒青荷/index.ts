import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 乱洒青荷 extends 有CD技能通用类 {
  // scripts/skill/万花\万花_养心决_乱洒青荷.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '乱洒青荷')
  static 是否强化过水佩 = true

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
    乱洒青荷.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '乱洒青荷')
  }

  命中() {
    this?.模拟循环?.技能类实例集合?.['玉石俱焚']?.重置调息时间()
    this.模拟循环?.添加buff({ 名称: '乱洒青荷', 对象: '自身' })
    if (this?.模拟循环?.校验奇穴是否存在('渲青')) {
      this?.模拟循环?.添加buff({ 名称: '渲青青荷', 对象: '自身', 新增层数: 2 })
    }
    this.模拟循环?.添加buff({ 名称: '青荷', 对象: '自身' })
    if (this?.模拟循环?.校验奇穴是否存在('水佩')) {
      乱洒青荷.是否强化过水佩 = false
    }

    this.墨意变化(20)
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('乱洒青荷')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 乱洒青荷

export const 乱洒青荷类型 = typeof 乱洒青荷
