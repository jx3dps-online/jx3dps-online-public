// import 循环主类 from '../main'
// import { 获取实际帧数 } from '@/工具函数/data'
import 通用DOT类 from '../../通用类/通用DOT类'

class 气吞长江 extends 通用DOT类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  获得和刷新气吞长江() {
    const 当前最后一跳气吞长江数据 =
      this?.DOT运行数据?.待生效数据?.[this?.DOT运行数据?.待生效数据?.length - 1] || {}
    const 当前气吞长江层数 = 当前最后一跳气吞长江数据?.当前层数 || 0
    const 气吞长江最大层数 = this?.模拟循环?.Buff和Dot数据?.气吞长江?.最大层数 || 1
    const 添加气吞长江层数 = 1
    const 新气吞长江层数 = Math.min(当前气吞长江层数 + 添加气吞长江层数, 气吞长江最大层数)
    const 数据 = this.获取当前DOT数据('气吞长江')
    const 快照buff列表 = this.获取当前快照buff().flatMap((buff) => {
      if (!buff.startsWith('满堂·')) return [buff]
      const 满堂层数 = Number(buff.split('·')[1]) - 1
      return 满堂层数 > 0 ? [`满堂·${满堂层数}`] : []
    })
    this.更新待生效数据(新气吞长江层数, 数据, 快照buff列表)
    this.保存释放记录('气吞长江')
  }

  结算气吞长江伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = 数据.当前层数 || 1
      const 生效时间 = 数据.生效时间 || 0
      const 快照buff列表 = 数据.快照buff列表 || []
      if (生效时间) {
        this.触发伤害行为('气吞长江(DOT)', 1, 快照buff列表, 生效时间, 层数)
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

export default 气吞长江

export const 气吞长江DOT类型 = typeof 气吞长江
