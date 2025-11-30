import {获取实际帧数} from '@/工具函数/data'
import {DotDTO, DOT待生效数据类型, DOT运行数据类型} from '../type'
import 技能统一类 from './技能统一类'

class 通用DOT类 extends 技能统一类 {
  DOT运行数据: DOT运行数据类型 = {
    待生效数据: [],
    当前层数: 0,
    当前Dot来源: '',
    当前Dot实际名称: '',
    快照buff列表: [],
  }

  constructor(模拟循环: any) {
    super(模拟循环)
  }


  添加DOT(DOT名称: string, 要添加的层数: number = 1) {
    const 当前最后一跳数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前层数 = 当前最后一跳数据?.当前层数 || 0
    const 最大层数 = this.模拟循环.Buff和Dot数据?.[DOT名称]?.最大层数 || 1
    return Math.min(当前层数 + 要添加的层数, 最大层数)
  }

  清空DOT() {
    this.更新DOT运行数据({
      待生效数据: [],
      当前层数: 0,
      当前Dot来源: '',
      当前Dot实际名称: '',
      快照buff列表: [],
    })
  }

  获取当前DOT数据(DOT名称: string) {
    return this.模拟循环.Buff和Dot数据?.[DOT名称] as DotDTO
  }

  更新DOT运行数据(新数据: any) {
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
      if (未结算数组.length === 0) {
        this.更新DOT运行数据({
          当前层数: 0,
          当前Dot来源: '',
          当前Dot实际名称: '',
          快照buff列表: [],
          待生效数据: [],
        })
      } else {
        this.更新DOT运行数据({
          待生效数据: 未结算数组,
        })
      }
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
6
  // 对当前dot进行结算和运行数据
  更新待生效数据(当前层数: number, DOT数据: DotDTO, 快照Buff?: string[]) {
    let DOT是否吃加速 = DOT数据.是否吃加速 !== undefined ? DOT数据.是否吃加速 : true
    const 循环加速值 = this.模拟循环.加速值
    const 实际初次频率 = DOT是否吃加速
      ? 获取实际帧数(DOT数据.初次频率 || DOT数据.伤害频率, 循环加速值)
      : DOT数据.初次频率 || DOT数据.伤害频率

    const 实际伤害频率 = DOT是否吃加速
      ? 获取实际帧数(DOT数据.伤害频率, 循环加速值)
      : DOT数据.伤害频率

    const 快照buff列表 = 快照Buff || this.获取当前快照buff()

    this.DOT运行数据.当前层数 = 当前层数
    this.DOT运行数据.快照buff列表 = [...快照buff列表]

    const 当前时间 = this.模拟循环.当前时间 || 0
    const 待生效数据: DOT待生效数据类型[] = [...(this.DOT运行数据?.待生效数据 || [])]

    // 如果DOT依然存在
    if (待生效数据?.length > 0) {
      const 待添加次数 = DOT数据.最大作用次数 - 待生效数据?.length
      const 原最后一次生效时间 = 待生效数据[待生效数据?.length - 1]?.生效时间 || 0
      for (let i = 0; i < 待添加次数; i++) {
        待生效数据.push({
          生效时间: 原最后一次生效时间 + 实际伤害频率 * (i + 1),
        })
      }
    } else {
      let 待添加次数 = DOT数据.最大作用次数
      for (let i = 0; i < 待添加次数; i++) {
        const 生效时间 = 当前时间 + (i === 0 ? 实际初次频率 : 实际伤害频率 * (i + 1))
        待生效数据.push({
          生效时间,
        })
      }
    }

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
      true
    )
  }
  更新连弩待生效数据(当前层数: number, DOT数据: DotDTO, 快照Buff?: string[]) {
    let DOT是否吃加速 = DOT数据.是否吃加速 !== undefined ? DOT数据.是否吃加速 : true
    if (this.模拟循环.加速值 >= 30158 ){
      DOT是否吃加速 = true
    }
    const 循环加速值 = this.模拟循环.加速值
    const 实际初次频率 = DOT是否吃加速
      ? 获取实际帧数(DOT数据.初次频率 || DOT数据.伤害频率, 循环加速值)
      : DOT数据.初次频率 || DOT数据.伤害频率

    const 实际伤害频率 = DOT是否吃加速
      ? 获取实际帧数(DOT数据.伤害频率, 循环加速值)
      : DOT数据.伤害频率

    const 快照buff列表 = 快照Buff || this.获取当前快照buff()

    this.DOT运行数据.当前层数 = 当前层数
    this.DOT运行数据.快照buff列表 = [...快照buff列表]

    const 当前时间 = this.模拟循环.当前时间 || 0
    const 待生效数据: DOT待生效数据类型[] = [...(this.DOT运行数据?.待生效数据 || [])]

    // 如果DOT依然存在
    if (待生效数据?.length > 0) {
      const 待添加次数 = DOT数据.最大作用次数 - 待生效数据?.length
      const 原最后一次生效时间 = 待生效数据[待生效数据?.length - 1]?.生效时间 || 0
      for (let i = 0; i < 待添加次数; i++) {
        待生效数据.push({
          生效时间: 原最后一次生效时间 + 实际伤害频率 * (i + 1),
        })
      }
    } else {
      let 待添加次数 = DOT数据.最大作用次数
      if (this.模拟循环.加速值 >= 30158 ){
        待添加次数 = DOT数据.最大持续时间! / 实际伤害频率
      }
      for (let i = 0; i < 待添加次数; i++) {
        const 生效时间 = 当前时间 + (i === 0 ? 实际初次频率 : 实际伤害频率 * (i + 1))
        待生效数据.push({
          生效时间,
        })
      }
    }

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
      true
    )
  }
}



export default 通用DOT类
