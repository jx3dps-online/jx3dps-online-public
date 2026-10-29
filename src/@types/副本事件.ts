/**
 * 副本事件相关类型定义
 * 用于副本事件编辑器：定义事件模板、时间轴实例、可保存的方案
 */

export type 副本事件类型 = '团队增益' | '副本机制'

// 阶段：一个事件命中后按顺序依次生效的 buff 段
export interface 副本事件阶段类型 {
  阶段名称: string // '一鼓' / '二鼓' / 普通事件同事件名
  关联Buff: string // 实际计算 buff 名，命中即输出（如 '号令三军_快照_一鼓'）
  持续时间: number // 帧
}

// 事件定义（模板，来自 JSON，配置驱动）
export interface 副本事件定义类型 {
  事件名称: string
  事件类型: 副本事件类型
  可重复: boolean // false=一次性，自动填充只加 1 次
  默认CD: number // 帧，一次性=-1；语义=两次释放开始之间的间隔
  默认参与: boolean // 是否参与「重置为默认填充」；后续 boss 单独增益可设为 false
  支持拖拽边缘: boolean // 是否支持拖动左右边缘调整持续时间；false 则只能整体移动
  颜色: string // 时间轴滑块 / 图例显示颜色（在事件定义中配置）
  图标: string
  描述?: string
  来源?: string
  阶段列表: 副本事件阶段类型[] // 普通事件 1 阶段；号令三军=[一鼓,二鼓]
}

// 时间轴上的一个实例（自包含，导出/导入不依赖定义 JSON）
export interface 副本事件实例类型 {
  id: string // uuid
  事件名称: string
  释放时间: number // 帧
  阶段列表: 副本事件阶段类型[] // 总持续时间 = Σ阶段.持续时间
}

// 一个可保存方案
export interface 副本事件方案类型 {
  方案名称: string
  总时间: number // 帧
  事件实例列表: 副本事件实例类型[]
  版本: string
  创建时间?: number
  备注?: string
}
