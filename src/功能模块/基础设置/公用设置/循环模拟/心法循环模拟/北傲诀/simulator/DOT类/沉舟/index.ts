import 通用DOT类 from '../../通用类/通用DOT类'
import { DOT快照Buff列表 } from '../../utils'

class 沉舟 extends 通用DOT类 {
  获得和刷新沉舟() {
    const DOT数据 = this.获取当前DOT数据('沉舟(DOT)')
    const 层数 = Math.min(this.获取当前DOT层数() + 1, DOT数据.最大层数)
    const 快照buff列表 = this.模拟循环
      .获取伤害增益列表('沉舟(DOT)')
      .filter((名称) => DOT快照Buff列表.includes(名称))
    this.更新待生效数据(层数, DOT数据, 快照buff列表)
  }

  结算沉舟伤害() {
    this.结算并更新运行数据().forEach((数据) => {
      this.模拟循环.技能造成伤害(
        '沉舟(DOT)',
        1,
        数据.快照buff列表,
        数据.生效时间,
        true,
        1,
        数据.当前层数,
      )
    })
  }
}

export default 沉舟
