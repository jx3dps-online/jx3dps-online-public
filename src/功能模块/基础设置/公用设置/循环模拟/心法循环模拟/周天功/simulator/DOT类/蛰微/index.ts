import 通用DOT类 from '../../通用类/通用DOT类'

class 蛰微 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新蛰微() {
    const 当前蛰微层数 = this.获取当前DOT层数()
    const 蛰微最大层数 = this?.模拟循环?.Buff和Dot数据?.蛰微?.最大层数 || 1
    const 添加蛰微层数 = 1
    const 新蛰微层数 = Math.min(当前蛰微层数 + 添加蛰微层数, 蛰微最大层数)
    const 数据 = this.获取当前DOT数据('蛰微')
    this.更新待生效数据(新蛰微层数, 数据)
  }

  引窍引爆(最终督脉倍率) {
    const 待生效数据 = [...this.DOT运行数据.待生效数据]
    if (待生效数据?.length) {
      const 实际引爆跳数 = 待生效数据?.length
      const 最新一跳数据 = 待生效数据[待生效数据?.length - 1]
      const 当前DOT层数 = 最新一跳数据?.当前层数 || 0
      const 引爆倍率 = 当前DOT层数 * 实际引爆跳数
      const 快照buff列表 = 最新一跳数据?.快照buff列表 || []
      if (最终督脉倍率) {
        快照buff列表.push(`蛰微督脉·${最终督脉倍率}`)
      }
      this.模拟循环.添加战斗日志({
        日志: `【引窍】引爆${实际引爆跳数}跳蛰微，最终督脉倍率为${最终督脉倍率}`,
        日志类型: '技能释放结果',
        日志时间: this.模拟循环.当前时间,
      })
      this.触发伤害行为('蛰微(DOT)', 1, 快照buff列表, this.模拟循环.当前时间, 引爆倍率)
      this?.更新DOT运行数据({ 待生效数据: [] })
    }
  }

  结算蛰微伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('蛰微(DOT)', 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }
}

export default 蛰微

export const 青蛰微DOT类型 = typeof 蛰微
