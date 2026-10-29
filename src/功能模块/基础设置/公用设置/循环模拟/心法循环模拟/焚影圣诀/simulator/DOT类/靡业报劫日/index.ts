import 通用DOT类 from '../../通用类/通用DOT类'
class 靡业报劫日 extends 通用DOT类 {
  获得和刷新() {
    this.更新待生效数据(
      1,
      this.获取当前DOT数据('靡业报劫日'),
      this.获取当前快照buff('靡业报劫·日(DOT)'),
    )
  }
  结算伤害() {
    this.结算并更新运行数据().forEach((数据) => {
      this.触发伤害行为('靡业报劫·日(DOT)', 1, 数据.快照buff列表, 数据.生效时间, true)
    })
  }
}
export default 靡业报劫日
