export type 位图 = bigint
export type 条件连接 = '&' | '|'

export interface 原生条件 {
  atoms: number[]
  ops?: 条件连接[]
  any_atoms?: number[]
}

export interface 原生规则 extends 原生条件 {
  action: number
}

export interface 原生动作 {
  name: string
  fcast?: boolean
  skill_id?: string | number
  [字段: string]: unknown
}

export interface 原子元信息 {
  atom_id: string
  kind?: string
  entity?: unknown
  read_dependencies?: readonly string[]
  wake_dependencies?: readonly string[]
  [字段: string]: unknown
}

export interface 决策见证 {
  time: number
  cursor?: number
  action: number
  allowed: boolean | 'allowed' | 'forbidden' | 'unknown'
  truth?: ArrayLike<number | boolean>
  executable?: ArrayLike<number | boolean>
  clock_atoms?: readonly number[]
}

export interface 释放窗口 {
  time: number
  allowed: readonly number[]
  truth?: ArrayLike<number | boolean>
  executable?: ArrayLike<number | boolean>
  clock_atoms?: readonly number[]
}

export interface 原生观察行 {
  time: number
  cursor?: number
  truth: ArrayLike<number | boolean>
  executable: ArrayLike<number | boolean>
  allowed?: readonly number[]
  rejected_actions?: readonly number[]
  unknown_actions?: readonly number[]
  wait_status: 'allowed' | 'forbidden' | 'unknown'
  wait_clock_atoms?: readonly number[]
  wait_next_time?: number | null
  decision_latest?: number | null
  decision_witnesses?: readonly 决策见证[]
  release_windows?: readonly 释放窗口[]
  projection_parent?: number | null
  projection_clock_atoms?: readonly number[]
  [字段: string]: unknown
}

export interface 样本来源 {
  conditional_guide?: boolean
  [字段: string]: unknown
}

export interface 原生条件目录 {
  atoms: readonly string[]
  actions: readonly 原生动作[]
  metadata?: readonly 原子元信息[]
  clock: ReadonlySet<number>
  empty_macro?: string
}

export type 原生候选 = readonly [string, 原生规则[]]

export const 空位图 = BigInt(0)
export const 一位图 = BigInt(1)
