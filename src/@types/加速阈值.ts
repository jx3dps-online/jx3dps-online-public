export interface 加速阈值配置 {
  标识: string
  名称: string
  主要?: boolean
  类型?: '公共调息' | '持续' | '技能CD' | 'Buff' | '倒读条'
  原始帧数: number
  计算方式?: '单段' | '周期' | '倒读条'
  作用次数?: number
  单次作用间隔?: number
  额外加速值?: number
  郭氏加速等级?: number
  郭氏不受限加速?: number
  备注?: string
}

export interface 加速阈值结果 {
  标识: string
  加速档位: number
  加速值: number
  下一加速值: number
  实际帧数: number
  单次帧数?: number
  作用分布?: number[]
}

export interface 加速阈值分组 {
  配置: 加速阈值配置
  标准GCD: boolean
  档位: 加速阈值结果[]
}
