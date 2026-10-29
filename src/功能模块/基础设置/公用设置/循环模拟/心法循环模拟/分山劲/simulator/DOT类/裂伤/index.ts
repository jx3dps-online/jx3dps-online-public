// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 裂伤 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新裂伤() {
    const 当前最后一跳裂伤数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前裂伤层数 = 当前最后一跳裂伤数据?.当前层数 || 0
    const 裂伤最大层数 = this?.模拟循环?.Buff和Dot数据?.裂伤?.最大层数 || 3
    const 添加裂伤层数 = 1
    const 新裂伤层数 = Math.min(当前裂伤层数 + 添加裂伤层数, 裂伤最大层数)
    const 数据 = this.获取当前DOT数据('裂伤')
    this.更新待生效数据(新裂伤层数, 数据)
  }

  结算裂伤伤害() {
    const 待生效数据 = this.结算并更新运行数据()

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('裂伤(DOT)', 1, 快照buff列表, 生效时间, true, 层数)
      }
    })
  }
}

export default 裂伤

export const 裂伤DOT类型 = typeof 裂伤
