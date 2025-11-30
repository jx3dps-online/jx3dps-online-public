import { 获取实际帧数 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import { ERROR_ACTION } from '../../utils'

class 挑丝 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '穿云')

  constructor(模拟循环) {
    super(模拟循环)
    挑丝.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '挑丝')
    this.初始化技能运行数据()
  }

  释放() {
    if (this.模拟循环.角色状态信息.心络 < 20) {
      return {
        可以释放: false,
        异常信息: { 信息: ERROR_ACTION.心络错误?.信息 },
      }
    }
    if (!this.模拟循环.当前自身buff列表?.['橙武']?.当前层数) {
      return {
        可以释放: false,
        异常信息: { 信息: '橙武buff到期,无法释放夹线' },
      }
    }
    return { 可以释放: true }
  }

  命中() {
    this.消耗心络('夹线', 20)
    this.回复心络('夹线', 10)
    this.触发伤害行为('夹线', 1)

    this.模拟循环.技能类实例集合?.夹线DOT?.获得和刷新夹线DOT()
    this.模拟循环.技能类实例集合?.千里急?.自动释放('夹线', this.模拟循环.当前时间)
    this.保存释放记录('夹线')
  }


  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      伤害段数: (this.模拟循环.技能类实例集合?.千里急?.当前千里急 + 3) % 4 || 4,
      重要buff列表: this.获取当前重要buff列表(['钤束', '虚影']),
    }
  }
}

export default 挑丝

export const 挑丝类型 = typeof 挑丝
