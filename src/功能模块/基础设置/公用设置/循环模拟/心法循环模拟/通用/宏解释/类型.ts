export type 比较符 = '=' | '<' | '>' | '<=' | '>=' | '~='

export type 宏条件 =
  | { 类型: '且' | '或'; 左: 宏条件; 右: 宏条件 }
  | { 类型: '数值'; 字段: string; 比较: 比较符; 值: number | string }
  | { 类型: '充盈'; 字段: string }
  | {
      类型: '增益'
      对象: '自身' | '目标'
      名称: string
      同ID名称?: string[]
      比较: 比较符
      值: number
      时间: boolean
      取反: boolean
    }
  | { 类型: '上个技能'; 名称: string; 取反: boolean }
  | { 类型: '奇穴'; 名称: string; 取反: boolean }
  | {
      类型: '技能'
      名称: string
      字段: '冷却帧' | '充能'
      比较: 比较符
      值: number | 'max'
      充能技能?: boolean
    }

export interface 技能宏语句 {
  行号: number
  命令: 'cast' | 'fcast'
  技能: string
  条件?: 宏条件
  自动技能?: boolean
}

export type 宏语句 = 技能宏语句 | { 行号: number; 命令: 'mcast'; 宏: string; 条件?: 宏条件 }

export interface 宏定义 {
  名称: string
  文本: string
  模式: '单页' | '翻页'
}

export interface 宏配置 {
  页: { 体态?: number; 语句: 宏语句[] }[]
}

export interface 增益状态 {
  层数: number
  剩余帧: number
}

export interface 技能状态 {
  调息帧: number
  冷却帧: number
  阻塞帧: number
  充能: number
  最大充能?: number
  体态允许: boolean
}

export interface 宏状态 {
  时间: number
  每秒帧: number
  数值: Record<string, number>
  数值容差: Record<string, number>
  自身增益: Record<string, 增益状态>
  目标增益: Record<string, 增益状态>
  技能: Record<string, 技能状态>
  上个技能: string
  体态: number
  翻页体态?: number
  奇穴: string[]
  已有技能?: string[]
  读条?: { 技能: string; 结束帧: number }
}

export type 释放规则 =
  | { 类型: '资源'; 名称: string; 最低值: number }
  | { 类型: '增益'; 名称: string; 存在: boolean }
  | { 类型: '奇穴'; 名称: string }

export interface 心法说明 {
  名称: string
  图标库: { 名称: string; 图标: string }[]
  技能: string[]
  充能技能?: string[]
  调息查询技能?: string[]
  调息依赖?: Record<string, string[]>
  技能显示名称?: Record<string, string>
  数值字段: string[]
  小数字段: string[]
  充盈字段?: string[]
  未支持条件?: Record<string, string>
  支持打断?: boolean
  资源显示: Record<string, string>
  自动技能?: { 资源: string; 数值: number; 技能: string }[]
  自身增益: string[]
  目标增益: string[]
  增益ID?: Record<string, { 自身?: string[]; 目标?: string[] }>
  永久增益?: { 自身?: string[]; 目标?: string[] }
  无计时增益?: { 自身?: string[]; 目标?: string[] }
  禁用增益?: { 自身?: string[]; 目标?: string[] }
  隐藏增益?: { 自身?: string[]; 目标?: string[] }
  体态: number[]
  体态名称: Record<string, number>
  体态别名: Record<string, number>
  翻页体态?: Record<string, number>
  翻页示例?: string
  释放规则: Record<string, 释放规则[]>
  连招: Record<string, { 增益: string; 技能: string }[]>
  映射: {
    技能: Record<string, string>
    自身增益: Record<string, string>
    目标增益: Record<string, string>
    奇穴: Record<string, string>
    字段: Record<string, string>
    禁用体态: Record<string, string>
  }
  环境字段: Record<string, { 名称: string; 默认值: number; 最大值: number; 最小值?: number }>
  示例: string
}

export interface 释放轨迹 {
  序号: number
  行号: number
  技能: string
  自动技能?: boolean
  额外信息?: Record<string, number>
  时间: number
  决策前: 宏状态
  释放后: 宏状态
  诊断?: {
    决策序号: number
    决策时间: number
    来源: '宏' | '观察'
    释放计划?: 释放计划
    唤醒来源: 等待来源[]
    调度前?: 调度摘要
    调度后?: 调度摘要
  }
}

