// import 循环主类 from '../main'
import 循环模拟技能基础数据 from '../../../constant/skill'
import { ERROR_ACTION } from '../../utils'
import 技能统一类 from '../../通用类/技能统一类'

class 断云势 extends 技能统一类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '断')

  constructor(模拟循环) {
    super(模拟循环)

    断云势.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '断')
  }

  触发断云势伤害(名称) {
    // 镇机破绽增伤
    if (this.模拟循环.校验奇穴是否存在?.('镇机')) {
      const 目标身上破绽层数 = this.模拟循环.当前目标buff列表?.['破绽']?.当前层数 || 0
      if (目标身上破绽层数 > 0) {
        this.触发伤害行为(名称, 1, [`镇机_破绽_${目标身上破绽层数}`])
      }
    } else {
      this.触发伤害行为(名称, 1)
    }
  }

  获取消耗锐意() {
    return 断云势?.技能数据?.消耗锐意 || 0
  }

  释放() {
    if (
      !this.模拟循环?.角色状态信息?.锐意 ||
      this.模拟循环?.角色状态信息?.锐意 < this.获取消耗锐意()
    ) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.锐意不足,
      }
    } else {
      return { 可以释放: true }
    }
  }

  命中() {
    this.弱点击破判定()

    // CW断6秒内无消耗
    if (!this.模拟循环.当前自身buff列表?.['橙武']?.当前层数) {
      this.触发消耗锐意(this.获取消耗锐意(), 断云势.技能数据?.技能名称)
    }
  }

  造成伤害(索引) {
    this.触发断云势伤害('断云势')

    this.保存释放记录()

    // 判断血量是否大于70
    this.触发断云势伤害('断云势·额外伤害')
  }

  释放后() {
    this.模拟循环.切换角色体态?.('双刀', 断云势.技能数据?.技能名称)
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['灭影追风', '流岚']),
    }
  }
}

export default 断云势

export const 断云势类型 = typeof 断云势
