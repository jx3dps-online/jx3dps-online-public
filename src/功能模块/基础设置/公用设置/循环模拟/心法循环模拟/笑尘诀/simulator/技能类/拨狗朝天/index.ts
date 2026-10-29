import 技能统一类 from '../../通用类/技能统一类'
import type 循环主类 from '../../main'
import 技能基础数据 from '../../../constant/skill'

class 拨狗朝天 extends 技能统一类 {
  static 技能数据 = 技能基础数据.find((技能) => 技能.技能名称 === '拨狗朝天')!
  技能名称 = '拨狗朝天'

  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  释放() {
    if (this.模拟循环.当前自身buff列表.横打双獒)
      return { 可以释放: false, 异常信息: '请先施展横打双獒，或等待前置效果结束' }
    return { 可以释放: true }
  }

  命中() {
    this.保存释放记录()
    this.模拟循环.更新内力(
      this.模拟循环.秘籍[this.技能名称]?.includes('回蓝3%') ? 18 : 15,
      this.技能名称,
    )
  }

  造成伤害() {
    const 延迟 = this.模拟循环.当前自身buff列表.逍遥 ? 6 : 0
    this.登记伤害('拨狗朝天·真实', 延迟)
    if (this.模拟循环.校验奇穴是否存在('追远')) this.登记伤害('追远')
  }

  延迟生效(伤害名称: string) {
    if (伤害名称 === '拨狗朝天·真实') {
      this.模拟循环.卸除buff({ 名称: '狂龙乱舞', 对象: '自身' })
      this.模拟循环.添加buff({ 名称: '横打双獒', 对象: '自身' })
    }
  }
}

export default 拨狗朝天
