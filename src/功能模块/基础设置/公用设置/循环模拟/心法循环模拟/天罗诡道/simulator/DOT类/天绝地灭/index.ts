import 通用DOT类 from '../../通用类/通用DOT类'
import 循环模拟技能基础数据 from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/天罗诡道/constant/skill'

class 天绝地灭 extends 通用DOT类 {

  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === 'DOT_天绝地灭')
  constructor(模拟循环:any) {
    super(模拟循环)
  }

  获得天绝(来源 = '天绝地灭') {
    const 新层数 = this.添加DOT('DOT_天绝地灭')
    const 数据 = this.获取当前DOT数据('DOT_天绝地灭')
    this.更新待生效数据(新层数, 数据)
    this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称: '天绝地灭' })
  }

  结算天绝伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据) => {
      const 层数 = this?.DOT运行数据?.当前层数 || 1
      const 快照buff列表 = this?.DOT运行数据?.快照buff列表 || []
      const 伤害名称 = this?.DOT运行数据?.当前Dot实际名称 || '天绝地灭'
      const 生效时间 = 数据.生效时间 || 0
      if (生效时间) {
        this.触发伤害行为(伤害名称, 1, 快照buff列表, 生效时间, 层数)
      }
    })
  }

  存在(){
    return this?.模拟循环?.技能类实例集合?.DOT_天绝地灭?.DOT运行数据?.待生效数据?.length > 0
  }

  保存释放记录(名称: string) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['心无旁骛', '扬威', '神机好穷内攻增伤','神机好穷陷阱增伤', '秋风散影','催寒','气魄','弩心','天风汲雨']),
    }
  }
}

export default 天绝地灭

export const DOT天绝地灭类型 = typeof 天绝地灭
