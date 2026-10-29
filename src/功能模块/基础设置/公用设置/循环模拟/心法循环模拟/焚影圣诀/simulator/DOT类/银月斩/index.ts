import 通用DOT类 from '../../通用类/通用DOT类'
class 银月斩 extends 通用DOT类 {
  技能等级 = 18
  获得和刷新() {
    this.更新待生效数据(1, this.获取当前DOT数据('银月斩DOT'), this.获取当前快照buff('银月斩(DOT)'))
  }
  结算伤害() {
    this.结算并更新运行数据().forEach((数据) => {
      this.触发伤害行为('银月斩(DOT)', 1, 数据.快照buff列表, 数据.生效时间, true)
    })
  }
}
export default 银月斩
