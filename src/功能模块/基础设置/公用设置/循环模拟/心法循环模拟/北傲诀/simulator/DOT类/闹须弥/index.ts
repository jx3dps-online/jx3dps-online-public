import 通用DOT类 from '../../通用类/通用DOT类'
import { DOT快照Buff列表 } from '../../utils'

class 闹须弥 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新闹须弥() {
    const 快照buff列表 = this.模拟循环
      .获取伤害增益列表('闹须弥(DOT)')
      .filter((名称) => DOT快照Buff列表.includes(名称))
    this.更新待生效数据(1, this.获取当前DOT数据('闹须弥(DOT)'), 快照buff列表)
  }

  结算闹须弥伤害() {
    const 待生效数据 = this.结算并更新运行数据()
    待生效数据.forEach((数据) => {
      this.模拟循环.技能造成伤害('闹须弥(DOT)', 1, 数据.快照buff列表, 数据.生效时间, true)
    })
  }
}

export default 闹须弥
