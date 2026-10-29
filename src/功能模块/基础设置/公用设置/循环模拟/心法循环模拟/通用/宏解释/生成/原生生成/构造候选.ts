import { 原生样本 } from '../原生压缩/样本'
import { 规范规则, 位数统计 } from '../原生压缩/条件'
import { 空位图, 一位图 } from '../原生压缩/类型'
import type { 原生条件, 原生规则 } from '../原生压缩/类型'
import type { 生成候选 } from './类型'

const 复制 = (规则: 原生规则[]) => 规则.map((行) => ({ action: 行.action, ...规范规则(行) }))
const 比较文本 = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

export const 语义顺序 = (样本: 原生样本, 索引: Iterable<number>, 优先: Iterable<number> = []) => {
  const 偏好 = new Set(优先)
  const 目录 = 样本.catalog
  if (!目录?.metadata)
    return [...索引].sort((a, b) => Number(!偏好.has(a)) - Number(!偏好.has(b)) || a - b)
  const 分组 = new Map<string, number[]>()
  for (const i of 索引) {
    const 项 = 目录.metadata[i]
    const 键 = JSON.stringify([
      项.kind ?? null,
      项.entity ?? null,
      项.read_dependencies ?? [],
      项.wake_dependencies ?? [],
    ])
    const 组 = 分组.get(键) ?? []
    组.push(i)
    分组.set(键, 组)
  }
  const 身份 = (i: number) => 目录.metadata![i].atom_id
  const 组 = [...分组.values()]
  组.forEach((项) =>
    项.sort((a, b) => Number(!偏好.has(a)) - Number(!偏好.has(b)) || 比较文本(身份(a), 身份(b))),
  )
  组.sort(
    (a, b) =>
      Number(!a.some((i) => 偏好.has(i))) - Number(!b.some((i) => 偏好.has(i))) ||
      比较文本(身份(a[0]), 身份(b[0])),
  )
  const 结果: number[] = []
  for (let 偏移 = 0; 组.some((项) => 偏移 < 项.length); 偏移++)
    for (const 项 of 组) if (偏移 < 项.length) 结果.push(项[偏移])
  return 结果
}

export const 快速条件 = (正例: bigint, 负例: bigint, 样本: 原生样本): 原生条件 | null => {
  if (正例 & 负例) return null
  const 顺序 = 语义顺序(
    样本,
    样本.truth.flatMap((位, i) => (正例 & ~位 ? [] : [i])),
  )
  let 剩余 = 负例
  const 叶子: number[] = []
  while (剩余) {
    样本.check()
    let 最佳: number | undefined
    let 增益 = 0
    for (const k of 顺序) {
      const 值 = 位数统计(剩余 & ~样本.truth[k])
      if (值 > 增益) {
        增益 = 值
        最佳 = k
      }
    }
    if (最佳 === undefined) return null
    叶子.push(最佳)
    剩余 &= 样本.truth[最佳]
    顺序.splice(顺序.indexOf(最佳), 1)
  }
  return { atoms: 叶子, ops: Array(Math.max(0, 叶子.length - 1)).fill('&') }
}

export function* 条件流(
  正例: bigint,
  负例: bigint,
  样本: 原生样本,
  最大项?: number,
  优先: number[] = [],
): Generator<原生条件 | null> {
  正例 &= 样本.all
  负例 &= 样本.all
  if (正例 & 负例) return
  const 顺序 = 语义顺序(样本, 样本.truth.keys(), 优先)
  if (!负例) yield { atoms: [], ops: [] }
  for (const 叶 of 顺序) {
    样本.check()
    const 位 = 样本.truth[叶]
    if (!(正例 & ~位) && !(负例 & 位)) yield { atoms: [叶], ops: [] }
    yield null
  }
  for (let 深度 = 2; 深度 <= (最大项 ?? 顺序.length) && 深度 <= 顺序.length; 深度++) {
    const 栈 = [{ atoms: [] as number[], ops: [] as ('&' | '|')[], 正例, 负例, 位置: 0 }]
    while (栈.length) {
      const 顶 = 栈[栈.length - 1]
      if (顶.位置 >= 顺序.length) {
        栈.pop()
        continue
      }
      const 叶 = 顺序[顶.位置++]
      样本.check()
      if (顶.atoms.includes(叶)) continue
      const 位 = 样本.truth[叶]
      const atoms = [...顶.atoms, 叶]
      if (atoms.length === 深度) {
        if (!(顶.正例 & ~位) && !(顶.负例 & 位)) yield { atoms, ops: [...顶.ops] }
      } else {
        if (!(顶.负例 & 位) && (顶.正例 & ~位) !== 顶.正例)
          栈.push({ atoms, ops: [...顶.ops, '|'], 正例: 顶.正例 & ~位, 负例: 顶.负例, 位置: 0 })
        if (!(顶.正例 & ~位) && (顶.负例 & 位) !== 顶.负例)
          栈.push({ atoms, ops: [...顶.ops, '&'], 正例: 顶.正例, 负例: 顶.负例 & 位, 位置: 0 })
      }
      yield null
    }
  }
}

