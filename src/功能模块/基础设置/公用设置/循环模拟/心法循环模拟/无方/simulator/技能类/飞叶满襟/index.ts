import 循环模拟技能基础数据 from '../../../constant/skill'
import { 循环基础技能数据类型 } from '../../type'
import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 飞叶满襟 extends 有CD技能通用类 {
  // scripts/skill/北天药宗/北天药宗_飞叶满襟.lua
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '飞叶满襟')

  constructor(模拟循环) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  检查GCD(索引: any, 当前技能?: 循环基础技能数据类型) {
    let GCD = this.模拟循环?.GCD组?.['自身'] || 0
    let 前一个技能索引 = 索引 - 1
    while (前一个技能索引 >= 0) {
      const 候选技能 = this.模拟循环?.测试循环?.[前一个技能索引]?.split('%')[0]
      if (候选技能 !== '换行') {
        break
      }
      前一个技能索引 -= 1
    }
    const 前一个技能 = this.模拟循环?.测试循环?.[前一个技能索引]
    if (前一个技能 && 前一个技能 === '含锋破月') {
      // 含锋破月 和 飞叶满襟 有0.5秒GCD
      GCD = Math.min(GCD + 8, 当前技能?.技能释放后添加GCD || 0)
    }
    return GCD
  }

  释放() {
    if (!this.模拟循环.当前自身buff列表?.['飞叶满襟']?.当前层数) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    } else {
      return { 可以释放: true }
    }
  }

  命中() {
    this.保存释放记录('飞叶满襟')
    this.触发伤害行为('飞叶满襟')
    if (!this.模拟循环.校验奇穴是否存在('逆势')) {
      this.模拟循环.技能类实例集合.逆乱?.引爆并重新刷新(2, '飞叶满襟')
    }
    this.模拟循环.卸除buff({ 名称: '飞叶满襟', 对象: '自身' })
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['相使']),
    }
  }
}

export default 飞叶满襟

export const 飞叶满襟类型 = typeof 飞叶满襟
