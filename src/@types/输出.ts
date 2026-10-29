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

export interface 技能统计数据类型 extends 计算结果技能列表类型 {
  伤害分段?: 计算结果技能列表类型[]
}

export type 技能统计处理函数 = (
  技能列表: 技能统计数据类型[],
  原始技能列表: 计算结果技能列表类型[],
  合并同名技能: boolean,
) => 技能统计数据类型[]
