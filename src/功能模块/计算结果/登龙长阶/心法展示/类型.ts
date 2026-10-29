/** 每个心法可替换整个成长区域。只接收展示数据，不自行存储计划或改变计算口径。 */
export interface 登阶成长展示属性 {
  心法: string
  目标名称: string
  /** 目标循环显示名：目标侧计算口径的循环基准 */
  目标循环显示名?: string
  当前名称: string
  更新时间: number
  完成数: number
  总数: number
  忙碌: boolean
  本程提升?: number
  /** 加权完成度 0–100；当前 / 目标 DPS 有任一方待评估时共享层传 0，并由共享层保证不放行「达成」 */
  完成度: number
  是否达成: boolean
}
