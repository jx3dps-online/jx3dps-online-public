import 技能统一类 from '../../通用类/技能统一类'

class 破势二段 extends 技能统一类 {
  释放() {
    return this.模拟循环.校验奇穴是否存在('破势') &&
      !!this.模拟循环.当前自身buff列表.破势二段?.当前层数
      ? { 可以释放: true }
      : { 可以释放: false, 异常信息: '没有可用的破势二段资格' }
  }

  命中() {
    const Buff = this.模拟循环.当前自身buff列表.破势二段
    this.本次释放记录 = { 实际伤害技能: '破势' }
    this.触发伤害行为('破势')
    this.模拟循环.卸除buff({
      名称: '破势二段',
      对象: '自身',
      卸除层数: 1,
      buff刷新时间: Buff.刷新时间,
    })
  }
}

export default 破势二段
