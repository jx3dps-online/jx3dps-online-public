import type { 原生规则, 原生观察行, 原子元信息 } from '../原生压缩/类型'
import { 空位图, 一位图 } from '../原生压缩/类型'
import type { 原生样本 } from '../原生压缩/样本'
import { 规范规则, 位数统计 } from '../原生压缩/条件'
import { 比较排序值 } from '../原生压缩/优先级候选'
import { 语义顺序, 快速条件, 条件流 } from './构造候选'
import type { 生成候选 } from './类型'

type 修复回放 = Record<string, any>
interface 分歧位置 {
  kind: string
  index: number
}
type 局部编辑 = 生成候选 & { line: number; replacement: 原生规则[] }
const 复制 = (规则: readonly 原生规则[]) =>
  规则.map((行) => ({ action: 行.action, ...规范规则(行) }))
const 身份 = (值: unknown) => JSON.stringify(值)

// 这里只减少重复提案；任务级持久化去重仍覆盖全部已回放候选。
class 提案缓存 extends Set<string> {
  add(键: string) {
    if (!this.has(键) && this.size >= 256) this.delete(this.values().next().value!)
    return super.add(键)
  }
}

export const 定位分歧 = (回放: 修复回放): 分歧位置 => {
  const 分歧 = 回放.comparison?.first_difference ?? {},
    失败 = 回放.probe_failure ?? {}
  const 实际 = 分歧.actual ?? {},
    期望 = 分歧.expected ?? {}
  let 序号 = 分歧.index ?? 0
  const 类型 = 失败.kind
  if (类型 === 'channel_ticks_mismatch') {
    if (Number.isInteger(失败.repair_index) && 失败.repair_index === 序号 + 1)
      序号 = 失败.repair_index
    return { kind: 'channel', index: 序号 }
  }
  if (类型 === 'missed_decision_time' || 类型 === 'missed_release_window')
    return { kind: 'missed_window', index: 失败.index ?? 序号 }
  if (类型 === 'early_release' || 类型 === 'late_release' || 类型 === 'wrong_action')
    return {
      kind: (
        { early_release: 'early', late_release: 'late', wrong_action: 'wrong_action' } as Record<
          string,
          string
        >
      )[类型],
      index: 序号,
    }
  return {
    kind:
      实际.name != null && 实际.name === 期望.name
        ? (实际.time ?? 0) > (期望.time ?? 0)
          ? 'late'
          : 'early'
        : 'wrong_action',
    index: 序号,
  }
}

const 上游位置 = (回放: 修复回放, 失败: 分歧位置) => {
  const 实际 = 回放.actual ?? [],
    目标 = 回放.target ?? [],
    上限 = Math.min(失败.index, 实际.length, 目标.length)
  const 变化: [boolean, number][] = []
  let 对齐 = 0
  for (let i = 0; i < 上限; i++) {
    if (实际[i].name !== 目标[i].name) continue
    const 偏差 = 实际[i].time - 目标[i].time
    if (偏差) 变化.push([偏差 >= 0, i])
    else 对齐 = i
  }
  return [
    ...new Set([
      ...变化.sort((a, b) => Number(a[0]) - Number(b[0]) || a[1] - b[1]).map(([, i]) => i),
      ...Array.from({ length: 上限 - 对齐 }, (_, i) => i + 对齐),
      ...Array.from({ length: 对齐 }, (_, i) => i),
    ]),
  ]
}
const 门控 = (规则: 原生规则, 叶: number): 原生规则 => {
  const 条件 = 规范规则(规则)
  return {
    action: 规则.action,
    atoms: [叶, ...条件.atoms],
    ops: 条件.atoms.length ? ['&', ...条件.ops] : [],
  }
}
const 门控顺序 = (
  样本: 原生样本,
  行: 原生观察行,
  正例: bigint,
  因果依赖: readonly string[] = [],
) => {
  const 假值 = Array.from(行.truth).flatMap((值, i) => (值 ? [] : [i]))
  const 支持 = new Set((行.wake_atoms as readonly number[] | undefined) ?? [])
  for (const 见证 of 行.decision_witnesses ?? [])
    if (见证.allowed === true || 见证.allowed === 'allowed')
      for (const 叶 of 见证.clock_atoms ?? []) 支持.add(叶)
  const 依赖 = new Set([
    ...((行.read_dependencies as readonly string[] | undefined) ?? []),
    ...因果依赖,
  ])
  const 调度 = 行.scheduling as { GCD组?: Record<string, unknown> } | undefined
  const 阻塞 = new Set(
    Object.entries(调度?.GCD组 ?? {}).flatMap(([名称, 值]) =>
      typeof 值 === 'number' && Number.isFinite(值) && 值 > 1e-7 && 因果依赖.includes('gcd:' + 名称)
        ? ['gcd:' + 名称]
        : [],
    ),
  )
  const 排序 = (叶: number) => {
    const 元信息: Partial<原子元信息> = 样本.catalog.metadata?.[叶] ?? {}
    const 读取 = 元信息.read_dependencies ?? []
    const 类型 = String(元信息.kind ?? '').toLowerCase()
    const 就绪 =
      类型 === 'readiness' ||
      类型.includes('cd') ||
      类型.includes('ready') ||
      类型.includes('就绪') ||
      读取.some((名) => ['gcd:', 'cooldown:', 'charge:'].some((前缀) => 名.startsWith(前缀)))
    return [
      !读取.some((名) => 阻塞.has(名)),
      !支持.has(叶),
      !读取.some((名) => 依赖.has(名)),
      !就绪,
      -位数统计(样本.truth[叶] & 正例),
    ]
  }
  return 语义顺序(样本, 假值, 支持).sort((a, b) => 比较排序值(排序(a), 排序(b)))
}

