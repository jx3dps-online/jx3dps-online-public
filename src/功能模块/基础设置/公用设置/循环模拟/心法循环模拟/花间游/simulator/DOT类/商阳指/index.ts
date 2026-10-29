import { DOT来源类型 } from '../../type'
import 通用DOT类 from '../../通用类/通用DOT类'

class 商阳指 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新商阳指(来源?: DOT来源类型) {
    const 当前青商阳指层数 = this?.DOT运行数据?.当前层数 || 0
    const 青商阳指最大层数 = this?.模拟循环?.Buff和Dot数据?.商阳指?.最大层数 || 1
    const 添加青商阳指层数 = 1
    const 新青商阳指层数 = Math.min(当前青商阳指层数 + 添加青商阳指层数, 青商阳指最大层数)
    const 数据 = this.获取当前DOT数据('DOT_商阳指')
    this.更新待生效数据(新青商阳指层数, 数据)
    this.DOT运行数据.当前Dot来源 = 来源
    if (来源) {
      this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称: `商阳指(DOT)·${来源}` })
    } else {
      this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称: '商阳指(DOT)' })
    }
  }

  乱洒阳明刷新() {
    this.获得和刷新商阳指('乱洒')
    this.模拟循环.技能类实例集合.商阳指.青歌()
  }

  阳明引爆() {
    this?.吞噬('阳明指')
  }
  玉石引爆() {
    if (this?.DOT运行数据?.当前层数) {
      this.触发伤害行为('破', 1, [], this?.模拟循环?.当前时间, 2)
    }
    this?.吞噬('玉石')
  }

  吞噬(来源) {
    const 待生效数据 = [...this.DOT运行数据.待生效数据]
    if (待生效数据?.length) {
      const 实际引爆跳数 = 待生效数据?.length
      const 当前DOT层数 = this?.DOT运行数据?.当前层数 || 0
      this.模拟循环.添加战斗日志({
        日志: `【${来源}】吞噬${实际引爆跳数}跳【商阳指】，当前DOT层数为${当前DOT层数}`,
        日志类型: '技能释放结果',
        日志时间: this.模拟循环.当前时间,
      })
      const 引爆倍率 = 当前DOT层数 * 实际引爆跳数
      const 快照buff列表 = this?.DOT运行数据?.快照buff列表 || []
      const 实际吞噬名称 = this?.DOT运行数据?.当前Dot实际名称
      this.触发伤害行为(实际吞噬名称, 1, 快照buff列表, this.模拟循环.当前时间, 引爆倍率)
      this.清空DOT()
    }
  }

  结算商阳指伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = this?.DOT运行数据?.当前层数 || 1
      const 快照buff列表 = this?.DOT运行数据?.快照buff列表 || []
      const 伤害名称 = this?.DOT运行数据?.当前Dot实际名称 || '商阳指(DOT)'
      const 生效时间 = 数据.生效时间 || 0
      if (生效时间) {
        this.触发伤害行为(伤害名称, 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }
}

export default 商阳指

export const 青商阳指DOT类型 = typeof 商阳指
