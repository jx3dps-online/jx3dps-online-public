import 通用DOT类 from '../../通用类/通用DOT类'

class 中毒 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新中毒() {
    const 当前中毒层数 = this.获取当前DOT层数()
    const 中毒最大层数 = this?.模拟循环?.Buff和Dot数据?.中毒?.最大层数 || 1
    const 添加中毒层数 = 1
    const 新中毒层数 = Math.min(当前中毒层数 + 添加中毒层数, 中毒最大层数)
    const 数据 = this.获取当前DOT数据('中毒')
    this.更新待生效数据(新中毒层数, 数据)
  }

  结算中毒伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('中毒(DOT)', 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }
}

export default 中毒

export const 中毒DOT类型 = typeof 中毒
