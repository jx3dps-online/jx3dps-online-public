import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 凌然天风悟 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放后() {
    this.模拟循环.添加buff?.({ 名称: '凌然天风', 对象: '自身' })
  }
}

export default 凌然天风悟

export const 凌然天风悟类型 = typeof 凌然天风悟
