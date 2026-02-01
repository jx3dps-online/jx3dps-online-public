import { 列宿游类型 } from './技能类/列宿游/index'
import { 天斗旋类型 } from './技能类/天斗旋/index'
import { 奇门飞宫贰类型 } from './技能类/奇门飞宫贰/index'
import { 杀星在尾类型 } from './技能类/杀星在尾/index'
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
  列宿游?: 列宿游类型
  天斗旋?: 天斗旋类型
  '天斗旋·悟'?: 天斗旋类型
  兵主逆?: any
  奇门飞宫?: any
  奇门飞宫贰?: 奇门飞宫贰类型
  '奇门飞宫·贰'?: 奇门飞宫贰类型
  返闭惊魂?: any
  杀星在尾?: 杀星在尾类型
  等待1秒?: any
  换行?: any
  特效腰坠?: any
}

export interface 技能GCD组 {
  公共?: number
  傍身?: number
  // 双刀?: number
  // 留?: number
  // 灭?: number
  // 驰?: number
  // 游?: number
}

export interface 技能运行数据类型 {
  // 充能满第一次释放时间点?: number
  // 这里注意，如果为多层充能技能，这里的时间代表充能到下一层所需要的时间
  // 计划下次充能时间点?: number
  // 当前层数: number
  待充能时间点: number[]
}

export interface 待生效事件 {
  事件时间: number
  事件名称: string
  事件备注?: any
}

export interface DOT运行数据类型 {
  待生效数据: DOT待生效数据类型[]
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
  技能类型: '傍身' | '对阵' | '其他' | '轻功'
  /**
   * 充能层数
   */
  充能层数?: number
  /**
   * @name 技能释放后添加GCD(帧)
   */
  技能释放后添加GCD: number
  /**
   * @name 最小GCD
   * 加速无法突破的最小GCD限制
   */
  最小GCD?: number
  /**
   * 技能GCD组
   */
  技能GCD组?: '公共' | '自身' | string[]
  /**
   * 是否卡GCD释放
   * 例如灭，卡在下一个技能释放前打出
   */
  是否卡GCD释放?: boolean
  /**
   * 显示类型
   */
  显示类型?: '大橙武模拟'
  /**
   * 回复锐意
   */
  回复锐意?: number
  /**
   * 消耗锐意
   */
  消耗锐意?: number
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
   * 读条时间
   */
  读条时间?: number
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
   */
  说明?: string
}

export interface Buff枚举 {
  [key: string]: BuffDTO | DotDTO
}

export interface DOT列表 {
  [key: string]: DOT运行数据类型
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
  延长时间: number
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
   * 延长时间
   */
  延长时间?: number
  /**
   * 最多延长次数
   * 一个buff持续时间内最多延长次数，未定义可以一直延长
   */
  最多延长次数?: number
  /**
   * 已延长次数
   * 一个buff持续时间内最多延长次数，未定义可以一直延长
   */
  已延长次数?: number
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
   * 打完本技能换行
   */
  打完本技能换行?: boolean
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
  }
}

export type 日志类型 =
  | '释放技能'
  | '自身buff变动'
  | '目标buff变动'
  | '造成伤害'
  | '技能释放结果'
  | '等CD'
  | '回复锐意'
  | '消耗锐意'
  | '循环异常'

export interface 模拟信息类型 {
  角色状态信息: 角色状态信息类型
  当前自身buff列表: Buff枚举
  当前目标buff列表: Buff枚举
  战斗开始时间?: number
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
  技能释放记录结果: 技能释放记录结果
}

export interface 技能释放记录结果 {
  实际伤害技能?: string // 针对造成伤害的实际名称
  伤害段数?: number // 针对行、沧的实际伤害段数
  重要buff列表?: string[] // 影响技能结果的重要buff列表
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
