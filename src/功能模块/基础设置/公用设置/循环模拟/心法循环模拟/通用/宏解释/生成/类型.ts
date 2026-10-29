import type { 宏条件, 宏状态 } from '../类型'
import type { 回放比较 } from './结果校验'

export interface 目标动作 {
  技能: string
  时间: number
  决策时间?: number
  作用次数?: number
  持续帧?: number
}

export interface 教师结果 {
  动作: 目标动作[]
  截止时间: number
  每秒帧: number
  跳过技能?: string[]
}

export interface 生成动作 {
  技能: string
  命令: 'cast' | 'fcast'
}

export interface 观察记录 {
  状态: 宏状态
  决策序号: number
  决策动作: number | null
  决策模型: 'first_match' | 'unsupported'
  可执行: number[]
  允许: number[]
  必须释放: boolean
  游标: number
  等待状态: 'allowed' | 'forbidden' | 'unknown'
  等待依据: string
  等待作用域?: string
  释放期限?: number
  释放范围?: { earliest: number; latest: number }
  动作预测: {
    action: number
    status: 'known' | 'unknown'
    release_time?: number
    actual_skill?: string
    plan?: import('../类型').释放计划
  }[]
  决策见证: {
    time: number
    release_time: number
    action: number
    allowed: 'allowed' | 'forbidden' | 'unknown'
    clock_atoms?: number[]
    truth?: ArrayLike<number>
    executable?: ArrayLike<number>
  }[]
  未决动作: number[]
  唤醒来源?: import('../类型').等待来源[]
  调度状态?: import('../类型').调度摘要
  下次等待?: number
  固有等待?: number
  唤醒条件: number[]
  等待条件?: number[]
  拒绝动作: number[]
  释放窗口?: {
    时间: number
    时钟条件: number[]
    真值: ArrayLike<number>
    可执行: ArrayLike<number>
    允许: number[]
  }[]
}

export interface 回放观察 {
  最终状态: 宏状态
  记录: 观察记录[]
  动作: 目标动作[]
  完整: boolean
  匹配: number
  最大偏差: number
  首次分歧?: string
  轨迹: import('../类型').释放轨迹[]
  失败?: { index: number; kind: string; repair_index?: number; time?: number; deadline?: number }
  完整回放: boolean
  截断: boolean
  结束: import('../类型').运行结束
  观察耗时?: {
    动作查询: number
    允许预测: number
    动作预测: number
    等待条件: number
    等待未来状态: number
    释放窗口: number
  }
  时序诊断?: {
    首次漂移?: number
    最近时刻对齐?: number
    首次超容差?: number
    回溯起点: number
    状态已恢复: false
    依赖完整性: '部分'
  }
}

export interface 条件原子 {
  文本: string
  条件: 宏条件
  能力?: ReturnType<typeof import('../核心/条件能力').描述条件能力>
}

export interface 生成进度 {
  状态: '准备' | '生成' | '回放' | '压缩' | '成功' | '未完成' | '错误'
  轮数: number
  目标数: number
  匹配数: number
  宏: string
  说明: string
  最大偏差?: number
  首次分歧?: string
  容差?: number
  已认证?: boolean
  结束事实?: { 状态: string; 压缩停止?: string; 原因?: string; 最终校验?: string }
  认证?: {
    宏: string
    信封: import('./结果校验').回放信封
    期望: import('./结果校验').回放校验期望
  }
  起点已复核?: boolean
  最近回放?: { 轮数: number; 宏: string; 比较: 回放比较 }
  压缩诊断?: {
    阶段: string
    状态: '开始' | '结束'
    时间: string
    耗时毫秒?: number
  }[]
  压缩?: {
    初始字符: number
    最佳字符: number
    试算次数: number
    接受次数: number
  }
}

export interface 生成日志 {
  耗时毫秒: number
  消息: Record<string, unknown>
}

export interface 生成请求 {
  心法: string
  参数: Record<string, unknown>
  当前循环: string[]
  气血比例: number
  环境: Record<string, number>
  容差?: number
  随机种子?: number
  允许数字IDBuff?: boolean
}

export interface 生成起点 {
  宏: string
  轮数: number
  容差?: number
  阶段?: '生成' | '压缩'
}

export interface 生成任务 {
  请求: 生成请求
  起点?: 生成起点
}
