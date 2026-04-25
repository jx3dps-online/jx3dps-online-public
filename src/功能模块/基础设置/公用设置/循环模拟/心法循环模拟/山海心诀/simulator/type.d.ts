import { 劲风簇类型 } from './技能类/劲风簇'
import { 饮羽簇类型 } from './技能类/饮羽簇'
import { 白羽流星类型 } from './技能类/白羽流星'
import { 弛风鸣角类型 } from './技能类/弛风鸣角'
import { 没石饮羽类型 } from './技能类/没石饮羽'
import { 触发橙武类型 } from './技能类/触发橙武'
import { 朝仪万汇类型 } from './技能类/朝仪万汇'
import { 引风唤灵类型 } from './技能类/引风唤灵'
import { 弛律召野类型 } from './技能类/弛律召野'
import { 风尽浮生类型 } from './技能类/风尽浮生'
import { 寒更晓箭类型 } from './技能类/寒更晓箭'
import { 金乌见坠类型 } from './技能类/金乌见坠'
import { 空弦惊雁类型 } from './技能类/空弦惊雁'
import { 贯穿DOT类型 } from './DOT类/贯穿'
import { 宠物类型 } from './通用类/宠物'
import { DpsListData } from '@/components/Dps/guoshi_dps_utils'
import { 箭形态枚举 } from '../constant/enum'

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
  劲风簇?: 劲风簇类型
  饮羽簇?: 饮羽簇类型
  贯穿?: 贯穿DOT类型
  白羽流星?: 白羽流星类型
  弛风鸣角?: 弛风鸣角类型
  没石饮羽?: 没石饮羽类型
  朝仪万汇?: 朝仪万汇类型
  寒更晓箭?: 寒更晓箭类型
  宠物?: 宠物类型
  引风唤灵?: 引风唤灵类型
  弛律召野?: 弛律召野类型
  风尽浮生?: 风尽浮生类型
  金乌见坠?: 金乌见坠类型
  空弦惊雁?: 空弦惊雁类型
  触发橙武?: 触发橙武类型
  特效腰坠?: any
  唤灵印?: any
  下马?: any
  游雾乘云?: any
  汇灵合契?: any
  聚势摧霆?: any
  换行?: any
  没石饮羽?: any
}

export interface 技能GCD组 {
  公共?: number
  自身?: number
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
}

export interface DOT列表 {
  [key: string]: DOT运行数据类型
}

export interface DOT待生效数据类型 {
  当前层数?: number
  生效时间?: number
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
  技能类型: '箭系' | '宠物' | '其他'
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
   */
  技能GCD组?: '公共' | '自身'
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
   * 消耗箭数
   */
  消耗箭数?: number
  /**
   * 不显示标鹄层数
   */
  不显示标鹄层数?: boolean
  /**
   * 是否为倒读条技能
   * 倒读条技能有延迟补偿，不计算延迟
   */
  是否为倒读条技能?: boolean
  /**
   * 说明
   */
  说明?: string
  /**
   * 额外信息
   */
  额外信息?: 额外信息类型
}

export interface 额外信息类型 {
  延迟?: number | 'GCD'
}
export interface 角色状态信息类型 {
  // 箭数: number
  箭袋信息: 箭袋信息类型[]
  换灵印: { [key: string]: boolean }
}

export interface 箭袋信息类型 {
  箭形态: 箭形态枚举
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
  }
}

export type 日志类型 =
  | '释放技能'
  | '自身buff变动'
  | '目标buff变动'
  | '造成伤害'
  | '技能释放结果'
  | '等CD'
  | '消耗箭'
  | '上贯穿'
  | '棘矢引爆贯穿'
  | '于狩引爆贯穿'
  | '宠物进入场地'
  | '宠物离开场地'
  | '循环异常'

export interface 模拟信息类型 {
  角色状态信息: 角色状态信息类型
  当前宠物数据: 当前宠物数据
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
  重要buff列表?: string[] // 影响技能结果的重要buff列表
  特殊标记?: number
  背景容器?: React.ReactNode
  底部标识?: React.ReactNode
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

export interface 当前宠物数据 {
  [key: string]: 宠物数据
}

export interface 宠物数据 {
  宠物: string
  入场时间: number
  离场时间: number
  // buff?: Buff枚举
}
