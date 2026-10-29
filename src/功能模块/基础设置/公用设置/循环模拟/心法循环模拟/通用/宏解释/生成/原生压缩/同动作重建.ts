import type { 原生规则, 原生候选, 原生条件, 位图 } from './类型'
import { 空位图 } from './类型'
import type { 原生样本 } from './样本'
import { 位数统计 } from './条件'
import {
  复制规则,
  程序标识,
  规则排序键,
  程序排序键,
  比较排序值,
  type 条件查找,
  type 排序值,
} from './优先级候选'

const 时钟键 = (行: 原生条件, 时钟: ReadonlySet<number>) =>
  [
    ...new Set(
      [...行.atoms, ...(行.ops === undefined ? (行.any_atoms ?? []) : [])].filter((k) =>
        时钟.has(k),
      ),
    ),
  ].sort((a, b) => a - b)

const 子集 = (位置: number[], 成本: number[], 上限: number, 检查: () => void) => {
  const 结果: number[][] = [],
    已见 = new Set<string>()
  const 加入 = (组: number[]) => {
    检查()
    const 值 = [...new Set(组)].sort((a, b) => a - b),
      键 = 值.join(',')
    if (值.length >= 3 && !已见.has(键) && 结果.length < 上限) {
      已见.add(键)
      结果.push(值)
    }
  }
  if (位置.length < 3 || 上限 <= 0) return 结果
  加入(位置)
  if (位置.length <= 7) {
    const 长度 = Array.from({ length: 位置.length - 3 }, (_, i) => i + 3)
    const 队列: number[][][] = []
    const 枚举 = (个数: number) => {
      const 组: number[][] = []
      const 递归 = (起点: number, 前缀: number[]) => {
        if (前缀.length === 个数) {
          组.push(前缀)
          return
        }
        for (let i = 起点; i <= 位置.length - (个数 - 前缀.length); i++)
          递归(i + 1, [...前缀, 位置[i]])
      }
      递归(0, [])
      return 组.sort(
        (a, b) =>
          b.reduce((和, i) => 和 + 成本[i], 0) - a.reduce((和, i) => 和 + 成本[i], 0) ||
          比较排序值(a, b),
      )
    }
    while (长度.length) {
      队列.push(枚举(长度.shift()!))
      if (长度.length) 队列.push(枚举(长度.pop()!))
    }
    while (队列.some((项) => 项.length) && 结果.length < 上限)
      for (const 组 of 队列) if (组.length) 加入(组.shift()!)
    return 结果
  }
  const 贵 = [...位置].sort((a, b) => 成本[b] - 成本[a] || a - b),
    便宜 = [...贵].reverse()
  for (let 起点 = 0; 起点 < 位置.length; 起点++) {
    加入([...位置.slice(0, 起点), ...位置.slice(起点 + 1)])
    for (const 宽 of [3, 4, 5, 7, Math.floor(位置.length / 2)]) {
      if (宽 >= 3 && 宽 < 位置.length) {
        加入(Array.from({ length: 宽 }, (_, i) => 位置[(起点 + i) % 位置.length]))
        加入(贵.slice(起点, 起点 + 宽))
        加入(便宜.slice(起点, 起点 + 宽))
        for (const 跨度 of [2, 3])
          加入(Array.from({ length: 宽 }, (_, i) => 位置[(起点 + 跨度 * i) % 位置.length]))
      }
      if (结果.length >= 上限) return 结果
    }
  }
  return 结果
}

interface 重建状态 {
  间隙: number
  剩余: 位图
  插入: [number, 原生规则][]
  成本: number
}
interface 重建任务 {
  动作: number
  组: number[]
  正例: 位图
  保留: 原生规则[]
  原间隙: Set<number>
  单元: 位图[]
  限额: number
  前沿: 重建状态[]
  索引: number
  后继: 重建状态[]
  深度: number
  已开始: boolean
}
type 重建条目 = { 成本: number; 键: 排序值[]; 类型: string; 规则: 原生规则[] }

