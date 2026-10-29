// import { 获取实际帧数 } from '@/工具函数/data'
import { 每秒郭氏帧 } from '@/数据/常量'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'

class 一阳来复 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    const 技能数据 = this.模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '一阳来复')
    // if (技能数据) 技能数据.技能CD = 获取实际帧数(每秒郭氏帧 * 40, 模拟循环.加速值)
    if (技能数据) 技能数据.技能CD = 每秒郭氏帧 * 40
  }

  释放() {
    return this.模拟循环.校验奇穴是否存在('一阳来复') && this.模拟循环.校验奇穴是否存在('蛰微')
      ? { 可以释放: true }
      : { 可以释放: false, 异常信息: ERROR_ACTION.BUFF错误 }
  }

  命中() {
    if (!this.模拟循环.当前自身buff列表.一阳来复?.当前层数) {
      this.模拟循环.添加buff({ 名称: '一阳来复', 对象: '自身' })
    }
    this.模拟循环.技能类实例集合.蛰微.获得蛰微(5)
  }
}

export default 一阳来复
export const 一阳来复类型 = typeof 一阳来复
