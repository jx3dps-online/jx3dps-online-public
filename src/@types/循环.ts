import { 选中秘籍信息 } from './秘籍'

export interface 循环数据 {
  /**
   * @name 名称
   * 循环名称，唯一KEY
   */
  名称: string
  /**
   * @name 标题
   * 循环标题，用作展示显示循环名，可以不唯一
   */
  标题?: string
  /**
   * @name 备注
   * 用作展示循环的备注
   */
  备注?: string
  /**
   * @name 标提供者题
   * 用作展示循环的来源，提供者
   */
  提供者?: string
  /**
   * @name 类型
   * 循环类型
   * 默认 | 自定义
   */
  类型: string
  /**
   * @name 标记
   * 循环标记，用作辅助性类别区分
   */
  标记?: string
  /**
   * @name 强制加速要求
   * 开启后如果未命中加速将不会反回默认值
   */
  强制加速要求?: boolean
  /**
   * @name 奇穴
   * 循环默认奇穴信息
   */
  奇穴: string[]
  /**
   * @name 秘籍
   * 循环默认秘籍信息
   */
  秘籍?: 选中秘籍信息
  /**
   * @name 循环详情
   */
  循环详情: 循环详情[]
  /**
   * @name 额外配置信息
   * 部分职业的额外需要保存的数据
   * 例：万灵宠物顺序
   */
  额外配置信息?: {
    [key: string]: any
  }
  /**
   * @name 用于模拟器的技能序列
   */
  技能序列?: string[]
  /**
   * @name 用于模拟器的技能序列（一个循环有多个合并的时候）
   */
  多挡位序列?: {
    [key: string]: string[]
  }
  /**
   * @name 起手Buff配置
   */
  起手Buff配置?: any
  /**
   * @name 攻略key
   * @description 关联的攻略模块 key，命中后将在攻略模块展示对应攻略内容
   */
  攻略key?: string
}

export interface 循环详情 {
  /**
   * @name 覆盖率
   * 用作循环部分数据的覆盖率
   */
  覆盖率?: { [key: string]: number }
  /**
   * @name 秘籍
   * 循环默认秘籍信息
   */
  秘籍?: 选中秘籍信息
  /**
   * 循环加速值-加速值要求
   */
  循环加速值范围?: number[] | string[]
  /**
   * 循环加速等级-加速档位要求
   */
  循环加速等级?: number | string
  /**
   * 循环延迟要求
   */
  循环延迟要求?: number | string
  /**
   * @name 模拟器快照秒伤
   * 保存自定义循环时，该加速/延迟档位计算出的秒伤
   */
  模拟器快照秒伤?: number
  /**
   * @name 计算战斗时间
   * 单位（秒）
   */
  战斗时间: number
  /**
   * @name 技能详情
   */
  技能详情: 循环技能详情[]
  /**
   * 支持伤害校验
   */
  支持伤害校验?: boolean
}

export interface 循环技能详情 {
  /**
   * @name 技能名称
   * 代表用于计算的技能名称，需要和系数中的名称一致
   */
  技能名称: string
  /**
   * @name 技能等级
   * 该技能在循环中的总数量
   */
  技能等级?: number
  /**
   * @name 伤害层数
   * 该技能的伤害层数，常用于DOT多层时的计算
   */
  伤害层数?: number
  /**
   * @name DOT跳数
   * 该DOT的生效跳数，用于部分DOT的系数变化
   */
  DOT跳数?: number
  /**
   * @name 技能数量
   * 该技能在循环中的总数量
   */
  技能数量: number
  /**
   * @name 技能增益列表
   * 该技能携带的增益列表
   */
  技能增益列表?: 技能增益列表数据[]
}

export interface 技能增益列表数据 {
  /**
   * @name 增益名称
   * 当该技能存在多个增益时，用逗号(,)隔开
   */
  增益名称: string
  /**
   * @name 增益技能数
   * 代表该技能携带上方增益的总数量
   * 注意，整个技能增益列表中的增益技能数的和事小于上层的技能数量的
   */
  增益技能数: number
  /**
   * @name 伤害数据
   * 由JCL解析生成的伤害数据
   */
  伤害数据?: 伤害数据类型
}

export interface 伤害数据类型 {
  命中伤害?: number | null
  会心伤害?: number | null
  会心率?: number
  期望伤害?: number
}
