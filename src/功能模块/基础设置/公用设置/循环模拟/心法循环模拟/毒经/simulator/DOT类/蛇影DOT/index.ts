// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 蛇影DOT extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新蛇影DOT() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前层数 = 当前最后一跳数据?.当前层数 || 0
    const 最大层数 = this.模拟循环.Buff和Dot数据?.蛇影DOT?.最大层数 || 1
    const 添加层数 = 1
    const 新层数 = Math.min(当前层数 + 添加层数, 最大层数)
    const 数据 = this.获取当前DOT数据('蛇影DOT')
    this.更新待生效数据(新层数, 数据)
  }

  额外生效一跳() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    if (当前最后一跳数据?.当前层数) {
      const 快照buff列表 = 当前最后一跳数据?.快照buff列表 || []
      this.触发伤害行为('蛇影(DOT)', 1, 快照buff列表)
    }
  }

  提前生效一跳() {
    const 当前跳数据 = this?.DOT运行数据?.待生效数据?.[0] || {}
    if (当前跳数据?.当前层数) {
      const 快照buff列表 = 当前跳数据?.快照buff列表 || []
      this.触发伤害行为('蛇影(DOT)', 1, 快照buff列表)
    }

    this?.DOT运行数据?.待生效数据?.pop()
  }

  蛇影DOT存在判定() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前蛇影层数 = 当前最后一跳数据?.当前层数 || 0
    return 当前蛇影层数
  }

  结算蛇影DOT伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('蛇影(DOT)', 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }
}

export default 蛇影DOT

export const 蛇影DOT类型 = typeof 蛇影DOT
