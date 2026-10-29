// import 循环主类 from '../main'
// import { 获取实际帧数 } from '@/工具函数/data'
import 通用DOT类 from '../../通用类/通用DOT类'

class 急曲 extends 通用DOT类 {
  触发急曲技能 = '剑破虚空'

  constructor(模拟循环) {
    super(模拟循环)
  }

  获取急曲数据() {
    return this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
  }

  获得和刷新急曲(来源 = '剑破虚空', 快照Buff?: string[]) {
    this.触发急曲技能 = 来源
    const 当前最后一跳急曲数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前急曲层数 = 当前最后一跳急曲数据?.当前层数 || 0
    const 急曲最大层数 = this?.模拟循环?.Buff和Dot数据?.急曲?.最大层数 || 1
    const 添加急曲层数 = 1
    const 新急曲层数 = Math.min(当前急曲层数 + 添加急曲层数, 急曲最大层数)
    const 数据 = this.获取当前DOT数据('急曲')
    this.更新待生效数据(新急曲层数, 数据, 快照Buff)
    this.保存释放记录('急曲')
  }

  引爆() {
    const 待生效数据 = [...this.DOT运行数据.待生效数据]
    if (待生效数据?.length) {
      const 实际引爆跳数 = 待生效数据?.length
      const 最新一跳数据 = 待生效数据[待生效数据?.length - 1]
      const 当前DOT层数 = 最新一跳数据?.当前层数 || 0
      this.模拟循环.添加战斗日志({
        日志: `引爆${实际引爆跳数}跳急曲，当前DOT层数为${当前DOT层数}`,
        日志类型: '技能释放结果',
        日志时间: this.模拟循环.当前时间,
      })
      const 引爆倍率 = 当前DOT层数 * 实际引爆跳数
      const 快照buff列表 = 最新一跳数据?.快照buff列表 || []
      if (this.触发急曲技能 === '剑破虚空') {
        this.触发伤害行为('急曲(DOT)·2', 1, 快照buff列表, this.模拟循环.当前时间, 引爆倍率)
      } else {
        this.触发伤害行为('急曲(DOT)·1', 1, 快照buff列表, this.模拟循环.当前时间, 引爆倍率)
      }
      this?.更新DOT运行数据({ 待生效数据: [] })
      // const 数据 = this.获取当前DOT数据('急曲')
      // const 实际伤害频率 = 获取实际帧数(数据.伤害频率, this.模拟循环.获取实际加速值())
      // this?.更新待生效数据(
      //   当前DOT层数,
      //   {
      //     ...数据,
      //     最大作用次数: 数据?.最大作用次数 - 引爆跳数,
      //     最大持续时间: (数据?.最大持续时间 || 0) - 引爆跳数 * 实际伤害频率,
      //   },
      //   快照buff列表
      // )
    }
  }

  结算急曲伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        if (this.触发急曲技能 === '剑破虚空') {
          this.触发伤害行为('急曲(DOT)·2', 1, 快照buff列表, 生效时间, 层数)
        } else {
          this.触发伤害行为('急曲(DOT)·1', 1, 快照buff列表, 生效时间, 层数)
        }
      }
    })
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['繁音急节']),
    }
  }
}

export default 急曲

export const 急曲DOT类型 = typeof 急曲
