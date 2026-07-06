import { 流血DOT类型 } from './DOT类/流血/index'
import { 技能伤害结果列表类型 } from '@/@types/dps'

// 将一个技能从释放到释放结束的各阶段定义类型
export interface 技能类类型 {
  /**
   * @name 释放前
   * @description 在技能释放之前要做的判断，如GCD，技能是否有CD等
   */
  释放前?: () => void
  /**
   * @name 释放
   * @description 在技能开始释放阶段产生的行为
   */
  释放: () => void
  /**
   * @name 命中
   * @description 在技能开始命中时产生的行为
   */
  命中?: () => void
  /**
   * @name 造成伤害
   * @description 在技能开始造成伤害时行为
   */
  造成伤害?: () => void
  /**
   * @name 造成伤害后
   * @description 在技能造成伤害结束时行为
   */
  造成伤害后?: () => void
  /**
   * @name 释放后
   * @description 在技能完成释放后产生的行为
   */
  释放后?: () => void
}

export interface 技能类实例集合 {
  盾击?: 盾击类型
  盾猛?: 盾猛类型
  盾压?: 盾压类型
  盾刀?: 盾刀类型
  斩刀?: 斩刀类型
  绝刀?: 绝刀类型
  劫刀?: 劫刀类型
  闪刀?: 闪刀类型
  盾飞?: 盾飞类型
  盾回?: 盾回类型
  血怒?: 血怒类型
  盾舞?: 盾舞类型
  撼地?: 撼地类型
  阵云结晦?: 阵云结晦类型
  月照连营?: 月照连营类型
  雁门迢递?: 雁门迢递类型
  业火麟光?: 业火麟光类型
  断马摧城?: 断马摧城类型
  偃守孤旌?: 偃守孤旌类型
  流血?: 流血DOT类型
  触发橙武?: 触发橙武类型
  重置盾压?: 重置盾压类型
  特效腰坠?: any
  换行?: any
  // 先做隐藏的铁骨技能，方便攻略组的铁骨兄弟用来排轴
  寒啸千军?: 寒啸千军类型
  盾挡?: 盾挡类型
}

export interface 技能GCD组 {
  公共?: number
  盾击?: number
  盾飞?: number
}

export interface 技能运行数据类型 {
  待充能时间点: number[]
}

export interface DOT运行数据类型 {
  待生效数据: DOT待生效数据类型[]
}

export interface DOT列表 {
  [key: string]: DOT运行数据类型
}

export interface DOT待生效数据类型 {
  当前层数?: number
  生效时间?: number
  快照buff列表?: string[]
}

export interface 检查运行数据实例类型 {
  技能运行数据: 技能运行数据类型
  更新技能运行数据: (新数据: Partial<技能运行数据类型>) => void
}

// 循环模拟器type文件
/**
 * @name 循环基础技能
 */
export interface 循环基础技能数据类型 {
  /**
   * @name 技能名称
   */
  技能名称: string
  /**
   * @name 技能类型
   */
  技能类型: '云城盾' | '苍雪刀' | '通用' | '其他'
  /**
   * @name 技能类型
   */
  体态?: '擎刀' | '擎盾'
  /**
   * 充能层数
   */
  充能层数?: number
  /**
   * @name 技能释放后添加GCD(帧)
   */
  技能释放后添加GCD: number
  /**
   * 技能GCD组
   * 苍云有三套GCD：16常规24帧GCD，804盾击16帧GCD，836隐刀8帧GCD
   */
  技能GCD组?: '公共' | '盾击804' | '隐刀836' | '自身'
  检测GCD组?: Array<'公共' | '盾击804' | '隐刀836' | '盾飞822' | '自身'>
  触发GCD组?: Array<'公共' | '盾击804' | '隐刀836' | '盾飞822' | '自身'>
  /**
   * 是否卡GCD释放
   * 例如灭，卡在下一个技能释放前打出
   */
  是否卡GCD释放?: boolean
  /**
   * 显示类型
   */
  显示类型?: '大橙武模拟' | '奇穴技能'
  /**
   * 依赖奇穴名
   */
  依赖奇穴名?: string
  /**
   * 回复怒气
   */
  回复怒气?: number
  /**
   * 消耗怒气
   */
  消耗怒气?: number
  /**
   * 回复格挡
   */
  // 回复格挡?: number
  /**
   * 消耗格挡
   */
  // 消耗格挡?: number
  /**
   * 初次伤害频率(帧) 0 为释放后立即造成伤害
   */
  初次伤害频率?: number
  /**
   * 伤害频率(帧)
   */
  伤害频率?: number
  /**
   * 造成伤害次数
   */
  造成伤害次数: number
  /**
   * 是否为读条技能
   */
  是否为读条技能?: boolean
  /**
   * 最大充能层数
   */
  最大充能层数?: number
  /**
   * 技能CD(帧)
   */
  技能CD?: number
  /**
   * 创建循环不可选
   */
  创建循环不可选?: boolean
  /**
   * 实际技能 - 用于显示不同名字时判断为相同技能
   */
  实际技能?: string
  /**
   * 图标
   */
  图标?: string
  /**
   * 技能原始名称
   */
  技能原始名称?: string
  /**
   * 说明
   * 鼠标hover展示说明
   */
  说明?: string
  /**
   * 额外信息
   */
  额外信息?: 额外信息类型
  释放依赖Buff?: string[]
  Buff存在不可释放?: string[]
  可中断倒读条最大跳数?: number
  最小GCD?: number
}

