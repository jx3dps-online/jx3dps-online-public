import type { 心法说明, 释放规则 } from '../类型'

export interface 冷却绑定 {
  GCD组?: string[]
  技能?: string[]
  时间字段?: { 名称: string; 间隔帧: number }
}

export interface 心法耦合表 {
  名称: string
  技能: Record<string, string>
  奇穴?: Record<string, string>
  增益ID?: Record<string, { 自身?: string[]; 目标?: string[] }>
  永久增益?: 心法说明['永久增益']
  禁用增益?: 心法说明['禁用增益']
  隐藏增益?: 心法说明['隐藏增益']
  自身增益: Record<string, string>
  目标增益: Record<string, string>
  增益体态: Record<string, number>
  状态增益别名: Record<string, { 奇穴: string; 名称: string }>
  增益层数来源?: Record<string, { 名称: string; 层数: number }[]>
  增益资源来源?: Record<string, { 路径: string; 奇穴?: string }>
  DOT: string[]
  字段: Record<string, string>
  资源: Record<string, string>
  资源倍率?: Record<string, number>
  资源读取规则?: Record<
    string,
    {
      路径: string
      类型: '位掩码' | '数组计数' | '数组位掩码' | '真值计数' | '布尔' | '阈值'
      位权?: Record<string, number>
      字段?: string
      取值?: string[]
      最低值?: number
    }
  >
  排除技能?: string[]
  沿用技能?: boolean
  小数字段?: string[]
  充盈字段?: string[]
  未支持条件?: Record<string, string>
  技能充能?: Record<string, { 路径: string; 最大值: number }>
  技能状态来源?: Record<string, string>
  公共GCD组?: string[]
  冷却绑定?: Record<string, 冷却绑定>
  调息查询?: Record<string, 冷却绑定>
  动作候选?: Record<string, string[]>
  体态字段: string
  体态别名: Record<string, number>
  体态名称: Record<string, number>
  翻页体态?: Record<string, number>
  翻页体态映射?: Record<number, number>
  翻页示例?: string
  禁用体态: Record<string, string>
  环境字段: 心法说明['环境字段']
  资源显示: Record<string, string>
  自动技能?: 心法说明['自动技能']
  补充规则: Record<string, 释放规则[]>
  连招: 心法说明['连招']
  资源下限字段: Record<string, string[]>
  引导: Record<
    string,
    {
      次数字段: string
      最少回填跳数: number
      事件名称标记: string
      回填失败提示: string
    }
  >
  示例: string
}

export interface 原技能数据 {
  技能名称: string
  技能原始名称?: string
  图标?: string
  最大充能层数?: number
  技能GCD组?: string
  检测GCD组?: string[]
  触发GCD组?: string[]
  释放依赖Buff?: string[]
  Buff存在不可释放?: string[]
  显示类型?: string
  依赖奇穴名?: string
}

export interface 原增益数据 {
  名称: string
  图标?: string
  类型: string
  当前层数?: number
  最大持续时间?: number
  延长时间?: number
  刷新时间?: number
}

export interface 原技能实例 {
  constructor: Record<string, number | undefined>
  技能运行数据?: { 待充能时间点?: number[] }
  DOT运行数据?: { 当前层数?: number; 待生效数据: { 生效时间: number; 当前层数?: number }[] }
  统一初始化: (额外信息?: Record<string, number | 'GCD'>) => void
  释放前初始化?: (额外信息?: Record<string, number | 'GCD'>) => void
  检查GCD?: (...参数: any[]) => number
  获取读条时间?: (索引: number) => number
  读条?: (开始时间: number) => void
  命中?: (是否命中: boolean, 索引: number) => void
  造成伤害?: (索引: number, 循环: string[]) => void
  保存释放记录: (名称: string) => void
  释放后?: () => void
}

// 原引擎保留其类型；仅在心法接入边界适配宏会使用的字段和生命周期。
export interface 原模拟器接口 {
  奇穴: string[]
  技能基础数据: 原技能数据[]
  技能类实例集合: Record<string, 原技能实例>
  Buff和Dot数据: Record<string, 原增益数据>
  当前自身buff列表: Record<string, 原增益数据>
  当前目标buff列表: Record<string, 原增益数据>
  角色状态信息: Record<string, unknown>
  当前时间: number
  GCD组: Record<string, number>
  网络延迟: number
  忽略延迟技能?: string[]
  周期性忽略延迟?: number
  技能释放记录: unknown[]
  测试循环: string[]
  待生效事件队列: {
    事件时间: number
    事件名称: string
    事件备注?: { 技能名称?: string }
  }[]
  战斗日志: {
    日志时间?: number
    日志类型?: string
    日志: string
    buff列表?: string[]
  }[]
  技能释放前检查GCD统一方法: (技能: 原技能数据) => number
  检查GCD?: (技能: 原技能数据, 实例: 原技能实例, 索引: number) => number
  技能成功开始释放: (技能: 原技能数据, 实例: 原技能实例) => void
  技能释放校验: (实例: 原技能实例, 技能: 原技能数据) => { 可以释放: boolean }
  清空已经消失的buff: () => void
  待生效事件结算: (时间: number) => void
  增加时间: (帧数: number) => void
  本轮模拟开始前: () => void
  本轮模拟结束后: () => void
  日志排序: () => void
}

export interface 引擎接入 {
  模拟: 原模拟器接口
  读取特殊资源?: () => Record<string, number>
  体态允许: (技能名称: string) => boolean
}

export interface 原生模拟器 extends 原模拟器接口 {
  模拟: (起始索引?: number) => void
  添加战斗日志: (日志: 原模拟器接口['战斗日志'][number]) => void
  循环执行结果: string
  循环异常信息: { 异常索引?: number; 异常信息?: string | { 信息?: string } }
  技能释放记录: {
    技能名称: string
    实际释放时间: number
    开始读条时间?: number
    是否为读条技能?: boolean
    技能释放记录结果?: { 特殊标记?: number }
  }[]
  技能释放前: (...参数: unknown[]) => {
    技能计划释放时间: number
    技能预估释放时间: number
    等待CD: number
  }
}

export interface 原生特殊规则 {
  预检浅恢复?: {
    实例原型: Partial<
      Record<'统一初始化' | '释放前初始化' | '检查GCD', (...参数: any[]) => unknown>
    >
    GCD例外?: readonly NonNullable<原技能实例['检查GCD']>[]
  }
  // 可选资格路径：按原模拟器顺序执行初始化、时间/CD 处理及校验，不执行命中效果。
  // 调用方优先在隔离副本查询；不能隔离的分支恢复完整快照。
  // 仅接入已核对无随机调用、无快照外写入的生命周期。
  // 原模拟器释放流程变化时须同步核对；未声明的心法保持完整原生试放。
  // 单个动作尚未覆盖时返回 undefined，继续完整试放，不作为资格拒绝。
  查询释放?: (
    模拟: 原生模拟器,
    名称: string,
    索引: number,
    截止?: number,
  ) => { 可以释放: boolean; 时间: number } | undefined
  禁用原生续演?: boolean | ((奇穴: readonly string[]) => boolean)
  局部有效技能索引?: boolean
  释放计划依赖后续技能?: (实例: 原技能实例, 技能: 原技能数据) => boolean
  教师等待GCD技能?: readonly string[]
  加载构造器: () => Promise<(参数: Record<string, unknown>) => 原生模拟器>
  读取特殊资源?: (模拟: 原模拟器接口) => Record<string, number>
}

export type 原生读条记录 = Record<number, { 跳数?: number; 开始帧: number; 结束帧: number }>
