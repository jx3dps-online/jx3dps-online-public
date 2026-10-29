// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'
import { 初始化起手DOT } from '../../../../通用/通用函数/初始化起手DOT'
import type { 起手Buff } from '../../../../通用/通用框架/类型定义/Buff'

class 流血 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  初始化起手流血(配置?: 起手Buff) {
    if (配置?.类型 === '目标' && 配置.层数 && 配置.获得时间 !== undefined) {
      const DOT数据 = this.获取当前DOT数据('流血')
      初始化起手DOT(
        {
          获得时间: 配置.获得时间,
          当前层数: Math.min(配置.层数, DOT数据.最大层数),
          DOT数据,
          快照buff列表: this.获取当前快照buff(),
        },
        this,
      )
    }
  }

  获得和刷新流血() {
    this.获得破风()
    const 当前最后一跳流血数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前流血层数 = 当前最后一跳流血数据?.当前层数 || 0
    this.击水判定(当前流血层数)
    const 流血最大层数 = this?.模拟循环?.Buff和Dot数据?.流血?.最大层数 || 2
    const 添加流血层数 = 1
    const 新流血层数 = Math.min(当前流血层数 + 添加流血层数, 流血最大层数)
    const 数据 = this.获取当前DOT数据('流血')
    this.更新待生效数据(新流血层数, 数据)
  }

  流血存在判定() {
    const 当前最后一跳流血数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前流血层数 = 当前最后一跳流血数据?.当前层数 || 0
    return 当前流血层数
  }

  获得破风() {
    this.模拟循环.添加buff?.({ 名称: '破风', 对象: '目标' })
  }

  击水判定(当前流血层数) {
    if (this.模拟循环.校验奇穴是否存在('击水') && 当前流血层数 >= 3) {
      this.触发伤害行为('击水')
    }
  }

  结算流血伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      this.触发伤害行为('流血(DOT)', 1, 快照buff列表, 生效时间, 层数)
    })
  }
}

export default 流血

export const 流血DOT类型 = typeof 流血
