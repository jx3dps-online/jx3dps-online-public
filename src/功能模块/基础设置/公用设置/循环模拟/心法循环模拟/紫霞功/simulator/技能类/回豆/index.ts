import 技能统一类 from '../../通用类/技能统一类'

class 回豆 extends 技能统一类 {
  释放() {
    const { 会心回豆, 技能释放记录 } = this.模拟循环
    return 会心回豆 || 技能释放记录[技能释放记录.length - 1]?.技能名称 === '两仪化形'
      ? { 可以释放: true }
      : { 可以释放: false, 异常信息: '回豆只能紧接两仪化形使用' }
  }

  命中() {
    if (!this.模拟循环.会心回豆) this.模拟循环.改变气点(2, '会心回豆')
  }
}

export default 回豆
