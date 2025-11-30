import { DOT待生效数据类型 } from '../../type'
import 通用DOT类 from '../../通用类/通用DOT类'
import 循环模拟技能基础数据 from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/天罗诡道/constant/skill'



class 化血 extends 通用DOT类 {

  constructor(模拟循环:any) {
    super(模拟循环)
  }

  获得和刷新化血(来源: any) {
    const 新层数 = this.添加DOT('DOT_化血')
    const 数据 = this.获取当前DOT数据('DOT_化血')
    this.更新待生效数据(新层数, 数据)
    this.DOT运行数据.当前Dot来源 = 来源
    if (来源) {
      this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称: `化血(DOT)·${来源}` })
    } else {
      this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称: '化血(DOT)' })
    }
  }


  引爆(来源:any) {
    const 待生效数据 = [...this.DOT运行数据.待生效数据]
    if (待生效数据?.length) {
      const 实际引爆跳数 = 待生效数据?.length
      const 当前DOT层数 = this?.DOT运行数据?.当前层数 || 0
      this.模拟循环.添加战斗日志({
        日志: `【${来源}】引爆${实际引爆跳数}跳【化血】，化血移除`,
        日志类型: '技能释放结果',
        日志时间: this.模拟循环.当前时间,
      })
      const 引爆倍率 = 当前DOT层数 * 实际引爆跳数
      const 快照buff列表 = this?.DOT运行数据?.快照buff列表 || []
      this.触发伤害行为('化血(DOT)·引爆', 1, 快照buff列表, this.模拟循环.当前时间, 引爆倍率)
      this.模拟循环.卸除buff({ 名称: '化血', 卸除层数: 1 })
      this.清空DOT()
    }
  }


  结算化血伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据:DOT待生效数据类型) => {
      const 层数 = this?.DOT运行数据?.当前层数 || 1
      const 快照buff列表 = this?.DOT运行数据?.快照buff列表 || []
      const 生效时间 = 数据.生效时间 || 0
      if (生效时间) {
        this.触发伤害行为('化血(DOT)', 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }

  存在(){
    return this?.模拟循环?.技能类实例集合?.DOT_化血?.DOT运行数据?.待生效数据?.length > 0
  }

}

export default 化血

export const DOT_化血类型 = typeof 化血