// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 截辕 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新截辕() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前层数 = 当前最后一跳数据?.当前层数 || 0
    const 最大层数 = this?.模拟循环?.Buff和Dot数据?.截辕?.最大层数 || 1
    const 新层数 = Math.min(当前层数 + 1, 最大层数)
    this.模拟循环.添加buff?.({
      名称: '截辕',
      对象: '目标',
      新增层数: 1,
      只添加日志: true,
    })
    const 数据 = this.获取当前DOT数据('截辕')
    this.更新待生效数据(新层数, 数据)
  }

  结算截辕伤害() {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据()

    待生效数据.forEach((数据) => {
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []

      if (生效时间) {
        this.触发伤害行为('截辕·悟(DOT)', 1, 快照buff列表, 生效时间, true)
      }
    })
  }
}

export default 截辕

export const 截辕DOT类型 = typeof 截辕
