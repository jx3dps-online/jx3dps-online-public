import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 雪絮金屏 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.技能数据 = 模拟循环.技能基础数据.find((技能) => 技能.技能名称 === '雪絮金屏')
  }

  释放() {
    if (this.模拟循环.角色状态信息.体态 === '雪絮金屏') {
      return { 可以释放: false, 异常信息: { 信息: '已经处于该体态' } }
    }
    return { 可以释放: true }
  }

  命中() {
    this.模拟循环.切换角色体态('雪絮金屏')
  }
}

export default 雪絮金屏
