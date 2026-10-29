import type { 原生规则 } from '../原生压缩/类型'

export interface 生成候选 {
  rules?: 原生规则[]
  partial_rules?: 原生规则[]
  expand_atoms?: string[]
  source?: string
  [字段: string]: any
}

export type 候选流 = Iterable<生成候选 | null>

export interface 候选来源 {
  strategy: string
  parent_hash?: string
  proposal_source?: string
  priority?: number
  [字段: string]: any
}
