import 循环模拟技能基础数据 from '../../../constant/skill'
import 技能统一类 from '../../通用类/技能统一类'

class 换行 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '换行')

  constructor(模拟循环) {
    super(模拟循环)
  }
}

export default 换行

export const 换行类型 = typeof 换行
