import { 属性加成 } from './属性'
import { 计算公式计算类型 } from './伤害计算'

/**
 * @name 技能基础数据模型
 * @description 描述技能的基础数据，为后续技能计算提供基础属性
 */
export interface 技能基础数据模型 {
  /**
   * @name 技能ID
   * @description 技能ID
   */
  技能ID?: number | string
  /**
   * @name 技能名称
   * @description 实际造成的技能伤害名称
   */
  技能名称: string
  /**
   * @name 统计名称
   * @description 在最终显示时可以选择合并成同一个名称显示
   */
  统计名称?: string
  /**
   * @name 伤害类型
   * @description 不吃另一个类型的 攻击破防会心会效增伤
   */
  伤害类型?: '内功' | '外功'
  /**
   * @name 秘籍依赖技能
   * @description 部分多个技能映射同一个技能的秘籍时，使用此字段表明
   */
  秘籍依赖技能?: string
  /**
   * @name 技能伤害系数
   * @description 游戏面板技能伤害 / 角色面板攻击
   * @default 0
   */
  技能伤害系数?: number
  /**
   * @name DOT跳数
   */
  DOT跳数?: number
  /**
   * @name DOT生效间隔
   */
  DOT生效间隔?: number
  /**
   * @name 技能基础伤害-基础值
   * @description 游戏面板技能造成基础伤害
   * @default 0
   */
  基础伤害_基础值?: number
  /**
   * @name 技能基础伤害-浮动值
   * @description 游戏面板技能造成浮动伤害
   * @description 技能最大伤害为基础值 + 浮动值
   * @default 0
   */
  基础伤害_浮动值?: number
  /**
   * @name 基础伤害_倍率-浮动值
   * @description 基础值和浮动值都吃此倍率
   * @default 0
   */
  基础伤害_倍率?: number
  /**
   * @name 武器伤害系数
   * @description 游戏面板描述 “造成xxx%武器伤害”
   * @default 0
   */
  武器伤害系数?: number
  /**
   * @name 伤害计算次数
   * @description 计算原始伤害时计算几次（例如4层流血则计算4次伤害）
   * @default 1
   */
  伤害计算次数?: number
  /**
   * @name 技能增益列表
   */
  技能增益列表?: 技能增益列表类型[]
  /**
   * @name 真实伤害
   * @description 大部分百战技能和大附魔技能的伤害
   * @description 只吃秋肃和等级减伤
   */
  真实伤害?: number
  /**
   * @name 伤害计算类型标记
   * @description 计算伤害时是否对某些环节进行计算
   * @default [增伤, 破防, 会心, 等级减伤, 无双, 非侠, 易伤]
   */
  伤害计算类型标记?: 计算公式计算类型[]
  /**
   * @name 技能等级数据
   * @description 当传入技能等级进行系数等取值时，优先从满足条件的技能等级取值，不满足再取对象外面的默认属性值
   * @description 取到的值对原值进行直接覆盖处理
   * @key
   * key代表技能等级范围，如果key为单个数字，代表只有对应等级满足
   * 如果key为 1,10 代表1级到10级都满足
   */
  技能等级数据?: { [key: string]: 技能等级数据类型 }
  /**
   * @name 伤害计算类型
   * @description 伤害计算类型
   * @description 区分毒经宠物伤害等的计算类型
   */
  伤害计算类型?: string
  /**
   * @name 跳数系数变动
   * @description 跳数系数变动
   * @description 部分DOT系数随跳数变化而变化
   */
  跳数系数变动?: (跳数: number) => number
  /**
   * @name 技能依赖奇穴
   */
  技能依赖奇穴?: string
}

export interface 技能等级数据类型
  extends Partial<Omit<技能基础数据模型, '技能伤害系数' | '基础伤害_基础值' | '基础伤害_浮动值'>> {
  /**
   * @name 技能伤害系数
   * @description 游戏面板技能伤害 / 角色面板攻击
   * @default 0
   */
  技能伤害系数?: number | ((等级: number) => number)
  /**
   * @name 技能基础伤害-基础值
   * @description 游戏面板技能造成基础伤害
   * @default 0
   */
  基础伤害_基础值?: number | number[] | { [key: number]: number }
  /**
   * @name 技能基础伤害-浮动值
   * @description 游戏面板技能造成浮动伤害
   * @description 技能最大伤害为基础值 + 浮动值
   * @default 0
   */
  基础伤害_浮动值?: number | number[] | { [key: number]: number }
}

/**
 * @name 技能增益列表
 * @description 技能增益的计算要符合郭氏理论：https://www.jx3box.com/bps/12752
 */
export interface 技能增益列表类型 {
  /**
   * @name 增益启用增益类型
   * @description 全局启用 - 对整个循环内所有该技能生效
   * @description 部分启用 - 是否生效需要判断循环传入的技能是否携带了该增益
   */
  增益类型: '全局启用' | '部分启用'
  /**
   * @name 依赖奇穴
   * @description 如果没特殊表名，依赖奇穴的名字就为增益本身
   */
  依赖奇穴?: string
  /**
   * @name 依赖装备增益
   * @description 用于部分增益的判断
   */
  依赖装备增益?: string
  /**
   * @name 依赖团队增益
   * @description 用于部分增益的判断
   */
  依赖团队增益?: string
  /**
   * @name 依赖阵眼增益
   * @description 用于部分增益的判断
   */
  依赖阵眼增益?: string
  /**
   * @name 增益是否启用
   * @description 如果在设置增益时直接设为了true，则默认启用。跳过所有计算
   */
  增益启用?: boolean
  /**
   * @name 增益名称
   */
  增益名称: string
  /**
   * @name 是否常驻面板
   * @description 只对“通用增益”生效
   * @description 开启以后，当增益启用时候。将常驻面板展示
   * @description 一般只处理奇穴部分
   */
  是否常驻面板?: boolean
  /**
   * @name 增益所在位置
   */
  增益所在位置: '秘籍' | '奇穴' | '技能' | '职业' | '装备' | '团队增益'
  /**
   * @name 增益集合
   * @description 当一个增益有多个效果时
   */
  增益集合?: 属性加成[]
  // /**
  //  * @name 快照增益
  //  * @description 当为快照增益时，只会在快照计算循环中计算
  //  */
  // 快照增益?: boolean
  /**
   * @name 快照类型
   */
  快照类型?: 快照类型
  /**
   * @name BuffId
   */
  BuffId?: number
  /**
   * @name Buff等级
   */
  Buff等级?: number
  /**
   * @name Buff层数
   */
  Buff层数?: number
  /**
   * @name RecipeId
   */
  RecipeId?: number
  /**
   * @name 增益计算位置
   * @description 用于解析Generator时，给快照技能的current判断是否需要此增益
   *本质为，目标类型增益不会呗快照
   */
  增益计算位置?: '目标' | '自身'
}

export type 快照类型 =
  // | '水特效'
  | '风特效'
  | '套装会心会效'
  | '大附魔_伤腰'
  | '含章挺秀阵'
  | '朝圣'
  | '圣浴明心'
  | '号令三军'
  | '仙王蛊鼎'
  | '寒啸千军'
  | '飘黄'

export const 快照类型数据 = [
  // '水特效',
  '风特效',
  '套装会心会效',
  '大附魔_伤腰',
  '含章挺秀阵',
  '朝圣',
  '圣浴明心',
  '号令三军',
  '仙王蛊鼎',
  '寒啸千军',
  '飘黄',
]

// 额外展示增益来源，方便后续debug
export interface 技能计算增益数据列表 extends 属性加成 {
  增益来源?: string
}
