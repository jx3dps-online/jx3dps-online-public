import 四面楚歌 from '../四面楚歌'
import type { 技能运行数据类型 } from '../../type'

interface 橙武四面楚歌 {
  技能运行数据: 技能运行数据类型
}

class 橙武四面楚歌 extends 四面楚歌 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '橙武四面楚歌')
  }

  授予橙武额外施展() {
    this.更新技能运行数据({ 额外施展次数: 1 })
  }

  释放() {
    if (this.模拟循环.当前自身buff列表.橙武 && this.技能运行数据.额外施展次数) {
      return { 可以释放: true }
    }
    return { 可以释放: false, 异常信息: { 信息: '当前没有橙武四面楚歌施展资格' } }
  }

  命中() {
    this.更新技能运行数据({ 额外施展次数: 0 })
    super.命中()
  }
}

export default 橙武四面楚歌
