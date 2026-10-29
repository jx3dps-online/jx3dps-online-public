import { 技能运行数据类型 } from '../type'
import 技能统一类 from './技能统一类'

class 有CD技能通用类 extends 技能统一类 {
  技能运行数据: 技能运行数据类型 = {
    待充能时间点: [],
  }

  constructor(模拟循环) {
    super(模拟循环)
  }

  初始化技能运行数据() {
    this.技能运行数据.待充能时间点 = []
  }

  更新技能运行数据(新数据) {
    this.技能运行数据 = {
      ...this.技能运行数据,
      ...新数据,
    }
  }

  重置调息时间() {
    this.更新技能运行数据({ 待充能时间点: [] })
  }

  减少调息时间(减少帧数) {
    const 待充能时间点 = this.技能运行数据.待充能时间点
    if (待充能时间点?.length) {
      const 新待充能时间点 = 待充能时间点
        .map((item) => {
          return item - 减少帧数
        })
        ?.filter((item) => {
          return item > this.模拟循环.当前时间
        })
      this.更新技能运行数据({ 待充能时间点: 新待充能时间点 })
    }
  }
}

export default 有CD技能通用类