function* 优先级提案(
  规则: 原生规则[],
  样本: 原生样本,
  行: 原生观察行,
  行号: number,
  位置: number,
): Generator<生成候选> {
  const 位 = 一位图 << BigInt(样本.rows.indexOf(行))
  for (let i = 行号 + 1; i < 规则.length; i++) {
    const 后行 = 规则[i]
    if (行.allowed?.includes(后行.action) && 样本.命中(后行) & 位) {
      const 提案 = 复制(规则),
        [移动] = 提案.splice(i, 1)
      提案.splice(行号, 0, 移动)
      yield { rules: 提案, source: 'priority', event: 位置 }
    }
  }
}

export function* 优先级流(规则: 原生规则[], 样本: 原生样本, 回放: 修复回放): Generator<生成候选> {
  const 失败 = 定位分歧(回放)
  if (失败.kind !== 'wrong_action') return
  const 实际 = 回放.actual ?? [],
    事件 = 实际[失败.index] ?? {},
    行号 = (事件.macro_line || 0) - 1
  if (行号 < 0 || 行号 >= 规则.length) return
  for (const 行 of 样本.rows)
    if (行.projection_parent == null && 行.cursor === 失败.index)
      yield* 优先级提案(规则, 样本, 行, 行号, 失败.index)
}

function* 位置编辑流(
  规则: 原生规则[],
  样本: 原生样本,
  回放: 修复回放,
  位置列表: number[],
): Generator<生成候选 | null> {
  if (!规则.length) return
  const 失败 = 定位分歧(回放),
    实际 = 回放.actual ?? [],
    现场 = new Map<number | undefined, 原生观察行>()
  for (const 行 of 样本.rows) if (行.projection_parent == null) 现场.set(行.cursor, 行)
  const 因果依赖 = (现场.get(失败.index)?.read_dependencies as readonly string[] | undefined) ?? []
  const 已见 = new 提案缓存()
  for (const 位置 of 位置列表) {
    const 行 = 现场.get(位置)
    if (!行) continue
    const 事件 = 实际[位置] ?? {}
    let 行号 = (事件.macro_line || 0) - 1
    if (行号 < 0 || 行号 >= 规则.length)
      行号 = 规则.findIndex((项) => 行.allowed?.includes(项.action))
    if (行号 < 0 || 行号 >= 规则.length || (失败.kind === 'late' && 位置 === 失败.index)) continue
    const 当前 = 规则[行号]
    let 正例 = 空位图
    样本.rows.forEach((先前, i) => {
      const 游标 = 先前.cursor ?? -1
      if (
        游标 >= 0 &&
        游标 < Math.min(位置, 实际.length) &&
        实际[游标].macro_line === 行号 + 1 &&
        先前.allowed?.includes(当前.action)
      )
        正例 |= 一位图 << BigInt(i)
    })
    yield* 优先级提案(规则, 样本, 行, 行号, 位置)
    const 门控列 = 门控顺序(样本, 行, 正例, 因果依赖),
      拆分: Generator<生成候选 | null>[] = []
    const 拆分流 = function* (
      叶: number,
      替换: 原生规则[],
      剩余: bigint,
    ): Generator<生成候选 | null> {
      for (const 第二 of 门控列) {
        if (第二 !== 叶 && !(剩余 & ~样本.truth[第二]))
          yield {
            line: 行号,
            replacement: [...替换, 门控(当前, 第二)],
            source: 'context_split',
            event: 位置,
            rule_id: 身份(当前),
          }
        yield null
      }
    }
    let 索引 = 0
    while (索引 < 门控列.length || 拆分.length) {
      if (索引 < 门控列.length) {
        const 叶 = 门控列[索引++],
          键 = `${行号};${叶}`
        if (!已见.has(键) && !规范规则(当前).atoms.includes(叶)) {
          已见.add(键)
          const 替换 = [门控(当前, 叶)]
          yield {
            line: 行号,
            replacement: 替换,
            source: 位置 !== 失败.index ? 'upstream_gate' : 'local_gate',
            event: 位置,
            atom: 叶,
            rule_id: 身份(当前),
          }
          const 剩余 = 正例 & ~样本.truth[叶]
          if (剩余) 拆分.push(拆分流(叶, 替换, 剩余))
        }
        yield null
      }
      if (拆分.length) {
        const 流 = 拆分.shift()!,
          项 = 流.next()
        if (!项.done) {
          拆分.push(流)
          yield 项.value
        }
      }
    }
    if (位置 === 失败.index && 失败.kind === 'wrong_action' && !正例)
      yield { line: 行号, replacement: [], source: 'drop_unused', event: 位置, rule_id: 身份(当前) }
  }
}

