import { 目标属性类型 } from '@/@types/常量'
import { 循环技能详情, 循环详情 } from '@/@types/循环'
import { 快照类型, 技能基础数据模型 } from '@/@types/技能'
import { 角色基础属性类型 } from '@/@types/角色'
import { 增益选项数据类型 } from './团队增益'
import { 装备信息数据类型 } from './装备'

export interface 完整技能伤害入参类型 {
  当前技能属性: 技能基础数据模型
  最终人物属性: 角色基础属性类型
  当前目标: 目标属性类型
  技能总数?: number
  郭氏额外会效果值?: number
  郭氏突破上限会心效果值?: number
  郭氏额外无双等级?: number
  额外会心率?: number
  郭氏无视防御?: number
  郭氏属性无视防御?: number
  技能增伤?: 技能增伤类型
  最终计算属性?: 最终计算属性类型
  计算技能详情?: boolean
}

export type 计算类型 = '普通伤害' | '端游破招' | '无界破招' | '真实伤害' | '毒经宠物伤害'
export interface 技能总伤害计算入参类型 {
  计算循环: 循环技能详情[]
  装备信息: 装备信息数据类型
  当前目标: 目标属性类型
  技能数据映射: Map<string, 技能基础数据模型>
  增益启用: boolean
  增益数据: 增益选项数据类型
  战斗时间: number
  是否郭氏计算: boolean
  快照计算: 快照类型[]
  计算循环详情?: 循环详情
  奇穴数据?: string[]
  计算技能详情?: boolean
}

// 最终计算属性 用于统计、合并、区分各类型增益做统一计算
export interface 最终计算属性类型 {
  /**
   * @name 郭氏身法
   * @description 郭氏身法百分比加成
   * 计算时与身法奇穴的加成要加法计算。但是要注意代入的数据是否已经是卢令加成果的身法数据
   */
  郭氏身法: number
  /**
   * @name 郭氏力道
   * @description 郭氏力道百分比加成
   * 计算时与力道奇穴的加成要加法计算。但是要注意代入的数据是否已经是卢令加成果的力道数据
   */
  郭氏力道: number
  /**
   * @name 郭氏元气
   * @description 郭氏元气百分比加成
   * 计算时与元气奇穴的加成要加法计算。但是要注意代入的数据是否已经是卢令加成果的元气数据
   */
  郭氏元气: number
  /**
   * @name 郭氏根骨
   * @description 郭氏根骨百分比加成
   * 计算时与根骨奇穴的加成要加法计算。但是要注意代入的数据是否已经是卢令加成果的根骨数据
   */
  郭氏根骨: number
  /**
   * @name 计算目标
   * @description 目前用于计算目标的防御值、等级
   */
  计算目标: 目标属性类型
  /**
   * @name 最终人物属性
   * @description 最终参与计算的人物属性
   */
  最终人物属性: 角色基础属性类型
  /**
   * @name 技能增伤
   * @description 各种类型的技能增伤
   */
  技能增伤: 技能增伤类型
  /**
   * @name 坦克转换类型
   * @description 技能增伤
   */
  坦克转换: 坦克转换类型
  /**
   * @name 气血加成
   * @description 各种类型的气血加成
   */
  气血加成: 气血加成类型
  /**
   * @name 郭氏额外会效果值
   * @description 郭氏额外会效果值，直接带入会效计算公式，和其他会效加成加法计算
   */
  郭氏额外会效果值: number
  /**
   * @name 郭氏突破上限会心效果值
   * @description 郭氏突破上限会心效果值
   */
  郭氏突破上限会心效果值: number
  /**
   * @name 额外会心率
   * @description 相当于面板直接增加的会心率，这里没采用郭氏，可能存在计算误差
   */
  额外会心率: number
  /**
   * @name 郭氏无视防御
   * @description 百分比无视防御
   * 需要注意大部分职业的全局无视防御百分比计算在破风的减法计算之后（例如某奇穴无视防御xx%，天罗阵)
   */
  郭氏无视防御: number
  /**
   * @name 郭氏属性无视防御
   * @description 百分比无视防御
   * 和郭氏无视防御的区别在于，大部分职业针对某技能的无视防御使用此字段
   * 和郭氏无视防御是单独的乘区
   */
  郭氏属性无视防御: number
  /**
   * @name 郭氏无双
   * @description 郭氏无双百分比加成
   * 对面板无双进行百分比计算，例：无方养荣
   */
  郭氏无双: number
  /**
   * @name 郭氏破招
   * @description 郭氏破招百分比加成
   * 对面板破招进行百分比计算，例：万花钟灵
   */
  郭氏破招: number
  /**
   * @name 郭氏额外无双等级
   * @description 郭氏额外无双等级
   * 郭氏额外无双等级，当前基本为阵眼的无双加成。直接加无双面板，和当前身上无双属性无关
   */
  郭氏额外无双等级: number
  /**
   * @name 郭氏破防等级
   * @description 郭氏破防等级
   * 当前面板破防值的百分比增益计算，先计算加法再计算乘法
   */
  郭氏破防等级: number
  /**
   * @name 郭氏基础攻击
   * @description 郭氏基础攻击
   * 当前面板基础攻击的百分比增益计算，先计算加法再计算乘法
   */
  郭氏基础攻击: number
  /**
   * @name 郭氏武器伤害
   * @description 郭氏武器伤害
   * 当前面板武伤的百分比增益计算，先计算加法再计算乘法
   */
  郭氏武器伤害: number
}

export interface 技能增伤类型 {
  通用增伤: number
  目标移动状增伤: number // ADD_DAMAGE_BY_DST_MOVE_STATE 根据目标移动状态增伤
  全局伤害因子: number // GLOBAL_DAMAGE_FACTOR 用于修正破招伤害，同时特殊作用于 [正律和鸣]，[青冠]
  易伤增伤: number
  非侠增伤: number
  最终增伤: number
  职业最终增伤: number
  系数增伤: number // 这里的系数增伤直接修改系数，不乘在最后
  系数置换函数?: (level: number) => number
}

export interface 坦克转换类型 {
  郭氏体质转基础攻击: number
  郭氏体质转全会心: number
  郭氏体质转全破防: number
}

export interface 气血加成类型 {
  郭氏体质: number // 体质
  郭氏基础气血上限: number // 例如 清心 肘子
  郭氏最终气血上限: number // 例如雷
}

export interface 计算记录类型 {
  当前记录: 计算记录数据
  最高记录: 计算记录数据
}
export interface 计算记录数据 {
  计算循环: string
  计算时间: number
  秒伤: number
}
