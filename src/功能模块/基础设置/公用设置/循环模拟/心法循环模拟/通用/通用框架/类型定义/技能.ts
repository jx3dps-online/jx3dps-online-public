// 将一个技能从释放到释放结束的各阶段定义类型
export interface 技能类类型 {
  /**
   * @name 初始化
   * @description 技能释放前初始化技能信息
   */
  初始化?: () => void
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

export interface 技能GCD组 {
  [key: string]: number
  // 公共?: number
  // 自身?: number
}

export interface 技能运行数据类型 {
  // 这里注意，如果为多层充能技能，这里的时间代表充能到下一层所需要的时间
  // 当前层数: number
  待充能时间点: number[]
}

export interface 检查运行数据实例类型 {
  技能运行数据: 技能运行数据类型
  更新技能运行数据: (新数据: Partial<技能运行数据类型>) => void
}

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
  技能类型: string
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
  技能GCD组?: string
  /**
   * 最大充能层数
   */
  最大充能层数?: number
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
   * 延迟补偿
   * 倒读条技能有延迟补偿，不计算延迟
   */
  延迟补偿?: boolean
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
   * 额外信息
   */
  技能原始名称?: string
  可中断倒读条最大跳数?: number
}

export interface 额外信息类型 {
  延迟?: number | 'GCD'
  作用次数?: number
}

// 用来显示的循环技能类型类型
export interface 显示循环技能类型 extends 循环基础技能数据类型, 技能释放记录数据 {
  /**
   * 开始读条时间
   */
  开始读条时间?: number
  /**
   * index
   */
  index?: number // 总技能序列索引
}

export interface 技能释放记录数据 {
  技能名称: string
  计划释放时间: number
  实际释放时间: number
  是否为读条技能: boolean
  开始读条时间?: number
  技能释放记录结果: 技能释放记录结果
  实际图标?: string
}

export interface 技能释放记录结果 {
  实际伤害技能?: string // 针对造成伤害的实际名称
  实际图标?: string
  伤害段数?: number // 针对行、沧的实际伤害段数
  重要buff列表?: string[] // 影响技能结果的重要buff列表
  特殊标记?: number
  造成buff数据?: {
    // 针对吃影子、灭这种会添加有益buff的情况
    buff名称: string
    buff开始时间: number
    buff结束时间: number
  }
}