export interface 等待来源 {
  类型: '截止' | '轮询' | '技能阻塞' | '原生事件' | 'GCD' | '读条' | '条件' | '观察' | '宏限流'
  时间: number
  名称?: string
  剩余帧?: number
  浮点后继?: boolean
}

export interface 调度摘要 {
  时间: number
  GCD组: Record<string, number>
  充能时刻: Record<string, number[]>
  事件: { 名称: string; 时间: number; 技能?: string }[]
  增益: {
    对象: '自身' | '目标'
    名称: string
    层数: number
    刷新时间?: number
    失效时间?: number
  }[]
  引导?: { 技能: string; 结束帧: number; 跳时刻: number[] }
  依赖完整性: '部分'
}

export interface 释放计划 {
  技能: string
  实际技能: string
  决策时间: number
  释放时间: number
  自然就绪时间?: number
  GCD就绪时间?: number
  网络等待?: number
  依赖完整性: '部分' | '未知'
}

export interface 运行结束 {
  原因:
    | '正常终点'
    | '单次完成'
    | '观察停止'
    | '动作上限'
    | '执行步数上限'
    | '原生错误'
    | '事件不推进'
  起始帧: number
  目标截止帧: number
  最后决策帧: number
  原生最终帧: number
  决策区间已结束: boolean
  尾部已结算: boolean
  已提交动作数: number
  原始错误?: { 名称: string; 信息: string; 阶段: string }
}

export interface 宏运行结果 {
  轨迹: 释放轨迹[]
  最终状态: 宏状态
  日志: { 时间: number; 类型: string; 内容: string; 增益?: string[] }[]
  用时毫秒: number
  结束: 运行结束
}

export interface 心法运行接口 {
  说明: 心法说明
  奇穴: string[]
  获取状态: () => 宏状态
  可以释放技能?: (技能: string) => boolean
  获取实际技能名称?: (技能: string) => string
  获取技能释放时间?: (技能: string) => number
  获取释放计划?: (技能: string) => 释放计划 | undefined
  获取调度摘要?: () => 调度摘要
  推进时间: (时间: number) => void
  下个事件时间: () => number
  获取事件来源?: () => 等待来源[]
  释放技能: (技能: string) => Record<string, number> | void
  结束读条: (中断: boolean) => Record<string, number> | undefined
  获取日志: () => 宏运行结果['日志']
  获取引导跳时刻?: () => number[]
  获取主动等待?: (输入: string[], 索引: number) => number
  读取循环输入?: (输入: string[]) => Pick<import('./生成/类型').目标动作, '技能' | '作用次数'>[]
  获取循环记录?: () => import('./生成/类型').教师结果
  观察未来状态?: <T>(时间: number, 观察: (状态: 宏状态) => T) => T
}

export interface 宏面板属性 {
  更新生成状态: (id: string, 状态: '运行' | '暂停' | '空闲') => void
  展示: boolean
  关闭: () => void
  心法: string
  模拟参数: Record<string, unknown>
  当前循环: string[]
  配置: import('./工具/配置存储').保存的宏
  更新配置: (
    宏: import('./工具/配置存储').保存的宏,
  ) => { 成功: true } | { 成功: false; 错误: string }
  清空循环: () => void
  删除: () => void
  执行: () => void
  停止: () => void
  运行中: boolean
  错误: string
}

export interface 宏任务 {
  类型: '说明' | '运行' | '教师' | '观察'
  心法: string
  参数: Record<string, unknown>
  文本?: string
  秒数?: number
  气血比例?: number
  环境?: Record<string, number>
  当前循环?: string[]
  单次?: boolean
  上个技能?: string
  宏列表?: 宏定义[]
  随机种子?: number
  观察目标?: import('./生成/类型').教师结果
  观察动作?: import('./生成/类型').生成动作[]
  强制教师?: boolean
  观察条件?: string[]
  时间容差?: number
  分歧停止?: boolean
  观察截止?: number
  观察释放窗口?: boolean
  仅比较回放?: boolean
}

export type 宏任务回复 =
  | {
      成功: true
      说明: 心法说明
      耗时?: {
        初始化毫秒: number
        模拟毫秒: number
        线程启动毫秒?: number
        传输及调度毫秒?: number
        总耗时毫秒?: number
      }
      结果?: 宏运行结果
      教师?: import('./生成/类型').教师结果
      观察?: import('./生成/类型').回放观察
    }
  | {
      成功: false
      错误: string
      类型?: 'candidate_rejected' | 'fatal_error' | 'cancelled' | 'resource_exhausted'
      原始错误?: { name: string; message: string; stack?: string }
    }