export function* 编辑流(
  规则: 原生规则[],
  样本: 原生样本,
  回放: 修复回放,
): Generator<生成候选 | null> {
  const 失败 = 定位分歧(回放)
  const 位置 =
    失败.kind === 'late' || 失败.kind === 'missed_window'
      ? [...上游位置(回放, 失败), 失败.index]
      : [失败.index]
  const 队列 = [...new Set(位置)].map((i) => 位置编辑流(规则, 样本, 回放, [i])),
    已见 = new 提案缓存()
  while (队列.length) {
    const 流 = 队列.shift()!,
      项 = 流.next()
    if (项.done) continue
    队列.push(流)
    if (项.value === null) yield null
    else {
      const 键 = 身份(项.value)
      if (!已见.has(键)) {
        已见.add(键)
        yield 项.value
      }
    }
  }
}

export function* 计时替换(规则: 原生规则[], 样本: 原生样本, 回放?: 修复回放): Generator<生成候选> {
  const 队列: Generator<生成候选>[] = []
  function* 位置流(行号: number, 位置: number, 旧叶: number): Generator<生成候选> {
    const 旧: Partial<原子元信息> = 样本.catalog.metadata?.[旧叶] ?? {}
    const 相关 = 样本.atoms.flatMap((_, 叶) => {
      const 新: Partial<原子元信息> = 样本.catalog.metadata?.[叶] ?? {}
      return 叶 !== 旧叶 &&
        ((新.kind === 旧.kind && 身份(新.entity) === 身份(旧.entity)) ||
          样本.truth[叶] === 样本.truth[旧叶])
        ? [叶]
        : []
    })
    for (const 叶 of 语义顺序(样本, 相关)) {
      const 提案 = 复制(规则)
      提案[行号].atoms[位置] = 叶
      yield { rules: 提案, source: 'timing_alias', atom: 叶, line: 行号 }
    }
  }
  规则.forEach((行, i) => 规范规则(行).atoms.forEach((叶, 位置) => 队列.push(位置流(i, 位置, 叶))))
  while (队列.length) {
    const 流 = 队列.shift()!,
      项 = 流.next()
    if (!项.done) {
      yield 项.value
      队列.push(流)
    }
  }
}

export function* 修复流(
  规则: 原生规则[],
  样本: 原生样本,
  回放: 修复回放,
): Generator<生成候选 | null> {
  const 编辑: 局部编辑[] = [],
    已见 = new 提案缓存(),
    待处理: Generator<生成候选 | null>[] = []
  const 来源 = 编辑流(规则, 样本, 回放)
  let 完成 = false
  const 组合 = (组合编辑: 局部编辑[], 类型?: string): 生成候选 | null => {
    const 行号 = 组合编辑.map((项) => 项.line)
    if (new Set(行号).size !== 行号.length) return null
    const 提案 = 复制(规则)
    for (const 项 of [...组合编辑].sort((a, b) => b.line - a.line))
      提案.splice(项.line, 1, ...复制(项.replacement))
    const 键 = 身份(提案)
    if (已见.has(键)) return null
    已见.add(键)
    return { rules: 提案, source: 类型, edits: 行号 }
  }
  function* 与最新组合(索引: number): Generator<生成候选 | null> {
    function* 枚举(起点: number, 余量: number, 前缀: number[]): Generator<生成候选 | null> {
      if (!余量) {
        yield 组合([...前缀.map((i) => 编辑[i]), 编辑[索引]], 'combined_edit')
        return
      }
      for (let i = 起点; i <= 索引 - 余量; i++) yield* 枚举(i + 1, 余量 - 1, [...前缀, i])
    }
    for (let 个数 = 1; 个数 <= Math.min(索引, 规则.length - 1); 个数++) yield* 枚举(0, 个数, [])
  }
  while (!完成 || 待处理.length) {
    if (!完成) {
      const 项 = 来源.next()
      if (项.done) 完成 = true
      else if (项.value === null || 项.value.rules !== undefined) yield 项.value
      else {
        const 新项 = 项.value as 局部编辑
        编辑.push(新项)
        yield 组合([新项], 新项.source)
        if (编辑.length > 1) 待处理.push(与最新组合(编辑.length - 1))
        const 组 = new Map<number, 局部编辑>()
        for (const 值 of 编辑)
          if (值.source === 新项.source && 值.atom != null && 值.atom === 新项.atom)
            组.set(值.line, 值)
        if (组.size > 1) yield 组合([...组.values()], 'upstream_combination')
      }
    }
    if (待处理.length) {
      const 流 = 待处理.shift()!,
        项 = 流.next()
      if (项.done) yield null
      else {
        yield 项.value
        待处理.push(流)
      }
    }
  }
}

