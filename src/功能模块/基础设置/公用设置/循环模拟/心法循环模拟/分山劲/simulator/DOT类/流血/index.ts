// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 流血 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新流血() {
    const 当前最后一跳流血数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前流血层数 = 当前最后一跳流血数据?.当前层数 || 0
    const 流血最大层数 = this?.模拟循环?.Buff和Dot数据?.流血?.最大层数 || 1
    const 添加流血层数 = 1
    const 新流血层数 = Math.min(当前流血层数 + 添加流血层数, 流血最大层数)
    const 数据 = this.获取当前DOT数据('流血')
    this.更新待生效数据(新流血层数, 数据)
    // 当点出崩血奇穴且目标已有流血时，再次添加流血会触发1次崩血伤害
    if (当前流血层数 > 0 && this.模拟循环 && this.模拟循环.校验奇穴是否存在 && this.模拟循环.校验奇穴是否存在('崩血')) {
      this.触发伤害行为('崩血', 1)
    }
  }

  崩血消耗流血() {
    const 当前最后一跳流血数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前流血层数 = 当前最后一跳流血数据?.当前层数 || 0
    // 3层流血时候消耗流血并触发4次崩血伤害
    if (当前流血层数 >= 3) {
      const 新流血层数 = 当前流血层数 - 1
      const 数据 = this.获取当前DOT数据('流血')
      this.更新待生效数据(新流血层数, 数据)
      this.触发伤害行为('崩血', 4)
    }
  }

  结算流血伤害() {
    const 待生效数据 = this.结算并更新运行数据()

    待生效数据.forEach((数据) => {
      // const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        if (this.模拟循环 && this.模拟循环.校验奇穴是否存在 && this.模拟循环.校验奇穴是否存在('登锋')) {
          this.触发伤害行为('流血(DOT)·登锋', 1, 快照buff列表, 生效时间, true)
        } else {
          this.触发伤害行为('流血(DOT)', 1, 快照buff列表, 生效时间, true)
        }
      }
    })
  }
}

export default 流血

export const 流血DOT类型 = typeof 流血
