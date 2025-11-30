export interface 当前计算结果类型 {
  /**
   * @name 当前计算结果显示的秒伤
   */
  秒伤: number
  /**
   * @name 当前计算结果显示的总伤
   */
  总伤: number
  /**
   * @name 秒伤计算时间
   */
  秒伤计算时间: number
  /**
   * @name 计算结果技能列表
   */
  计算结果技能列表: 计算结果技能列表类型[]
}

// 结果列表类型
export interface 计算结果技能列表类型 {
  统计名称?: string
  显示名称?: string
  技能名称: string
  技能数量: number
  技能等级?: string
  技能ID?: string | number
  伤害层数?: number
  技能总输出: number
  会心几率?: number
  总会心个数?: number
  技能最终详情?: any
}
