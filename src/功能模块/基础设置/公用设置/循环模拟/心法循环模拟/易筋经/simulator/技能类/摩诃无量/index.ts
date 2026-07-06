import { 每秒郭氏帧 } from '@/数据/常量'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 摩诃无量 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '摩诃无量')

  constructor(模拟循环) {
    super(模拟循环)
    摩诃无量.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '摩诃无量')
    this.初始化技能运行数据()
  }

  命中() {
    this.回复禅那('摩诃无量', 1)
  }
}

export default 摩诃无量

export const 摩诃无量类型 = typeof 摩诃无量
