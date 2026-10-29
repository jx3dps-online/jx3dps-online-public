import type 坚冰 from './技能类/坚冰'
import type 祭湘君 from './技能类/祭湘君'
import type 苍龙戾天 from './技能类/苍龙戾天'
import type 亢龙有悔 from './技能类/亢龙有悔'
import type 天隼击 from './技能类/天隼击'
import type 恶狗拦路 from './技能类/恶狗拦路'
import type 拨狗朝天 from './技能类/拨狗朝天'
import type 换行 from './技能类/换行'
import type 时乘六龙 from './技能类/时乘六龙'
import type 棒打狗头 from './技能类/棒打狗头'
import type 横打双獒 from './技能类/横打双獒'
import type 蛟龙翻江 from './技能类/蛟龙翻江'
import type 双龙取水 from './技能类/双龙取水'
import type 龙游天地 from './技能类/龙游天地'
import type 龙腾五岳 from './技能类/龙腾五岳'
import type 犬牙交错 from './技能类/犬牙交错'
import type 狂龙乱舞 from './技能类/狂龙乱舞'
import type 笑醉狂 from './技能类/笑醉狂'
import type 自酌阑 from './技能类/自酌阑'
import type 落水打狗 from './技能类/落水打狗'
import type 蜀犬吠日 from './技能类/蜀犬吠日'
import type 触发橙武 from './技能类/触发橙武'
import type 酒中仙 from './技能类/酒中仙'
import type 醉逍遥 from './技能类/醉逍遥'
import type 龙啸九天 from './技能类/龙啸九天'
import type 龙战于野 from './技能类/龙战于野'
import type 龙跃于渊 from './技能类/龙跃于渊'
import type 灼烧 from './DOT类/灼烧'
import type 特效腰坠 from '../../通用/通用技能/特效腰坠'
import type { Buff枚举 } from '../../通用/通用框架/类型定义/Buff'
import type {
  循环基础技能数据类型 as 通用技能数据类型,
  技能释放记录数据,
  技能GCD组,
  技能运行数据类型,
} from '../../通用/通用框架/类型定义/技能'
export type { Buff枚举, BuffDTO, DotDTO } from '../../通用/通用框架/类型定义/Buff'
export type {
  技能释放记录数据,
  技能释放记录结果,
  技能GCD组,
  技能运行数据类型,
} from '../../通用/通用框架/类型定义/技能'

export interface 循环基础技能数据类型 extends 通用技能数据类型 {
  内力消耗?: number
  前置Buff?: string
  僵直时间?: number
  不吃加速?: boolean
  逍遥不替换GCD?: boolean
  触发GCD组?: string[]
  检测GCD组?: string[]
  读条时间?: number
}

export interface 角色状态信息类型 {
  体态: '常态' | '逍遥'
  内力: number
  醉意: number
}

export interface DOT待生效数据类型 {
  当前层数: number
  生效时间: number
  快照buff列表: string[]
}
export interface DOT运行数据类型 {
  待生效数据: DOT待生效数据类型[]
}
export interface ShowCycleSingleSkill extends 循环基础技能数据类型, Partial<技能释放记录数据> {
  index?: number
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
  当前DOT运行状态: Record<string, DOT运行数据类型>
  当前时间: number
  循环执行结果: '成功' | '异常'
  循环异常信息: { 异常索引?: number; 异常信息?: { 信息: string } }
  技能释放记录: 技能释放记录数据[]
  当前各技能运行状态: Record<string, 技能运行数据类型>
  当前GCD组: 技能GCD组
  技能基础数据: 循环基础技能数据类型[]
}

export interface 待生效事件 {
  事件时间: number
  事件名称: string
  事件备注?: {
    技能名称?: string
    伤害名称?: string
    伤害次数?: number
    技能等级?: number
    buff名称?: string
    buff对象?: '自身' | '目标'
    卸除层数?: number
    最后一跳?: boolean
  }
}

export type DOT列表 = Record<string, DOT运行数据类型>
export type { 额外信息类型 } from '../../通用/通用框架/类型定义/技能'

export interface 技能类实例集合 {
  坚冰?: 坚冰
  祭湘君?: 祭湘君
  苍龙戾天?: 苍龙戾天
  亢龙有悔?: 亢龙有悔
  天隼击?: 天隼击
  恶狗拦路?: 恶狗拦路
  拨狗朝天?: 拨狗朝天
  换行?: 换行
  时乘六龙?: 时乘六龙
  棒打狗头?: 棒打狗头
  横打双獒?: 横打双獒
  蛟龙翻江?: 蛟龙翻江
  双龙取水?: 双龙取水
  龙游天地?: 龙游天地
  龙腾五岳?: 龙腾五岳
  犬牙交错?: 犬牙交错
  狂龙乱舞?: 狂龙乱舞
  笑醉狂?: 笑醉狂
  自酌阑?: 自酌阑
  落水打狗?: 落水打狗
  蜀犬吠日?: 蜀犬吠日
  触发橙武?: 触发橙武
  酒中仙?: 酒中仙
  醉逍遥?: 醉逍遥
  龙啸九天?: 龙啸九天
  龙战于野?: 龙战于野
  龙跃于渊?: 龙跃于渊
  灼烧?: 灼烧
  特效腰坠?: 特效腰坠
}

export interface 检查运行数据实例类型 {
  技能运行数据: 技能运行数据类型
  更新技能运行数据: (新数据: Partial<技能运行数据类型>) => void
}
