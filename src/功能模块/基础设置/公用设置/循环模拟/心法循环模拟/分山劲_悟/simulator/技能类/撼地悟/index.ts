import 有CD技能通用类 from '../../通用类/有CD技能通用类'

// 撼地·悟：20秒调息，无公共调息，可在循环内无损插入
class 撼地悟 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  造成伤害() {
    this.触发伤害行为('撼地·悟')
  }

  释放后() {
    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['血怒·悟', '擎刀']),
    }
  }
}

export default 撼地悟
export const 撼地悟类型 = typeof 撼地悟
