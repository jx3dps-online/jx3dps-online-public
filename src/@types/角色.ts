/**
 * 属性通用模型
 * 不包含各种数据增益。只为装备带来的基础属性
 * 不包含主属性对面板的加成
 */
export interface 角色基础属性类型 {
  /**
   * @name 装分
   * @description 当前装备总分
   */
  装分?: number
  /**
   * @name 攻击力-基础攻击力
   * @description 显示的基础攻击力
   */
  基础攻击: number
  /**
   * @name 攻击力-面板攻击
   * @description 显示的面板攻击
   */
  面板攻击?: number
  /**
   * @name 破防等级
   * @description 游戏内显示的具体破防等级
   */
  破防等级: number
  /**
   * @name 无双等级
   * @description 游戏内显示的具体无双等级
   */
  无双等级: number
  /**
   * @name 力道
   * @description 游戏内显示的具体力道值
   */
  力道: number
  /**
   * @name 身法
   * @description 游戏内显示的具体身法值
   */
  身法: number
  /**
   * @name 元气
   * @description 游戏内显示的具体元气值
   */
  元气: number
  /**
   * @name 根骨
   * @description 游戏内显示的具体根骨值
   */
  根骨: number
  /**
   * @name 加速等级
   * @description 游戏内显示的具体无双值
   */
  加速等级: number
  /**
   * @name 武器伤害_最小值
   */
  武器伤害_最小值: number
  /**
   * @name 武器伤害_最大值
   */
  武器伤害_最大值: number
  /**
   * @name 会心等级
   */
  会心等级: number
  /**
   * @name 会心效果等级
   */
  会心效果等级: number
  /**
   * @name 全能等级
   * @description 游戏内显示的具体全能等级
   */
  全能等级: number
  /**
   * @name 体质
   */
  体质: number
  /**
   * @name 基础气血上限
   */
  基础气血上限: number
  /**
   * @name 额外气血上限
   */
  额外气血上限: number
  /**
   * @name 最终气血上限
   */
  最终气血上限?: number
}
