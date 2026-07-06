import 通用DOT类 from '../../通用类/通用DOT类'

class DOT_知微 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新DOT_知微() {
    const 当前DOT_知微层数 = this.获取当前DOT层数()
    const DOT_知微最大层数 = this?.模拟循环?.Buff和Dot数据?.DOT_知微?.最大层数 || 1
    const 添加DOT_知微层数 = 1
    const 新DOT_知微层数 = Math.min(当前DOT_知微层数 + 添加DOT_知微层数, DOT_知微最大层数)
    const 数据 = this.获取当前DOT数据('DOT_知微')
    this.更新待生效数据(新DOT_知微层数, 数据)
  }

  引爆并重新刷新(引爆跳数, 来源) {
    const 待生效数据 = [...this.DOT运行数据.待生效数据]
    if (待生效数据?.length) {
      const 实际引爆跳数 = Math.min(待生效数据?.length, 引爆跳数)
      const 最新一跳数据 = 待生效数据[待生效数据?.length - 1]
      const 当前DOT层数 = 最新一跳数据?.当前层数 || 0
      this.模拟循环.添加战斗日志({
        日志: `【${来源}】引爆${实际引爆跳数}跳DOT_知微，当前DOT层数为${当前DOT层数}`,
        日志类型: '技能释放结果',
        日志时间: this.模拟循环.当前时间,
      })
      const 引爆倍率 = 当前DOT层数 * 实际引爆跳数
      const 快照buff列表 = 最新一跳数据?.快照buff列表 || []
      this.触发伤害行为(
        '知微(DOT)',
        1,
        快照buff列表,
        this.模拟循环.当前时间,
        引爆倍率,
        快照buff列表,
      )
      待生效数据.splice(-引爆跳数)
      this?.更新DOT运行数据({ 待生效数据: [...待生效数据] })
    }
  }

  结算伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('知微(DOT)', 1, 快照buff列表, 生效时间, 层数, 快照buff列表)
      }
    })
  }
}

export default DOT_知微

export const 青DOT_知微DOT类型 = typeof DOT_知微
