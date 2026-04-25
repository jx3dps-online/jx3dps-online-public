import { DOT待生效数据类型, DOT运行数据类型, DotDTO } from '../type'
import 技能统一类 from './技能统一类'

class 通用DOT类 extends 技能统一类 {
  DOT运行数据: DOT运行数据类型 = {
    待生效数据: [],
  }

  constructor(模拟循环) {
    super(模拟循环)
  }

  获取当前DOT数据(DOT名称) {
    const DOT数据: DotDTO = this.模拟循环.Buff和Dot数据?.[DOT名称] as DotDTO
    return DOT数据
  }

  更新DOT运行数据(新数据) {
    this.DOT运行数据 = {
      ...this.DOT运行数据,
      ...新数据,
    }
  }

  结算并更新运行数据(事件时间 = this.模拟循环.当前时间) {
    const 待生效数据 = this.DOT运行数据?.待生效数据 || []
    if (待生效数据.length > 0) {
      const 结算数组: DOT待生效数据类型[] = []
      const 未结算数组: DOT待生效数据类型[] = []
      const 当前时间 = 事件时间 || this.模拟循环.当前时间 || 0
      待生效数据.forEach((数据) => {
        // 将dot结算放在触发上DOT、引爆等行为之后。所以当前时间的dot不结算。放在下一次时间结算
        if ((数据.生效时间 || 0) < 当前时间) {
          结算数组.push(数据)
        } else {
          未结算数组.push(数据)
        }
      })
      this.更新DOT运行数据({
        待生效数据: 未结算数组,
      })
      return {
        结算数组,
        未结算数组,
      }
    } else {
      return {
        结算数组: [],
        未结算数组: [],
      }
    }
  }

  // 对当前dot进行结算和运行数据
  更新待生效数据(当前层数: number, DOT数据: DotDTO) {
    this.模拟循环.添加buff?.({
      名称: DOT数据?.名称,
      对象: '目标',
      新增层数: 当前层数,
      只添加日志: true,
    })
    const DOT是否吃加速 = DOT数据.是否吃加速 !== undefined ? DOT数据.是否吃加速 : true

    const 循环加速值 = this.模拟循环.加速值
    const 实际初次频率 = DOT是否吃加速
      ? this.模拟循环?.获取物化加速帧数(DOT数据.初次频率 || DOT数据.伤害频率, 循环加速值)
      : DOT数据.初次频率 || DOT数据.伤害频率

    const 实际伤害频率 = DOT是否吃加速
      ? this.模拟循环?.获取物化加速帧数(DOT数据.伤害频率, 循环加速值)
      : DOT数据.伤害频率

    const 当前时间 = this.模拟循环.当前时间 || 0
    const 快照buff列表 = this.获取当前快照buff()

    const 待生效数据: DOT待生效数据类型[] =
      // 只更新在刷新buff之后的数据的层数
      this.DOT运行数据?.待生效数据.map((item) => {
        if ((item.生效时间 || 0) < this.模拟循环.当前时间) {
          return item
        } else {
          return { ...item, 当前层数, 快照buff列表 }
        }
      }) || []

    // 如果DOT依然存在
    if (待生效数据?.length > 0) {
      const 单次获得最大次数 = DOT数据.每次获得作用次数 || DOT数据.最大作用次数
      const 待添加次数 = Math.min(DOT数据.最大作用次数 - 待生效数据?.length, 单次获得最大次数)
      const 原最后一次生效时间 = 待生效数据[待生效数据?.length - 1]?.生效时间 || 0
      for (let i = 0; i < 待添加次数; i++) {
        待生效数据.push({
          当前层数,
          生效时间: 原最后一次生效时间 + 实际伤害频率 * (i + 1),
          快照buff列表,
        })
      }
    } else {
      const 单次获得最大次数 = DOT数据.每次获得作用次数 || DOT数据.最大作用次数
      const 待添加次数 = 单次获得最大次数
      for (let i = 0; i < 待添加次数; i++) {
        const 生效时间 = 当前时间 + (i === 0 ? 实际初次频率 : 实际伤害频率 * (i + 1))
        待生效数据.push({
          当前层数,
          生效时间,
          快照buff列表,
        })
      }
    }
    // this.模拟循环.删除待生效事件队列(`卸除buff-${DOT数据?.名称}`)

    this.更新DOT运行数据({
      待生效数据: 待生效数据,
    })

    // 每次刷新和更新时，删除前面的待生效数据
    this.模拟循环.添加待生效事件队列(
      [
        {
          事件名称: `卸除buff-${DOT数据?.名称}`,
          事件时间: 待生效数据?.[待生效数据.length - 1]?.生效时间 || 0,
          事件备注: { buff名称: DOT数据?.名称, buff对象: '目标', 卸除层数: 9999 },
        },
      ],
      true,
    )
  }

  获取当前快照buff() {
    const buff列表: string[] = []
    if (this.模拟循环?.当前自身buff列表?.['游仙']?.当前层数) {
      buff列表.push('游仙')
    }
    if (this.模拟循环?.当前自身buff列表?.['太息']?.当前层数) {
      buff列表.push('太息')
    }
    return buff列表
  }
}

export default 通用DOT类