export function* 同动作重建(
  规则: readonly 原生规则[],
  样本: 原生样本,
  查找?: 条件查找,
  诊断?: (信息: Record<string, unknown>) => void,
  选项: {
    limit?: number
    beam_width?: number
    max_expansions?: number
    max_guard_queries?: number
    max_subsets?: number
    max_gaps?: number
    max_targets?: number
    max_guards?: number
    max_feature_guards?: number
  } = {},
): Generator<原生候选> {
  const 起点 = performance.now()
  const {
    limit: 上限 = 36,
    beam_width: 宽度 = 6,
    max_expansions: 扩展上限 = 384,
    max_guard_queries: 查询上限 = 64,
    max_subsets: 子集上限 = 128,
    max_gaps: 间隙上限 = 6,
    max_targets: 目标上限 = 6,
    max_guards: 条件上限 = 6,
    max_feature_guards: 特征上限 = 96,
  } = 选项
  const 统计 = {
    expanded_states: 0,
    guard_lookups: 0,
    guard_queries: 0,
    guard_cache_hits: 0,
    native_guard_queries: 0,
    guard_budget_skips: 0,
    subsets_enumerated: 0,
    subsets_started: 0,
    selected_candidates: 0,
    expansion_limit_reached: false,
  }
  const 动作统计 = new Map<
    number,
    { family_rows: number; subsets: number; started: number; generated: number; selected: number }
  >()
  const 报告 = () =>
    诊断?.({
      kind: 'family_search',
      ...统计,
      construction_ms: performance.now() - 起点,
      actions: [...动作统计].sort((a, b) => a[0] - b[0]).map(([action, 值]) => ({ action, ...值 })),
    })
  样本.check()
  if (
    上限 <= 0 ||
    !规则.length ||
    Math.min(宽度, 扩展上限, 子集上限, 间隙上限, 目标上限, 条件上限) <= 0
  ) {
    报告()
    return
  }
  const 原规则 = 复制规则(规则),
    成本 = 原规则.map((行) => 样本.规则成本(行) + 1)
  const 原成本 = 成本.reduce((a, b) => a + b, 0),
    [选择] = 样本.选择(原规则)
  const 全族 = new Map<number, number[]>()
  原规则.forEach((行, i) => {
    const 组 = 全族.get(行.action) ?? []
    组.push(i)
    全族.set(行.action, 组)
  })
  const 族 = new Map([...全族].filter(([, 位置]) => 位置.length >= 3))
  if (!族.size) {
    报告()
    return
  }
  const 时钟 = 样本.catalog.clock,
    原条件 = new Map<number, 原生规则[]>()
  for (const [动作, 位置] of 族) {
    const 原子候选 = new Map<string, { 成本: number; 原子: number; 规则: 原生规则 }>()
    const 族位图 = 位置.reduce((位, i) => 位 | 选择[i], 空位图)
    样本.truth.forEach((真值, k) => {
      样本.check()
      const 命中 = 真值 & 样本.executable[动作]
      if (!(命中 & 族位图)) return
      const 行 = { action: 动作, atoms: [k] },
        键 = `${命中};${时钟键(行, 时钟)}`
      const 项 = { 成本: 样本.规则成本(行), 原子: k, 规则: 行 },
        已有 = 原子候选.get(键)
      if (!已有 || 项.成本 < 已有.成本 || (项.成本 === 已有.成本 && k < 已有.原子))
        原子候选.set(键, 项)
    })
    const 排序 = [...原子候选.values()].sort((a, b) => a.成本 - b.成本 || a.原子 - b.原子)
    原条件.set(动作, [
      ...位置.map((i) => 原规则[i]),
      ...排序.slice(0, Math.max(0, 特征上限)).map((项) => 项.规则),
    ])
  }
  const 动作列表 = [...族.keys()].sort((a, b) => a - b),
    缓存 = new Map<string, 原生条件[]>()
  const 查询次数 = new Map<number, number>(),
    查询配额 = new Map(
      动作列表.map((动作, i) => [
        动作,
        Math.floor(Math.max(0, 查询上限) / 动作列表.length) +
          Number(i < Math.max(0, 查询上限) % 动作列表.length),
      ]),
    )
  const 合成 = (动作: number, 正例: 位图, 负例: 位图) => {
    样本.check()
    统计.guard_lookups++
    const 键 = `${正例};${负例}`
    if (缓存.has(键)) {
      统计.guard_cache_hits++
      return 缓存.get(键)!
    }
    if ((查询次数.get(动作) ?? 0) >= 查询配额.get(动作)!) {
      统计.guard_budget_skips++
      return []
    }
    查询次数.set(动作, (查询次数.get(动作) ?? 0) + 1)
    统计.guard_queries++
    const 候选: 原生条件[] = 样本.覆盖条件(正例, 负例).map((atoms) => ({ atoms }))
    if (查找) {
      统计.native_guard_queries++
      候选.push(...查找(正例, 负例, 样本))
    }
    const 唯一 = new Map<string, 原生条件>()
    for (const 条件 of 候选) {
      样本.check()
      const 行 = 复制规则([{ ...条件, action: 动作 }])[0],
        命中 = 样本.命中(行)
      if (正例 & ~命中 || 负例 & 命中) continue
      const 条件键 = JSON.stringify(规则排序键(行).slice(1))
      if (!唯一.has(条件键)) 唯一.set(条件键, 行)
    }
    const 结果 = [...唯一.values()]
    缓存.set(键, 结果)
    return 结果
  }
  const 多样条件 = (候选: 原生规则[], 正例: 位图, 负例: 位图) => {
    type 条目 = { 键: 排序值[]; 行: 原生规则; 时钟: number[] }
    const 唯一 = new Map<string, 条目>()
    for (const 行 of 候选) {
      样本.check()
      const 命中 = 样本.命中(行),
        覆盖 = 正例 & 命中
      if (!覆盖 || 命中 & 负例) continue
      const 唤醒 = 时钟键(行, 时钟),
        语义 = `${命中};${唤醒}`
      const 项 = {
        键: [-位数统计(覆盖) / (样本.规则成本(行) + 1), 样本.规则成本(行), 规则排序键(行)],
        行,
        时钟: 唤醒,
      }
      if (!唯一.has(语义) || 比较排序值(项.键, 唯一.get(语义)!.键) < 0) 唯一.set(语义, 项)
    }
    const 排序 = [...唯一.values()].sort((a, b) => 比较排序值(a.键, b.键)),
      选中 = 排序.slice(0, 条件上限)
    const 代表: 条目[] = [],
      已见时钟 = new Set<string>()
    for (const 项 of 排序) {
      if (项.时钟.length && !已见时钟.has(项.时钟.join(','))) {
        代表.push(项)
        已见时钟.add(项.时钟.join(','))
      }
      if (代表.length >= Math.min(2, 条件上限 - 1)) break
    }
    for (const 项 of 代表)
      if (!选中.includes(项) && 选中.length)
        for (let i = 选中.length - 1; i > 0; i--)
          if (!代表.includes(选中[i])) {
            选中[i] = 项
            break
          }
    return 选中.sort((a, b) => 比较排序值(a.键, b.键)).map((项) => 项.行)
  }
  const 队列 = new Map<number, 重建任务[]>()
  for (const [动作, 位置] of 族) {
    const 分组 = 子集(位置, 成本, 子集上限, 样本.check)
    动作统计.set(动作, {
      family_rows: 位置.length,
      subsets: 分组.length,
      started: 0,
      generated: 0,
      selected: 0,
    })
    统计.subsets_enumerated += 分组.length
    const 任务列表: 重建任务[] = []
    for (const 组 of 分组) {
      const 删除 = new Set(组),
        保留: 原生规则[] = [],
        原间隙 = new Set<number>()
      let 正例 = 空位图
      原规则.forEach((行, i) => {
        if (删除.has(i)) {
          正例 |= 选择[i]
          原间隙.add(保留.length)
        } else 保留.push(行)
      })
      if (正例)
        任务列表.push({
          动作,
          组,
          正例,
          保留,
          原间隙,
          单元: 组.map((i) => 选择[i]),
          限额: 组.reduce((和, i) => 和 + 成本[i], 0),
          前沿: [{ 间隙: 0, 剩余: 样本.all, 插入: [], 成本: 0 }],
          索引: 0,
          后继: [],
          深度: 0,
          已开始: false,
        })
    }
    队列.set(动作, 任务列表)
  }
  const 合法间隙 = (任务: 重建任务, 状态: 重建状态) => {
    const 机会: [number, 位图, 位图][] = []
    let 剩余 = 状态.剩余
    for (let i = 状态.间隙; i <= 任务.保留.length; i++) {
      样本.check()
      if (剩余 & 任务.正例)
        机会.push([i, 剩余, 剩余 & 样本.executable[任务.动作] & 样本.rejected[任务.动作]])
      if (i < 任务.保留.length) {
        const 行 = 任务.保留[i],
          命中 = 剩余 & 样本.命中(行)
        if (命中 & 样本.rejected[行.action]) break
        剩余 &= ~命中
      }
    }
    if (机会.length <= 间隙上限) return 机会
    const 优先 = [
      机会[0],
      机会[机会.length - 1],
      ...机会.filter(([i]) => 任务.原间隙.has(i)),
      ...机会,
    ]
    const 选中: typeof 机会 = [],
      已见位置 = new Set<number>(),
      已见位图 = new Set<位图>()
    for (const 项 of 优先) {
      if (
        !已见位置.has(项[0]) &&
        (项 === 优先[0] || 项 === 优先[1] || 任务.原间隙.has(项[0]) || !已见位图.has(项[1]))
      ) {
        选中.push(项)
        已见位置.add(项[0])
        已见位图.add(项[1])
        if (选中.length >= 间隙上限) return 选中.sort((a, b) => a[0] - b[0])
      }
    }
    for (const 项 of 机会)
      if (!已见位置.has(项[0])) {
        选中.push(项)
        if (选中.length >= 间隙上限) break
      }
    return 选中.sort((a, b) => a[0] - b[0])
  }
  const 目标 = (任务: 重建任务, 剩余: 位图) => {
    const 单元 = [...new Set(任务.单元.map((位) => 位 & 剩余).filter((位) => !!位))]
    const 部分 =
      单元.length > 1
        ? [
            单元.slice(0, Math.floor(单元.length / 2)),
            单元.slice(Math.floor(单元.length / 2)),
            单元.filter((_, i) => i % 2 === 0),
            单元.filter((_, i) => i % 2 !== 0),
          ].map((项) => 项.reduce((a, b) => a | b, 空位图))
        : []
    const 结果: 位图[] = [],
      已见 = new Set<位图>()
    for (let i = 0; i <= Math.max(部分.length, 单元.length); i++) {
      const 项 = [
        ...(i === 0 ? [任务.正例 & 剩余] : []),
        ...(i < 部分.length ? [部分[i]] : []),
        ...(i < 单元.length ? [单元[i]] : []),
      ]
      for (const 位 of 项)
        if (位 && !已见.has(位)) {
          结果.push(位)
          已见.add(位)
          if (结果.length >= 目标上限) return 结果
        }
    }
    return 结果
  }
  const 状态键 = (状态: 重建状态): 排序值[] => [
    状态.间隙,
    状态.剩余,
    状态.插入.map(([i, 行]) => [i, 规则排序键(行)]),
    状态.成本,
  ]
  const 唤醒键 = (状态: 重建状态) =>
    状态.插入.flatMap(([i, 行]) => {
      const 钟 = 时钟键(行, 时钟)
      return 钟.length ? [[i, 钟]] : []
    })
  const 剪枝 = (任务: 重建任务, 状态列表: 重建状态[]) => {
    const 唯一 = new Map<string, 重建状态>()
    for (const 状态 of 状态列表) {
      const 键 = `${状态.间隙};${状态.剩余};${JSON.stringify(唤醒键(状态))}`,
        已有 = 唯一.get(键)
      if (!已有 || 比较排序值([状态.成本, 状态键(状态)], [已有.成本, 状态键(已有)]) < 0)
        唯一.set(键, 状态)
    }
    const 排序 = [...唯一.values()].sort(
      (a, b) =>
        位数统计(任务.正例 & a.剩余) - 位数统计(任务.正例 & b.剩余) ||
        a.成本 - b.成本 ||
        比较排序值(状态键(a), 状态键(b)),
    )
    const 选中 = 排序.slice(0, 宽度)
    if (选中.length && 宽度 > 1) {
      const 最少 = 位数统计(任务.正例 & 选中[0].剩余),
        代表: 重建状态[] = []
      const 唤醒 = new Set([JSON.stringify(唤醒键(选中[0]))])
      for (const 状态 of 排序) {
        const 钟 = 唤醒键(状态),
          键 = JSON.stringify(钟)
        if (钟.length && !唤醒.has(键) && 位数统计(任务.正例 & 状态.剩余) === 最少) {
          代表.push(状态)
          唤醒.add(键)
        }
        if (代表.length >= Math.min(2, 宽度 - 1)) break
      }
      for (const 状态 of 代表)
        if (!选中.includes(状态))
          for (let i = 选中.length - 1; i > 0; i--)
            if (!代表.includes(选中[i])) {
              选中[i] = 状态
              break
            }
    }
    return 选中
  }
  const 已见 = new Set<string>(),
    桶 = new Map(
      动作列表.map((动作) => [动作, new Map<string, { 形状: 排序值[]; 条目: 重建条目[] }>()]),
    )
  const 桶容量 = Math.max(2, Math.min(上限, 8))
  const 接纳 = (任务: 重建任务, 状态: 重建状态) => {
    if (状态.成本 >= 任务.限额) return
    const 提案: 原生规则[] = []
    let 游标 = 0
    for (let i = 0; i <= 任务.保留.length; i++) {
      while (游标 < 状态.插入.length && 状态.插入[游标][0] === i) 提案.push(状态.插入[游标++][1])
      if (i < 任务.保留.length) 提案.push(任务.保留[i])
    }
    const 标识 = 程序标识(提案)
    if (已见.has(标识)) return
    已见.add(标识)
    if (!样本.兼容(提案)) return
    const 成本 = 提案.reduce((和, 行) => 和 + 样本.规则成本(行) + 1, 0)
    if (成本 >= 原成本) return
    const 个数 = 状态.插入.length,
      形状 = [个数, 任务.组.length, !!唤醒键(状态).length],
      键 = JSON.stringify(形状)
    const 动作桶 = 桶.get(任务.动作)!,
      条目 = 动作桶.get(键)?.条目 ?? []
    条目.push({
      成本,
      键: 程序排序键(提案),
      类型: `family_rebuild_${任务.组.length}_to_${个数}`,
      规则: 复制规则(提案),
    })
    条目.sort((a, b) => a.成本 - b.成本 || 比较排序值(a.键, b.键))
    条目.splice(桶容量)
    动作桶.set(键, { 形状, 条目 })
    动作统计.get(任务.动作)!.generated++
  }
  const 活跃 = 动作列表.filter((动作) => 队列.get(动作)!.length)
  while (活跃.length && 统计.expanded_states < 扩展上限) {
    样本.check()
    const 动作 = 活跃.shift()!,
      任务 = 队列.get(动作)!.shift()!
    if (!任务.已开始) {
      任务.已开始 = true
      统计.subsets_started++
      动作统计.get(动作)!.started++
    }
    const 状态 = 任务.前沿[任务.索引]
    统计.expanded_states++
    for (const [间隙, 剩余, 负例] of 合法间隙(任务, 状态)) {
      const 候选 = [...原条件.get(动作)!]
      for (const 正例 of 目标(任务, 剩余))
        候选.push(...合成(动作, 正例, 负例).map((条件) => ({ ...条件, action: 动作 })))
      for (const 行 of 多样条件(候选, 任务.正例 & 剩余, 负例)) {
        const 成本 = 状态.成本 + 样本.规则成本(行) + 1
        if (成本 >= 任务.限额) continue
        const 后继: 重建状态 = {
          间隙,
          剩余: 剩余 & ~样本.命中(行),
          插入: [...状态.插入, [间隙, 复制规则([行])[0]]],
          成本,
        }
        任务.后继.push(后继)
        接纳(任务, 后继)
      }
    }
    if (++任务.索引 >= 任务.前沿.length) {
      任务.深度++
      任务.前沿 = 剪枝(任务, 任务.后继)
      任务.索引 = 0
      任务.后继 = []
    }
    if (任务.深度 < 3 && 任务.前沿.length) 队列.get(动作)!.push(任务)
    if (队列.get(动作)!.length) 活跃.push(动作)
  }
  统计.expansion_limit_reached = !!活跃.length
  const 形状队列 = new Map(
    动作列表.map((动作) => [
      动作,
      [...桶.get(动作)!.values()].sort((a, b) => 比较排序值(a.形状, b.形状)).map((项) => 项.条目),
    ]),
  )
  const 待选 = 动作列表.filter((动作) => 形状队列.get(动作)!.length),
    选出: 原生候选[] = []
  while (待选.length && 选出.length < 上限) {
    const 动作 = 待选.shift()!,
      队列 = 形状队列.get(动作)!,
      结构 = 队列.shift()!,
      项 = 结构.shift()!
    选出.push([项.类型, 项.规则])
    动作统计.get(动作)!.selected++
    if (结构.length) 队列.push(结构)
    if (队列.length) 待选.push(动作)
  }
  统计.selected_candidates = 选出.length
  报告()
  for (const 项 of 选出) {
    样本.check()
    yield 项
  }
}
