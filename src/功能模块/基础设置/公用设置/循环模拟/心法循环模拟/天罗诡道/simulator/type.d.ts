import { 换行类型 } from './技能类/换行'
import { 触发橙武类型 } from './技能类/触发橙武'
import { DpsListData } from '@/components/Dps/guoshi_dps_utils'
import { 千机变类型 } from './技能类/千机变'
import { 孔雀翎类型 } from './技能类/孔雀翎'
import { 心无旁骛类型 } from './技能类/心无旁骛'
import { 星离雨散类型 } from './技能类/星离雨散'
import { 暗藏杀机类型 } from './技能类/暗藏杀机'
import { 暴雨梨花针类型 } from './技能类/暴雨梨花针'
import { 蚀肌弹类型 } from './技能类/蚀肌弹'
import { 飞星遁影类型 } from './技能类/飞星遁影'
import { 鬼斧神工类型 } from './技能类/鬼斧神工'

import { 天女散花类型 } from './技能类/天女散花'
import { 连弩类型 } from './技能类/连弩'
import { 重弩类型 } from './技能类/重弩'
import { 毒刹类型 } from './技能类/毒刹'
import { 天绝地灭类型 } from './技能类/天绝地灭'
import { 千机连环类型 } from './技能类/千机连环'


import { DOT连弩类型 } from './DOT类/连弩'
import { DOT化血类型 } from './DOT类/化血'
import { DOT重弩类型 } from './DOT类/重弩'
import { DOT毒刹类型 } from './DOT类/毒刹'
import { DOT天绝地灭类型 } from './DOT类/天绝地灭'
import { DOT千机连环类型 } from './DOT类/千机连环'



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
  千机变?: 千机变类型
  孔雀翎?: 孔雀翎类型
  心无旁骛?: 心无旁骛类型
  星离雨散?: 星离雨散类型
  暗藏杀机?: 暗藏杀机类型
  暴雨梨花针?: 暴雨梨花针类型
  蚀肌弹?: 蚀肌弹类型
  飞星遁影?: 飞星遁影类型
  鬼斧神工?: 鬼斧神工类型
  天绝地灭?: 天绝地灭类型
  换行?: 换行类型
  触发橙武?: 触发橙武类型
  特效腰坠?: any

  连弩?: 连弩类型
  重弩?: 重弩类型
  毒刹?: 毒刹类型
  千机连环?: 千机连环类型
  天女散花?: 天女散花类型

  DOT_化血?: DOT化血类型
  DOT_连弩?: DOT连弩类型
  DOT_重弩?: DOT重弩类型
  DOT_毒刹?: DOT毒刹类型
  DOT_天绝地灭?: DOT天绝地灭类型
  DOT_千机连环?: DOT千机连环类型

}

export interface 技能GCD组 {
  公共?: number
  自身?: number
  千机变?: number
}

export interface 技能运行数据类型 {
  // 充能满第一次释放时间点?: number
  // 这里注意，如果为多层充能技能，这里的时间代表充能到下一层所需要的时间
  // 计划下次充能时间点?: number
  // 当前层数: number
  待充能时间点: number[]
}

export interface DOT运行数据类型 {
  待生效数据: DOT待生效数据类型[]
  当前Dot来源?: string
  当前Dot实际名称?: string
  当前层数?: number
  快照buff列表?: string[]
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
  技能类型: '乾坤一掷' | '九宫飞星' | '天魔无相' | '其他'
  /**
   * 充能层数
   */
  充能层数?: number
  /**
   * @name 技能释放后添加GCD(帧)
   */
  技能释放后添加GCD: number
  /**
   * @name 读条时间(帧)
   */
  读条时间?: number
  /**
   * 技能GCD组
   */
  技能GCD组?: '公共' | '自身' | '千机变'
  /**
   * 显示类型
   */
  显示类型?: '大橙武模拟' | '奇穴技能'
  /**
   * 依赖奇穴名
   * 没传入则用技能名称判断
   */
  依赖奇穴名?: string
  /**
   * 初次伤害频率(帧) 0 为释放后立即造成伤害
   */
  初次伤害频率?: number
  /**
   * 伤害频率(帧)
   */
  伤害频率?: number
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
   * 图标
   */
  图标?: string
  /**
   * 技能原始名称
   */
  技能原始名称?: string

  /**
   * 是否为倒读条技能
   * 倒读条技能有延迟补偿，不计算延迟
   */
  是否为倒读条技能?: boolean
  /**
   * 说明
   * 鼠标hover展示说明
   */
  说明?: string
  /**
   * 额外信息
   */
  额外信息?: 额外信息类型
  /**
   * 消耗神机值
   */
  消耗神机值?:number
}

export interface 额外信息类型 {
  延迟?: number | 'GCD'
}

export interface 角色状态信息类型 {
  神机值: number // 0 - 100
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
   * 打完本技能换箭
   */
  打完本技能换箭?: boolean
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
  待生效事件队列: 待生效事件[]
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
  技能列表: DpsListData[]
}

export interface 待生效事件 {
  事件时间: number
  事件名称: string
  事件备注?: any
}

export interface Buff枚举 {
  [key: string]: BuffDTO | DotDTO
}

export type DOT来源类型 = '天女散花' | '天绝地灭' | '连弩' | '重弩' | '千机连环'
