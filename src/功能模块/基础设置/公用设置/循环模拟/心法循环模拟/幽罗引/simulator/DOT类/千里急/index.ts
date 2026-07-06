// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 千里急 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新千里急() {
    const 数据 = this.获取当前DOT数据('千里急DOT')
    this.更新待生效数据(1, 数据)
  }

  结算千里急伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('千里急(DOT)', 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }
}

export default 千里急

export const 千里急DOT类型 = typeof 千里急
