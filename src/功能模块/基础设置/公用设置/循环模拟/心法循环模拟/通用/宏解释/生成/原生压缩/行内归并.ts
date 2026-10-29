import type { 原生候选, 原生规则, 条件连接, 原生条件目录 } from './类型'
import { 规范规则 } from './条件'

interface 语义原子 {
  字段: string
  比较: string
  值: number
  层数?: readonly [number, number]
}

// 正向 Buff 判断只覆盖存在的正整数层数；不存在不属于数值 0。
function 读取语义(文本: string): 语义原子 | undefined {
  const 匹配 = /^(.*?)(>=|<=|~=|=|>|<)([+-]?\d+(?:\.\d+)?)$/.exec(文本)
  const 存在 = /^t?buff:[^<>=~]+$/.test(文本)
  if (!匹配 && !存在) return undefined
  const 字段 = 匹配?.[1] ?? 文本
  const 比较 = 匹配?.[2] ?? ''
  const 值 = 匹配 ? Number(匹配[3]) : 0
  let 层数: readonly [number, number] | undefined
  if (/^t?buff:/.test(字段)) {
    if (!比较) 层数 = [1, Infinity]
    else if (比较 === '=' && Number.isInteger(值)) 层数 = [值, 值]
    else if (比较 === '<') 层数 = [1, Math.ceil(值) - 1]
    else if (比较 === '<=') 层数 = [1, Math.floor(值)]
    else if (比较 === '>') 层数 = [Math.floor(值) + 1, Infinity]
    else if (比较 === '>=') 层数 = [Math.ceil(值), Infinity]
    if (层数) {
      层数 = [Math.max(1, 层数[0]), 层数[1]]
      if (层数[0] > 层数[1]) 层数 = undefined
    }
  }
  return { 字段, 比较, 值, 层数 }
}

export function 创建行内归并(
  原子: readonly string[],
  检查: () => void,
  元信息?: 原生条件目录['metadata'],
) {
  const 语义 = 原子.map(读取语义)
  const 目录 = new Map<string, number[]>()
  语义.forEach((项, 索引) => {
    if (!项) return
    const 组 = 目录.get(项.字段) ?? []
    组.push(索引)
    目录.set(项.字段, 组)
  })

  function 归并组(叶: number[], 操作: 条件连接): number[] {
    let 结果 = [...new Set(叶)]
    for (const 字段 of new Set(结果.map((索引) => 语义[索引]?.字段))) {
      检查()
      if (字段 === undefined) continue
      const 同字段 = 结果.filter((索引) => 语义[索引]?.字段 === 字段)
      // 同一种不等式有包含关系，浮点容差和同 ID 多实体均不影响该关系。
      for (const 比较 of ['<', '<=', '>', '>=']) {
        const 同比较 = 同字段.filter((索引) => 语义[索引]!.比较 === 比较)
        if (同比较.length < 2) continue
        const 取大 = (操作 === '|') === 比较.startsWith('<')
        const 保留 = 同比较.reduce((左, 右) =>
          (取大 ? 语义[左]!.值 > 语义[右]!.值 : 语义[左]!.值 < 语义[右]!.值) ? 左 : 右,
        )
        结果 = 结果.filter((索引) => !同比较.includes(索引) || 索引 === 保留)
      }
      const 层数叶 = 结果.filter((索引) => 语义[索引]?.字段 === 字段 && 语义[索引]?.层数)
      if (!层数叶.length) continue
      // 多实体 some(A)&some(B) 不能改成 some(A&B)。数字 ID 未提供实体信息时保留 AND。
      if (
        操作 === '&' &&
        层数叶.some((索引) =>
          元信息?.[索引]?.read_dependencies
            ? 元信息[索引].read_dependencies!.length !== 1
            : /^t?buff:\d+$/.test(字段),
        )
      )
        continue
      const 区间 = 层数叶
        .map((索引) => 语义[索引]!.层数!)
        .sort((左, 右) => 左[0] - 右[0] || 左[1] - 右[1])
      let 下限 = 区间[0][0],
        上限 = 区间[0][1],
        连续 = true
      for (const [左, 右] of 区间.slice(1)) {
        if (操作 === '&') {
          下限 = Math.max(下限, 左)
          上限 = Math.min(上限, 右)
        } else {
          if (左 > 上限 + 1) 连续 = false
          上限 = Math.max(上限, 右)
        }
      }
      if (!连续 || 下限 > 上限) continue
      const 替换 = 目录
        .get(字段)!
        .filter((索引) => 语义[索引]?.层数?.[0] === 下限 && 语义[索引]?.层数?.[1] === 上限)
        .sort((左, 右) => 原子[左].length - 原子[右].length || 左 - 右)[0]
      if (
        替换 === undefined ||
        原子[替换].length >= 层数叶.reduce((和, 索引) => 和 + 原子[索引].length, 层数叶.length - 1)
      )
        continue
      const 首位 = 结果.indexOf(层数叶[0])
      结果 = 结果.filter((索引) => !层数叶.includes(索引))
      结果.splice(首位, 0, 替换)
    }
    return 结果
  }

  return function* 行内语义归并(规则: 原生规则[]): Generator<原生候选> {
    const 提案: 原生规则[] = []
    const 改动: number[] = []
    for (const [索引, 行] of 规则.entries()) {
      检查()
      const 条件 = 规范规则(行)
      let 变化 = true
      while (变化) {
        变化 = false
        // 吸收律：A|(A&R)、A&(A|R) 均为 A；R 可以继续是右结合子树。
        for (let 位 = 条件.ops.length - 2; 位 >= 0; 位--) {
          if (条件.ops[位] === 条件.ops[位 + 1]) continue
          let 尾 = 位 + 1
          while (尾 < 条件.ops.length && 条件.ops[尾] === 条件.ops[位 + 1]) 尾++
          const 叶尾 = 尾 === 条件.ops.length ? 尾 + 1 : 尾
          if (条件.atoms.slice(位 + 1, 叶尾).includes(条件.atoms[位])) {
            条件.atoms.length = 位 + 1
            条件.ops.length = 位
            变化 = true
          }
        }
        // A&B|C 是 A&(B|C)：同连接符的一段只能归并原子前缀，不能拆开右侧异类子树。
        for (let 结束 = 条件.ops.length; 结束 > 0; ) {
          const 操作 = 条件.ops[结束 - 1]
          let 开始 = 结束 - 1
          while (开始 > 0 && 条件.ops[开始 - 1] === 操作) 开始--
          const 叶结束 = 结束 === 条件.ops.length ? 结束 + 1 : 结束
          const 叶 = 条件.atoms.slice(开始, 叶结束)
          const 归并 = 归并组(叶, 操作)
          if (归并.length !== 叶.length || 归并.some((原子, 位) => 原子 !== 叶[位])) {
            条件.atoms.splice(开始, 叶.length, ...归并)
            条件.ops.splice(开始, 叶.length - 归并.length)
            变化 = true
          }
          结束 = 开始
        }
      }
      const 原条件 = 规范规则(行)
      if (
        条件.atoms.length !== 原条件.atoms.length ||
        条件.atoms.some((原子, 位) => 原子 !== 原条件.atoms[位])
      )
        改动.push(索引)
      提案.push({ action: 行.action, ...条件 })
    }
    if (!改动.length) return
    yield ['merge_inline_semantic', 提案]
    if (改动.length > 1)
      for (const 索引 of 改动) {
        检查()
        yield ['merge_inline_semantic', 规则.map((行, 位) => (位 === 索引 ? 提案[位] : 行))]
      }
  }
}
