import 有CD技能通用类 from '../../通用类/有CD技能通用类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 蛟龙翻江 extends 有CD技能通用类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '蛟龙翻江')!
  技能名称 = '蛟龙翻江'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
    this.初始化技能运行数据()
  }

  释放() {
    const 前置Buff = ['双龙取水', '龙游天地', '龙腾五岳'].find(
      (名称) => this.模拟循环.当前自身buff列表[名称],
    )
    return { 可以释放: !前置Buff, 异常信息: `请先施展${前置Buff}，或等待前置效果结束` }
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(-this.模拟循环.获取内力消耗(蛟龙翻江.技能数据), this.技能名称)
    this.更新连招Buff('双龙取水')
  }

  造成伤害() {
    ;['一', '二', '三'].forEach((段, 索引) => this.登记伤害('蛟龙翻江·' + 段, 索引 + 1))
  }

  释放后() {
    this.触发苍龙()
  }

  更新连招Buff(名称?: string) {
    for (const 前置 of ['双龙取水', '龙游天地', '龙腾五岳']) {
      this.模拟循环.卸除buff({ 名称: 前置, 对象: '自身' })
    }
    if (名称) {
      // Lua按蛟龙剩余调息的整秒数设置下一段前置的持续时间。
      const 剩余调息 = this.技能运行数据.待充能时间点[0] - this.模拟循环.当前时间
      this.模拟循环.Buff和Dot数据[名称] = {
        ...this.模拟循环.Buff和Dot数据[名称],
        最大持续时间: Math.floor(剩余调息 / 16) * 16,
      }
      this.模拟循环.添加buff({ 名称, 对象: '自身' })
    }
  }
}

export default 蛟龙翻江
