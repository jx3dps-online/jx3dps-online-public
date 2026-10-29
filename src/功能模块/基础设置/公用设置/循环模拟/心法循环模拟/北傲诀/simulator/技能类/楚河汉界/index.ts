import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 楚河汉界 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '楚河汉界')
  }

  释放() {
    if (this.模拟循环.校验奇穴是否存在('烽河')) {
      return { 可以释放: false, 异常信息: { 信息: '楚河汉界已被奇穴替换为烽河' } }
    }
    if (this.模拟循环.角色状态信息.气劲 < this.技能数据.消耗数量!) {
      return { 可以释放: false, 异常信息: ERROR_ACTION.资源不足 }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.变更资源('气劲', -this.技能数据.消耗数量!, '楚河汉界')
  }
}

export default 楚河汉界
