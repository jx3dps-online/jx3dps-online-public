import 通用DOT类 from '../../通用类/通用DOT类'
import { DOT待生效数据类型 } from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/通用/通用框架/类型定义/DOT'

class 连弩 extends 通用DOT类 {
  constructor(模拟循环:any) {
    super(模拟循环)
  }

  获得连弩(来源:any) {
    const 机关存在 = this?.模拟循环?.技能类实例集合?.千机变?.存在();
    const 重弩存在 = this?.模拟循环?.技能类实例集合?.DOT_重弩?.存在()
    if (!机关存在) {
      return {
        可以释放: false,
        异常信息: `机关不存在`,
      }
    }
    if(重弩存在){
      this.模拟循环.卸除buff?.({ 名称: 'DOT_重弩', 对象: '目标' })
    }
    this.模拟循环.添加buff?.({ 名称: '机关存在', 对象: '自身' })
    const 新层数 = this.添加DOT('DOT_连弩')
    const 数据 = this.获取当前DOT数据('DOT_连弩')
    this.更新连弩待生效数据(新层数, 数据)
    this?.模拟循环?.技能类实例集合?.DOT_重弩.清空DOT()
    let 当前Dot实际名称 = '连弩·一'
    const 鬼斧弹药数量 = this.模拟循环.当前自身buff列表?.['鬼斧弹药']?.当前层数
    if (鬼斧弹药数量 && 鬼斧弹药数量 > 0) {
      当前Dot实际名称 = '连弩·二'
    }
    this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称 })

  }

  结算连弩伤害(事件时间 = this.模拟循环.当前时间) {
    const { 结算数组: 待生效数据 } = this.结算并更新运行数据(事件时间)

    待生效数据?.forEach((数据:DOT待生效数据类型) => {
      const 层数 = this?.DOT运行数据?.当前层数 || 1
      const 快照buff列表 = this?.DOT运行数据?.快照buff列表 || []
      const 生效时间 = 数据.生效时间 || 0
      if (生效时间) {
        let 当前Dot实际名称 = '连弩·一'
        const 鬼斧弹药数量 = this.模拟循环.当前自身buff列表?.['鬼斧弹药']?.当前层数
        if (鬼斧弹药数量 && 鬼斧弹药数量 > 0) {
          当前Dot实际名称 = '连弩·二'
          const 鬼斧弹药BUFF = this.模拟循环.当前自身buff列表?.['鬼斧弹药']
          if (鬼斧弹药BUFF && typeof 鬼斧弹药BUFF.当前层数 === 'number') {
            鬼斧弹药BUFF.当前层数--
          }
        }
        this.触发伤害行为(当前Dot实际名称, 1, 快照buff列表, 生效时间, 层数)
        this.模拟循环.神机值变化('连弩')
      }
    })
  }

  

  存在(){
    return this?.模拟循环?.技能类实例集合?.DOT_连弩?.DOT运行数据?.待生效数据?.length > 0
  }

}

export default 连弩

export const DOT连弩类型 = typeof 连弩
