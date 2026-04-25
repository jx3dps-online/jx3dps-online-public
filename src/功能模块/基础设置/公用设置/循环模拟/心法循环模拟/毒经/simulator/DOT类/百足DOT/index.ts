// import 循环主类 from '../main'
import 通用DOT类 from '../../通用类/通用DOT类'

class 百足DOT extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新百足DOT() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前层数 = 当前最后一跳数据?.当前层数 || 0
    const 最大层数 = this.模拟循环.Buff和Dot数据?.百足DOT?.最大层数 || 1
    const 添加层数 = 1
    const 新层数 = Math.min(当前层数 + 添加层数, 最大层数)
    const 数据 = this.获取当前DOT数据('百足DOT')
    this.更新待生效数据(新层数, 数据)
  }

  更新DOT特殊处理() {
    const 当前数据 = this?.DOT运行数据?.待生效数据
    const 当前跳数据 = 当前数据[0] || {}

    if (当前跳数据 === null) {
      return
    }

    const 起始跳数 = 当前跳数据.DOT跳数 || 1

    for (let i = 0; i < 当前数据.length; i++) {
      当前数据[i] = {
        ...当前数据[i],
        DOT跳数: 起始跳数 + i + 1,
      }
    }

    // console.log('百足DOT数据', 当前数据)
  }

  额外生效一跳() {
    const 当前跳数据 = this?.DOT运行数据?.待生效数据?.[0] || {}
    if (当前跳数据?.当前层数) {
      const 快照buff列表 = 当前跳数据?.快照buff列表 || []
      if (this.模拟循环.校验奇穴是否存在('不僵')) {
        this.触发伤害行为(
          '百足(DOT)·不僵',
          1,
          快照buff列表,
          this.模拟循环.当前时间,
          当前跳数据.当前层数,
          当前跳数据.DOT跳数,
        )
        // console.log('百足DOT数据 | 残香', 当前跳数据.DOT跳数, 'at', this.模拟循环.当前时间 / 16)
        this.更新DOT特殊处理()
      } else {
        this.触发伤害行为('百足(DOT)', 1, 快照buff列表, this.模拟循环.当前时间)
      }
    }
  }

  提前生效一跳() {
    const 当前跳数据 = this?.DOT运行数据?.待生效数据?.[0] || {}
    if (当前跳数据?.当前层数) {
      const 快照buff列表 = 当前跳数据?.快照buff列表 || []
      if (this.模拟循环.校验奇穴是否存在('不僵')) {
        this.触发伤害行为(
          '百足(DOT)·不僵',
          1,
          快照buff列表,
          this.模拟循环.当前时间,
          当前跳数据.当前层数,
          当前跳数据.DOT跳数,
        )
        // console.log('百足DOT数据 | 薄瘴', 当前跳数据.DOT跳数, 'at', this.模拟循环.当前时间 / 16)

        this.更新DOT特殊处理()
      } else {
        this.触发伤害行为('百足(DOT)', 1, 快照buff列表, this.模拟循环.当前时间)
      }
    }

    this?.DOT运行数据?.待生效数据?.pop()
  }

  百足DOT存在判定() {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    return 当前最后一跳数据?.当前层数 || 0
  }

  结算百足DOT伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        if (this.模拟循环.校验奇穴是否存在('不僵')) {
          this.触发伤害行为(
            '百足(DOT)·不僵',
            1,
            快照buff列表,
            this.模拟循环.当前时间,
            数据.当前层数,
            数据.DOT跳数,
          )
          // console.log('百足DOT数据 | 结算', 数据.DOT跳数, 'at', this.模拟循环.当前时间 / 16)
        } else {
          this.触发伤害行为('百足(DOT)', 1, 快照buff列表, this.模拟循环.当前时间)
        }
      }
    })
  }
}

export default 百足DOT

export const 百足DOT类型 = typeof 百足DOT
