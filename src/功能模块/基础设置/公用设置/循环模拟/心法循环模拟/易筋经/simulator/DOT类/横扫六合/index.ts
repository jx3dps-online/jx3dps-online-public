// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 横扫六合DOT extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新横扫六合DOT() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前层数 = 当前最后一跳数据?.当前层数 || 0
    const 最大层数 = this.模拟循环.Buff和Dot数据?.横扫六合DOT?.最大层数 || 1
    const 添加层数 = 1
    const 新层数 = Math.min(当前层数 + 添加层数, 最大层数)
    const 数据 = this.获取当前DOT数据('横扫六合DOT')
    this.更新待生效数据(新层数, 数据)
  }

  横扫六合DOT存在判定() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前拘意层数 = 当前最后一跳数据?.当前层数 || 0
    return 当前拘意层数
  }

  结算横扫六合DOT伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('横扫六合(DOT)', 层数, 快照buff列表, 生效时间)
      }
    })
  }
}

export default 横扫六合DOT

export const 横扫六合DOT类型 = typeof 横扫六合DOT