function* 构造流(
  样本: 原生样本,
  变体: number,
  种子?: 原生规则[],
  策略 = 'semantic',
): Generator<生成候选 | null> {
  let 待定 = 样本.all
  const 规则: 原生规则[] = []
  let 未满足 = [...样本.groups.values()]
  let 必须 = 样本.required
  while (必须) {
    const 位 = 必须 & -必须
    未满足.push(位)
    必须 ^= 位
  }
  for (const 行 of 种子 ?? []) {
    const 命中 = 待定 & 样本.命中(行)
    if (命中 && !(命中 & 样本.rejected[行.action])) {
      规则.push(...复制([行]))
      待定 &= ~命中
      未满足 = 未满足.filter((位) => !(位 & 命中))
    }
    yield null
  }
  let 顺序 = 语义顺序(样本, 样本.atoms.keys())
  if (顺序.length) {
    const 位移 = 变体 % 顺序.length
    顺序 = [...顺序.slice(位移), ...顺序.slice(0, 位移)]
  }
  while (未满足.length) {
    let 找到 = false
    let 锚点 = 样本.rows.flatMap((_, i) => {
      const 位 = 一位图 << BigInt(i)
      return 待定 & 位 && 未满足.some((组) => !!(组 & 位)) ? [i] : []
    })
    if (锚点.length && 变体) {
      const 位移 = 变体 % 锚点.length
      锚点 = [...锚点.slice(位移), ...锚点.slice(0, 位移)]
    }
    for (const i of 锚点) {
      const 位 = 一位图 << BigInt(i)
      for (const action of 样本.rows[i].allowed ?? []) {
        const 坏 = 待定 & 样本.executable[action] & 样本.rejected[action]
        const 叶子 = 顺序.filter((k) => !!(样本.truth[k] & 位))
        if (叶子.reduce((值, k) => 值 & 样本.truth[k], 坏)) continue
        const 选中: number[] = []
        let 未覆盖 = 坏
        while (未覆盖) {
          let 最佳 = 叶子[0]
          let 最优: number[] | undefined
          for (const k of 叶子) {
            const 增益 = 位数统计(未覆盖 & ~样本.truth[k])
            const 时钟 = !!样本.catalog?.clock.has(k)
            const 权重 = 时钟 && [0, 2].includes(变体 % 4) ? 4 : 1
            const 分数 =
              策略 === 'stable' ? [增益 / 权重, 增益, Number(!时钟), -样本.atom_costs[k]] : [增益]
            if (
              !最优 ||
              分数.some(
                (值, j) => 值 > 最优![j] && 分数.slice(0, j).every((前, k) => 前 === 最优![k]),
              )
            ) {
              最佳 = k
              最优 = 分数
            }
          }
          选中.push(最佳)
          未覆盖 &= 样本.truth[最佳]
          yield null
        }
        for (const k of [...选中].reverse()) {
          const 错误 = 选中.filter((值) => 值 !== k).reduce((值, 叶) => 值 & 样本.truth[叶], 坏)
          if (!错误) 选中.splice(选中.indexOf(k), 1)
        }
        const 行: 原生规则 = {
          action,
          atoms: 选中,
          ops: Array(Math.max(0, 选中.length - 1)).fill('&'),
        }
        const 命中 = 待定 & 样本.命中(行)
        规则.push(行)
        待定 &= ~命中
        未满足 = 未满足.filter((组) => !(组 & 命中))
        找到 = true
        break
      }
      yield null
      if (找到) break
    }
    if (!找到) {
      yield {
        status:
          样本.unknown.some((位) => 位 !== 空位图) || 样本.wait_unknown
            ? 'unknown'
            : 'finite_sample_unsat',
        partial_rules: 规则,
        remaining_groups: 未满足.map(String),
      }
      return
    }
  }
  yield { rules: 规则, source: 'construct', sample_verdict: 样本.判定(规则) }
}

export function* 构造候选(
  样本: 原生样本,
  种子?: 原生规则[],
  策略 = 'semantic',
): Generator<生成候选 | null> {
  for (let 变体 = 0; 变体 < Math.max(1, 样本.atoms.length, 样本.rows.length); 变体++)
    yield* 构造流(样本, 变体, 变体 % 2 === 0 ? 种子 : undefined, 策略)
}

export function* 语义替换(规则: 原生规则[], 样本: 原生样本): Generator<生成候选> {
  for (let i = 0; i < 规则.length; i++) {
    const 条件 = 规范规则(规则[i])
    for (let 位置 = 0; 位置 < 条件.atoms.length; 位置++) {
      const 原 = 条件.atoms[位置]
      const 同义 = 样本.atoms.flatMap((_, k) =>
        k !== 原 && 样本.truth[k] === 样本.truth[原] ? [k] : [],
      )
      for (const 叶 of 语义顺序(样本, 同义)) {
        const 提案 = 复制(规则)
        提案[i].atoms[位置] = 叶
        yield { rules: 提案, source: 'semantic_alias', atom: 叶 }
      }
    }
  }
}

export function* 计时载体(规则: 原生规则[], 样本: 原生样本): Generator<生成候选> {
  if (!规则.length || !样本.catalog) return
  const 使用 = new Set(规则.flatMap((行) => 规范规则(行).atoms))
  const 对照 = new Map(样本.atoms.map((文本, i) => [文本, i]))
  const 对 = [...对照].flatMap(([文本, i]) => {
    const 另一 = 文本.startsWith('last_skill=')
      ? 对照.get('last_skill~=' + 文本.split('=')[1])
      : undefined
    return 另一 === undefined ? [] : [[i, 另一]]
  })
  if (!对.length) return
  for (const 叶 of 语义顺序(
    样本,
    [...样本.catalog.clock].filter((k) => !使用.has(k)),
  )) {
    const 提案 = 复制(规则)
    提案.push({ action: 规则[0].action, atoms: [...对[0], 叶], ops: ['&', '&'] })
    yield { rules: 提案, source: 'clock_carrier', atom: 叶 }
  }
}
