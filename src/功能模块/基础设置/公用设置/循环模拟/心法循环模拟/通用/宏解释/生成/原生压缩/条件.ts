import { 空位图, 一位图 } from './类型'
import type { 原生条件, 条件连接, 原生动作, 原生规则 } from './类型'

export const 位图交 = (左: bigint, 右: bigint) => 左 & 右
export const 位图并 = (左: bigint, 右: bigint) => 左 | 右
export const 位图差 = (左: bigint, 右: bigint) => 左 & ~右
export const 位图非空 = (值: bigint) => 值 !== 空位图
export const 位图相等 = (左: bigint, 右: bigint) => 左 === 右

const 十六进制位数 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4]
export function 位数统计(值: bigint): number {
  let 数量 = 0
  const 字符 = 值.toString(16)
  for (let 位置 = 0; 位置 < 字符.length; 位置++) {
    const 码 = 字符.charCodeAt(位置)
    数量 += 十六进制位数[码 < 58 ? 码 - 48 : 码 - 87]
  }
  return 数量
}

export const 最低位索引 = (值: bigint) => (值 & -值).toString(2).length - 1

export function 规范规则(规则: 原生条件): { atoms: number[]; ops: 条件连接[] } {
  const 原子 = 规则.atoms.slice()
  let 连接: 条件连接[]
  if (规则.ops !== undefined) 连接 = 规则.ops.slice()
  else {
    const 尾部 = 规则.any_atoms || []
    连接 = Array<条件连接>(Math.max(0, 原子.length - 1)).fill('&')
    if (尾部.length) {
      if (原子.length) 连接.push('&')
      原子.push(...尾部)
      连接.push(...Array<条件连接>(尾部.length - 1).fill('|'))
    }
  }
  if (连接.length !== Math.max(0, 原子.length - 1) || 连接.some((值) => 值 !== '&' && 值 !== '|')) {
    throw new Error('每个原生条件之间必须有且只有一个 & 或 |')
  }
  return { atoms: 原子, ops: 连接 }
}

export function 条件键(规则: 原生条件): string {
  const 条件 = 规范规则(规则)
  return 条件.atoms.join(',') + ':' + 条件.ops.join('')
}

export const 纯与条件 = (规则: 原生条件) => 规范规则(规则).ops.every((操作) => 操作 === '&')

export function 条件位图(规则: 原生条件, 真值: readonly bigint[], 全部: bigint): bigint {
  const { atoms: 原子, ops: 操作 } = 规范规则(规则)
  if (!原子.length) return 全部
  let 结果 = 真值[原子[原子.length - 1]] & 全部
  // 原生宏右结合：A&B|C 为 A&(B|C)，不能按通用布尔优先级重排。
  for (let 位置 = 操作.length - 1; 位置 >= 0; 位置--) {
    const 叶 = 真值[原子[位置]] & 全部
    结果 = 操作[位置] === '&' ? 叶 & 结果 : 叶 | 结果
  }
  return 结果 & 全部
}

export function 条件字数(规则: 原生条件, 字数: readonly number[]): number {
  const 条件 = 规范规则(规则)
  return 条件.atoms.length
    ? 1 + 条件.ops.length + 条件.atoms.reduce((总数, 位置) => 总数 + 字数[位置], 0)
    : 0
}

export function 条件文本(规则: 原生条件, 原子: readonly string[]): string {
  const 条件 = 规范规则(规则)
  if (!条件.atoms.length) return ''
  return (
    原子[条件.atoms[0]] + 条件.ops.map((操作, 位置) => 操作 + 原子[条件.atoms[位置 + 1]]).join('')
  )
}

export function 规则文本(
  规则: readonly 原生规则[],
  原子: readonly string[],
  动作: readonly 原生动作[],
  空宏?: string,
): string {
  if (!规则.length) {
    if (!空宏) throw new Error('场景没有提供空程序的实际宏文本')
    return 空宏
  }
  return 规则
    .map((行) => {
      const 技能 = 动作[行.action]
      const 条件 = 条件文本(行, 原子)
      return '/' + (技能.fcast ? 'fcast' : 'cast') + ' ' + (条件 ? 条件 + ' ' : '') + 技能.name
    })
    .join('\n')
}

export interface 条件样本 {
  all: bigint
  truth: readonly bigint[]
  atoms: readonly string[]
  atom_costs: readonly number[]
  catalog?: { clock: ReadonlySet<number> }
  check: () => void
}

export function* 更短叶子(
  规则: 原生条件,
  正例: bigint,
  负例: bigint,
  样本: 条件样本,
  选项: { equalCost?: boolean } = {},
): Generator<原生条件> {
  const { atoms: 原子, ops: 操作 } = 规范规则(规则)
  if (!原子.length || !正例) return
  const { all: 全部, truth: 真值 } = 样本
  const 后缀 = Array<bigint>(原子.length).fill(空位图)
  后缀[后缀.length - 1] = 真值[原子[原子.length - 1]] & 全部
  for (let 位置 = 原子.length - 2; 位置 >= 0; 位置--) {
    后缀[位置] =
      (操作[位置] === '&' ? 真值[原子[位置]] & 后缀[位置 + 1] : 真值[原子[位置]] | 后缀[位置 + 1]) &
      全部
  }
  for (let 位置 = 0; 位置 < 原子.length; 位置++) {
    样本.check()
    let 零 = 空位图,
      一 = 全部
    if (位置 < 操作.length) {
      if (操作[位置] === '&') 一 = 后缀[位置 + 1]
      else 零 = 后缀[位置 + 1]
    }
    for (let 前面 = 位置 - 1; 前面 >= 0; 前面--) {
      if (操作[前面] === '&') {
        零 &= 真值[原子[前面]]
        一 &= 真值[原子[前面]]
      } else {
        零 |= 真值[原子[前面]]
        一 |= 真值[原子[前面]]
      }
    }
    if (正例 & ~一 || 负例 & 零) continue
    const 必须 = 正例 & ~零,
      禁止 = 负例 & 一
    for (let 替换 = 0; 替换 < 真值.length; 替换++) {
      样本.check()
      const 更优 = 选项.equalCost
        ? 样本.atom_costs[替换] === 样本.atom_costs[原子[位置]]
        : 样本.atom_costs[替换] < 样本.atom_costs[原子[位置]]
      if (!更优 || 原子.includes(替换) || 必须 & ~真值[替换] || 禁止 & 真值[替换]) continue
      const 复制 = 原子.slice()
      复制[位置] = 替换
      yield { atoms: 复制, ops: 操作.slice() }
    }
  }
}

export function 位图行(索引: number): bigint {
  return 一位图 << BigInt(索引)
}