export function* 覆盖流(
  规则: 原生规则[],
  样本: 原生样本,
  回放: 修复回放,
): Generator<生成候选 | null> {
  const 失败 = 定位分歧(回放),
    行号 = 样本.rows.flatMap((行, i) => (行.cursor === 失败.index ? [i] : []))
  if (!行号.length) return
  const 已见 = new 提案缓存()
  const 语义 = (叶: number) => {
    const 项: Partial<原子元信息> = 样本.catalog.metadata?.[叶] ?? {}
    return 身份([
      项.kind ?? null,
      项.entity ?? null,
      项.read_dependencies ?? [],
      项.wake_dependencies ?? [],
    ])
  }
  function* 阈值流(): Generator<生成候选 | null> {
    for (const 最后 of [...行号].reverse()) {
      const 行 = 样本.rows[最后],
        位 = 一位图 << BigInt(最后)
      for (let i = 0; i < 规则.length; i++) {
        const 当前 = 规则[i]
        if (!行.allowed?.includes(当前.action) || 样本.命中(当前) & 位) continue
        const 条件 = 规范规则(当前)
        for (let 位置 = 0; 位置 < 条件.atoms.length; 位置++) {
          const 旧叶 = 条件.atoms[位置]
          if (样本.truth[旧叶] & 位) continue
          const 旧语义 = 语义(旧叶),
            相关 = 样本.atoms.flatMap((_, 叶) =>
              样本.truth[叶] & 位 && 语义(叶) === 旧语义 ? [叶] : [],
            )
          for (const 叶 of 语义顺序(样本, 相关)) {
            const 提案 = 复制(规则)
            提案[i].atoms[位置] = 叶
            const 键 = 身份(提案)
            if (!已见.has(键) && 样本.兼容(提案)) {
              已见.add(键)
              yield { rules: 提案, source: 'coverage_threshold', event: 失败.index, line: i }
            }
            yield null
          }
        }
      }
    }
  }
  function* 间隙流(最后: number, 动作: number, 间隙: number): Generator<生成候选 | null> {
    const 位 = 一位图 << BigInt(最后),
      [, 剩余] = 样本.选择(规则.slice(0, 间隙))
    if (!(剩余 & 位)) return
    const 负例 = 剩余 & 样本.executable[动作] & 样本.rejected[动作]
    function* 条件列() {
      yield 快速条件(位, 负例, 样本)
      yield* 条件流(位, 负例, 样本)
    }
    for (const 条件 of 条件列()) {
      if (!条件) {
        yield null
        continue
      }
      const 提案 = 复制(规则)
      提案.splice(间隙, 0, { ...规范规则(条件), action: 动作 })
      const 键 = 身份(提案)
      if (!已见.has(键)) {
        已见.add(键)
        yield { rules: 提案, source: 'coverage', event: 失败.index }
      }
    }
  }
  const 队列: Generator<生成候选 | null>[] = [阈值流()]
  for (const 最后 of [...行号].reverse())
    for (const 动作 of 样本.rows[最后].allowed ?? []) {
      const 间隙 = [
        ...new Set([
          ...规则.flatMap((行, i) => (行.action === 动作 ? [i] : [])),
          ...Array.from({ length: 规则.length + 1 }, (_, i) => i),
        ]),
      ]
      for (const 位置 of 间隙) 队列.push(间隙流(最后, 动作, 位置))
    }
  while (队列.length) {
    const 流 = 队列.shift()!,
      项 = 流.next()
    if (项.done) yield null
    else {
      yield 项.value
      队列.push(流)
    }
  }
}
