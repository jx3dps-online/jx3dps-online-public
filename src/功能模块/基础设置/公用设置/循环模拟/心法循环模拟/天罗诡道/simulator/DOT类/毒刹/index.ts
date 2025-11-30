import {DOT来源类型} from '../../type'
import 通用DOT类 from '../../通用类/通用DOT类'

class 毒刹 extends 通用DOT类 {
  constructor(模拟循环:any) {
    super(模拟循环)
  }

  获得毒刹(来源?: DOT来源类型) {
    const 新层数 = this.添加DOT('DOT_毒刹')
    const 数据 = this.获取当前DOT数据('DOT_毒刹')
    this.更新待生效数据(新层数, 数据)
    this?.更新DOT运行数据({ 当前Dot来源: 来源, 当前Dot实际名称: '毒刹' })
  }



  存在(){
    return this?.模拟循环?.技能类实例集合?.DOT_毒刹?.DOT运行数据?.待生效数据?.length > 0
  }
}

export default 毒刹

export const DOT毒刹类型 = typeof 毒刹