export interface 额外信息类型 {
  延迟?: number | 'GCD'
}

export interface 角色状态信息类型 {
  怒气?: number
  // 格挡?: number
  体态?: '擎盾' | '擎刀'
}

export interface Buff枚举 {
  [key: string]: BuffDTO | DotDTO
}

// Dot数据
export interface DotDTO extends BuffDTO {
  /**
   * 伤害频率
   * @单位 帧
   */
  伤害频率: number
  /**
   * 初次伤害频率
   * @单位 帧
   */
  初次频率?: number
  /**
   * 是否吃加速
   * 默认吃
   */
  是否吃加速?: boolean
  /**
   * 最大作用次数
   * DOT作用次数
   */
  最大作用次数: number
}

// buff数据
export interface BuffDTO {
  /**
   * 名称
   */
  名称: string
  /**
   * 最大层数
   */
  最大层数: number
  /**
   * 类型
   */
  类型: '自身' | '目标'
  /**
   * 最大持续时间
   * buff添加后的持续时间
   * 如果没有传入就是永久buff
   */
  最大持续时间?: number
  /**
   * 当前层数
   */
  当前层数?: number
  /**
   * 自然消失失去层数
   * 默认为最大层数
   */
  自然消失失去层数?: number
  /**
   * 刷新时间
   * 第一次添加或刷新持续时间的时间点
   */
  刷新时间?: number
  /**
   * 图标
   */
  图标?: string
  /**
   * 备注
   */
  备注?: string
}

// 用来显示的循环技能类型类型
export interface ShowCycleSingleSkill extends 循环基础技能数据类型, 技能释放记录数据 {
  /**
   * 计划释放时间
   */
  计划释放时间?: number
  /**
   * 实际释放时间
   */
  实际释放时间?: number
  /**
   * 开始读条时间
   */
  开始读条时间?: number
  /**
   * 打完本技能进入擎刀
   */
  打完本技能进入擎刀?: boolean
  /**
   * index
   */
  index?: number // 总技能序列索引
}

// 用来显示的循环类型
export interface ShowCycle {
  /**
   * 循环具体技能
   */
  循环: ShowCycleSingleSkill[]
  /**
   * 本轮总用时
   */
  本轮总用时: number
}

export interface 循环日志数据类型 {
  /**
   * 日志
   */
  日志: string
  /**
   * 战斗日志描述
   */
  战斗日志描述?: string
  /**
   * 造成伤害
   */
  造成伤害?: number
  /**
   * 造成总伤害
   */
  造成总伤害?: number
  /**
   * 秒伤
   */
  秒伤?: number
  /**
   * 日志类型
   */
  日志类型?: 日志类型
  /**
   * 日志时间
   */
  日志时间?: number
  /**
   * buff携带
   */
  buff列表?: string[]
  /**
   * 其他数据
   */
  其他数据?: {
    伤害次数?: number
    技能等级?: number
  }
}

export type 日志类型 =
  | '释放技能'
  | '自身buff变动'
  | '目标buff变动'
  | '造成伤害'
  | '技能释放结果'
  | '等CD'
  | '回复怒气'
  | '消耗怒气'
  | '循环异常'

export interface 模拟信息类型 {
  角色状态信息: 角色状态信息类型
  当前自身buff列表: Buff枚举
  当前目标buff列表: Buff枚举
  当前时间: number
  循环执行结果: '成功' | '异常'
  循环异常信息: { 异常索引?: number; 异常信息?: any }
  技能释放记录: 技能释放记录数据[]
  当前各技能运行状态: { [key: string]: 技能运行数据类型 }
  当前DOT运行状态: { [key: string]: DOT运行数据类型 }
  当前GCD组: 技能GCD组
  技能基础数据: 循环基础技能数据类型[]
}

export interface 技能释放记录数据 {
  技能名称: string
  计划释放时间: number
  实际释放时间: number
  是否为读条技能: boolean
  开始读条时间?: number
  技能释放记录结果: 技能释放记录结果
}

export interface 技能释放记录结果 {
  实际伤害技能?: string // 针对造成伤害的实际名称
  伤害段数?: number // 针对行、沧的实际伤害段数
  特殊标记?: number | string // 标记破绽层数和援戈层数
  实际图标?: string
  重要buff列表?: string[] // 影响技能结果的重要buff列表
  底部标识?: boolean | number // 用于标识技能结果展示在底部
  造成buff数据?: {
    // 针对吃影子、灭这种会添加有益buff的情况
    buff名称: string
    buff开始时间: number
    buff结束时间: number
  }
}

export interface 模拟DPS结果 {
  dps: number
  total: number
  战斗时间: number
  技能列表: 技能伤害结果列表类型[]
}

export interface 待生效事件 {
  事件时间: number
  事件名称: string
  事件备注?: any
}
