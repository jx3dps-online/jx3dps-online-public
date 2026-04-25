import 循环模拟技能基础数据 from '../../../constant/skill'
import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 免费破穴 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '免费破穴')
  static 本次释放减少冷却 = 0

  constructor(模拟循环) {
    super(模拟循环)

    //
    免费破穴.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '免费破穴')

    this.初始化技能运行数据()
  }

  释放() {
    const 橙武 = this.模拟循环.当前自身buff列表?.['橙武']?.当前层数
    if (!橙武) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
  }

  命中(是否为最后一个技能) {
    this.模拟循环.技能类实例集合?.破穴?.命中(是否为最后一个技能)
  }

  保存释放记录(段数) {
    const 造成buff数据 = this.获取施加重要buff信息('')
    if (造成buff数据) {
      this.本次释放记录 = {
        伤害段数: 段数,
        重要buff列表: this.获取当前重要buff列表(['']),
        造成buff数据: 造成buff数据,
      }
    }
  }
}

export default 免费破穴

export const 破穴类型 = typeof 免费破穴
