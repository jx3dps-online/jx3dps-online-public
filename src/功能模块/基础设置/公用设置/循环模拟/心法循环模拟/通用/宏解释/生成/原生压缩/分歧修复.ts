import type { 原生规则, 原生观察行, 原生候选, 原生条件目录, 位图 } from './类型'
import { 空位图, 一位图 } from './类型'
import { 规范规则, 条件位图, 条件字数, 纯与条件, 位数统计, 最低位索引 } from './条件'
import { 短条件搜索 } from './条件搜索'
import { 未来见证, type 原生样本 } from './样本'
import { 程序标识, 比较排序值 } from './优先级候选'
import type { 原生压缩回放 } from './调度'

const 计时表达式 = /^((?:t?bufftime):.+)([<>])([0-9]+\.[0-9])$/
const 规范复制 = (规则: readonly 原生规则[]) =>
  规则.map((行) => ({ ...规范规则(行), action: 行.action }))
const 读取字段 = (原子: string) => 原子.split(/[<>=]/, 1)[0]
interface 实际动作 {
  name?: string
  skill_id?: string | number
  time?: number
  macro_page?: number
  macro_line?: number
}
interface 修复回放 extends Omit<原生压缩回放, 'comparison' | 'probe_failure'> {
  actual?: 实际动作[]
  rows?: readonly 原生观察行[]
  comparison?: {
    reproduced?: boolean
    time_tolerance_seconds?: number
    first_difference?: { index?: number; actual?: 实际动作; expected?: 实际动作 }
  }
  probe_failure?: { kind?: string }
}
const 相同动作 = (期望: 实际动作, 实际: 实际动作) =>
  期望.name != null || 实际.name != null
    ? 期望.name != null && 期望.name === 实际.name
    : 期望.skill_id != null && 期望.skill_id === 实际.skill_id

const 计时目标 = (
  行: 原生观察行,
  动作: number,
  容差: number,
): [number | null, number | null, number[] | null] => {
  if (行.decision_latest != null) return [行.decision_latest, 行.decision_latest - 容差, null]
  const 时点 = [...new Set(未来见证(行, 动作).map((项) => 项.time))].sort((a, b) => a - b)
  return 时点.length ? [时点[时点.length - 1], 时点[时点.length - 1], 时点] : [null, null, []]
}
const 唤醒门控 = (
  原子: readonly string[],
  行: 原生观察行,
  容差: number,
  动作: number,
  时钟: ReadonlySet<number>,
  回退中心?: number,
) => {
  if (行.decision_latest == null) {
    const 门控 = new Map<number, number>()
    for (const 点 of 未来见证(行, 动作))
      for (const 叶 of 点.clock_atoms ?? [])
        if (
          时钟.has(叶) &&
          叶 >= 0 &&
          叶 < 原子.length &&
          !行.truth[叶] &&
          (!点.truth || 点.truth[叶])
        )
          门控.set(叶, Math.min(门控.get(叶) ?? Infinity, 点.time - 行.time))
    return [...门控].sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(([叶]) => 叶)
  }
  const 状态 = 行.state as
    | {
        buffs?: { name: string; remaining: number }[]
        target_buffs?: { name: string; remaining: number }[]
      }
    | undefined
  const 剩余 = new Map([
    ...(状态?.buffs ?? []).map((增益): [string, number] => [
      'bufftime:' + 增益.name,
      增益.remaining,
    ]),
    ...(状态?.target_buffs ?? []).map((增益): [string, number] => [
      'tbufftime:' + 增益.name,
      增益.remaining,
    ]),
  ])
  const 中心 = 行.decision_latest != null ? 行.decision_latest - 容差 : 回退中心
  const 门控: [number, number][] = []
  原子.forEach((文本, 叶) => {
    if (叶 >= 行.truth.length || 行.truth[叶]) return
    const 匹配 = 计时表达式.exec(文本)
    if (!匹配 || 匹配[2] !== '<' || !剩余.has(匹配[1]) || 中心 == null) return
    const 唤醒 = 行.time + 剩余.get(匹配[1])! - Number(匹配[3]) + 1e-7
    if (唤醒 >= 中心 - 容差 && 唤醒 <= 中心 + 容差) 门控.push([Math.abs(唤醒 - 中心), 叶])
  })
  return 门控.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, 叶]) => 叶)
}

export function 分歧修复(
  规则: readonly 原生规则[],
  原子: readonly string[],
  输入: 原生压缩回放,
  目录: 原生条件目录,
  检查: () => void = () => {},
  上限 = 16,
): 原生候选[] {
  if (!规则.length || 上限 <= 0) return []
  const 回放 = 输入 as 修复回放,
    分歧 = 回放.comparison?.first_difference ?? {},
    游标 = 分歧.index ?? -1
  const 观察 = (回放.rows ?? []).filter((行) => (行.cursor ?? 游标 + 1) <= 游标)
  if (!观察.length || 观察[观察.length - 1].cursor !== 游标) return []
  const 末行 = 观察[观察.length - 1],
    真值 = 末行.truth
  if (真值.length !== 原子.length) return []
  const 原规则 = 规范复制(规则),
    实际 = 回放.actual ?? [],
    事件 = 实际[游标] ?? {}
  const 行号 = (事件.macro_line || 0) - 1
  if ((事件.macro_page ?? 1) !== 1) return []
  const 抢占 =
    行号 >= 0 && 行号 < 规则.length && !!末行.rejected_actions?.includes(规则[行号].action)
  const 漏窗 = ['missed_decision_time', 'missed_release_window'].includes(
    回放.probe_failure?.kind ?? '',
  )
  const 提案: { 排序: number[]; 类型: string; 规则: 原生规则[] }[] = [],
    已见 = new Set<string>()
  const 提交 = (类型: string, 候选: 原生规则[], 排序: number[]) => {
    检查()
    const 键 = 程序标识(候选)
    if (!已见.has(键)) {
      已见.add(键)
      提案.push({ 排序, 类型, 规则: 候选 })
    }
  }
  const 替换 = (位置: number, 替换规则: 原生规则[], 类型: string, 排序: number[]) => {
    const 候选 = 规范复制(原规则)
    候选.splice(位置, 1, ...规范复制(替换规则))
    提交(类型, 候选, 排序)
  }
  let 晚于 = (分歧.actual?.time ?? 0) >= (分歧.expected?.time ?? 0)
  let 编辑行 = 抢占 ? [行号] : []
  if (漏窗) {
    编辑行 = 原规则.flatMap((行, i) =>
      末行.allowed?.includes(行.action) && 末行.executable[行.action] ? [i] : [],
    )
    晚于 = true
  }
  const 查表 = new Map(原子.map((文本, i) => [文本, i]))
  for (const i of 编辑行) {
    const 行 = 原规则[i]
    行.atoms.forEach((叶, 位置) => {
      检查()
      if (漏窗 && 真值[叶]) return
      const 匹配 = 计时表达式.exec(原子[叶])
      if (!匹配) return
      const 方向 = 晚于 === (匹配[2] === '<') ? 1 : -1,
        阈值 = Math.round(Number(匹配[3]) * 10)
      ;[方向, -方向, 2 * 方向, -2 * 方向].forEach((偏移, 顺序) => {
        if (阈值 + 偏移 < 0) return
        const 文本 = 匹配[1] + 匹配[2] + Number(((阈值 + 偏移) / 10).toFixed(1)),
          新叶 = 查表.get(文本)
        if (新叶 === undefined || 行.atoms.includes(新叶)) return
        const 新行 = 规范复制([行])[0]
        新行.atoms[位置] = 新叶
        替换(i, [新行], 'repair_threshold', [0, 顺序, 文本.length])
      })
    })
  }
  const 容差 = 回放.comparison?.time_tolerance_seconds ?? 0.125
  if (漏窗 && !编辑行.length)
    原规则.forEach((行, i) => {
      const 唤醒 = [
        ...new Set([
          ...((末行.wake_atoms as readonly number[] | undefined) ?? []),
          ...唤醒门控(原子, 末行, 容差, 行.action, 目录.clock),
        ]),
      ]
      行.atoms.forEach((叶, 位置) => {
        const 原匹配 = 计时表达式.exec(原子[叶])
        if (!原匹配) return
        唤醒.forEach((新叶, 顺序) => {
          const 匹配 = 计时表达式.exec(原子[新叶])
          if (!匹配 || 匹配[1] !== 原匹配[1] || 匹配[2] !== 原匹配[2] || 行.atoms.includes(新叶))
            return
          const 新行 = 规范复制([行])[0]
          新行.atoms[位置] = 新叶
          替换(i, [新行], 'repair_wait_wake', [0, 顺序, i])
        })
      })
    })
  if (抢占) {
    const 行 = 原规则[行号],
      正例: 原生观察行['truth'][] = []
    for (const 点 of 观察) {
      检查()
      const 位置 = 点.cursor ?? 游标
      if (
        位置 >= 0 &&
        位置 < Math.min(游标, 实际.length) &&
        (实际[位置].macro_page ?? 1) === 1 &&
        实际[位置].macro_line === 行号 + 1 &&
        点.allowed?.includes(行.action) &&
        点.truth.length === 原子.length &&
        条件位图(
          行,
          Array.from(点.truth, (值) => (值 ? 一位图 : 空位图)),
          一位图,
        )
      )
        正例.push(点.truth)
    }
    const 时钟 =
      相同动作(分歧.expected ?? {}, 分歧.actual ?? {}) &&
      (分歧.actual?.time ?? 0) < (分歧.expected?.time ?? 0)
        ? 唤醒门控(原子, 末行, 容差, 行.action, 目录.clock, 分歧.expected?.time)
        : []
    const 时钟顺序 = new Map(时钟.map((叶, i) => [叶, i])),
      已用字段 = new Set(行.atoms.map((叶) => 读取字段(原子[叶])))
    const 全正例 = (一位图 << BigInt(正例.length)) - 一位图,
      门控列: [number, 位图][] = []
    Array.from(真值).forEach((值, 叶) => {
      检查()
      if (值 || (行.atoms.includes(叶) && 纯与条件(行))) return
      const 覆盖 = 正例.reduce((位, 点, i) => (点[叶] ? 位 | (一位图 << BigInt(i)) : 位), 空位图)
      if (覆盖 || (!正例.length && 时钟顺序.has(叶))) 门控列.push([叶, 覆盖])
    })
    const 门控排序 = ([叶, 位]: [number, 位图]) => [
      !时钟顺序.has(叶),
      时钟顺序.get(叶) ?? 999,
      已用字段.has(读取字段(原子[叶])),
      -位数统计(位),
      原子[叶].length,
      叶,
    ]
    门控列.sort((a, b) => 比较排序值(门控排序(a), 门控排序(b)))
    const 门控 = (叶: number): 原生规则 => ({
      action: 行.action,
      atoms: [叶, ...行.atoms],
      ops: 行.atoms.length ? ['&', ...行.ops] : [],
    })
    门控列
      .filter(([, 位]) => 位 === 全正例)
      .slice(0, 12)
      .forEach(([叶], i) =>
        替换(行号, [门控(叶)], 时钟顺序.has(叶) ? 'repair_clock_gate' : 'repair_gate', [
          时钟顺序.has(叶) ? 1 : 3,
          i,
          原子[叶].length,
        ]),
      )
    门控列.slice(0, 12).forEach(([第一, 覆盖], i) => {
      if (!正例.length || 覆盖 === 全正例) return
      const 第二 = 门控列.find(([, 位]) => (位 | 覆盖) === 全正例)?.[0]
      if (第二 !== undefined)
        替换(行号, [门控(第一), 门控(第二)], 'repair_split', [
          4,
          i,
          原子[第一].length + 原子[第二].length,
        ])
    })
    if (!正例.length) 替换(行号, [], 'repair_drop_unused', [6, 0, 0])
    for (let i = 行号 + 1; i < 原规则.length; i++) {
      const 行 = 原规则[i]
      if (
        末行.allowed?.includes(行.action) &&
        末行.executable[行.action] &&
        条件位图(
          行,
          Array.from(真值, (值) => (值 ? 一位图 : 空位图)),
          一位图,
        )
      ) {
        const 候选 = 规范复制(原规则),
          [移动] = 候选.splice(i, 1)
        候选.splice(行号, 0, 移动)
        提交('repair_priority', 候选, [2, i - 行号, 0])
      }
    }
  }
  const 允许 = (末行.allowed ?? []).filter((动作) => !!末行.executable[动作])
  if (允许.length) {
    const 全部 = (一位图 << BigInt(观察.length)) - 一位图,
      真值列 = 原子.map(() => 空位图)
    const 可执行 = new Map<number, 位图>(),
      拒绝 = new Map<number, 位图>()
    观察.forEach((行, i) => {
      检查()
      const 位 = 一位图 << BigInt(i)
      Array.from(行.truth).forEach((值, 叶) => {
        if (值) 真值列[叶] |= 位
      })
      for (const 动作 of 允许) {
        if (行.executable[动作]) 可执行.set(动作, (可执行.get(动作) ?? 空位图) | 位)
        if (行.rejected_actions?.includes(动作)) 拒绝.set(动作, (拒绝.get(动作) ?? 空位图) | 位)
      }
    })
    const 样本 = {
      all: 全部,
      truth: 真值列,
      atoms: 原子,
      atom_costs: 原子.map((值) => 值.length),
      check: 检查,
      catalog: 目录,
    }
    let 剩余 = 全部
    const 最后一位 = 一位图 << BigInt(观察.length - 1),
      间隙: [number, 位图][] = []
    for (let i = 0; i <= 原规则.length; i++) {
      if (剩余 & 最后一位) 间隙.push([i, 剩余])
      if (i < 原规则.length) {
        const 行 = 原规则[i]
        const 可放 = 观察.reduce(
          (位, 点, n) => (点.executable[行.action] ? 位 | (一位图 << BigInt(n)) : 位),
          空位图,
        )
        剩余 &= ~(条件位图(行, 真值列, 全部) & 可放)
      }
    }
    间隙.slice(-4)
      .reverse()
      .forEach(([位置, 剩余], 顺序) => {
        for (const 动作 of 允许) {
          const 负例 = 剩余 & (可执行.get(动作) ?? 空位图) & (拒绝.get(动作) ?? 空位图)
          for (const 条件 of 短条件搜索(最后一位, 负例, 样本, {
            maxTerms: 4,
            maxCandidates: 4,
            branchLimit: 12,
            maxStates: 128,
          })) {
            const 候选 = 规范复制(原规则)
            候选.splice(位置, 0, { ...规范规则(条件), action: 动作 })
            提交('repair_coverage', 候选, [2, 顺序, 条件字数(条件, 样本.atom_costs)])
          }
        }
      })
  }
  return 提案
    .sort((a, b) => 比较排序值(a.排序, b.排序))
    .slice(0, 上限)
    .map((项) => [项.类型, 项.规则])
}

export function 计时别名(
  规则: readonly 原生规则[],
  样本: 原生样本,
  输入: 原生压缩回放,
  上限 = 16,
): 原生候选[] {
  const 回放 = 输入 as 修复回放
  if (!回放.comparison?.reproduced || 上限 <= 0) return []
  const [选择] = 样本.选择(规则),
    实际 = 回放.actual ?? [],
    容差 = 回放.comparison.time_tolerance_seconds ?? 0
  const 原规则 = 规范复制(规则)
  const 时钟 = 样本.atoms.flatMap((文本, i) => {
    const 匹配 = 计时表达式.exec(文本)
    return 匹配 ? [{ 叶: i, 匹配 }] : []
  })
  const 提案 = new Map<string, { 排序: number[]; 规则: 原生规则[]; 桶: string; 行: string }>()
  原规则.forEach((行, 行号) => {
    const 旧时钟 = 行.atoms.flatMap((叶, i) => {
      const 匹配 = 计时表达式.exec(样本.atoms[叶])
      return 匹配 ? [{ 位置: i, 匹配 }] : []
    })
    if (!旧时钟.length) return
    let 位图 = 选择[行号]
    while (位图) {
      样本.check()
      const 位 = 位图 & -位图
      位图 ^= 位
      const 点 = 样本.rows[最低位索引(位)],
        游标 = 点.cursor ?? 实际.length
      if (游标 < 0 || 游标 >= 实际.length || 实际[游标].macro_line !== 行号 + 1) continue
      const [最晚, 中心, 时点] = 计时目标(点, 行.action, 容差)
      if (中心 === null || 最晚 === null || 点.time >= 中心 - 1e-5) continue
      const 区间 = new Map<string, [number, number]>(),
        活跃 = new Set<string>()
      for (const { 叶, 匹配 } of 时钟) {
        let [下界, 上界] = 区间.get(匹配[1]) ?? [0, Infinity]
        const 真 = !!(样本.truth[叶] & 位),
          值 = Number(匹配[3])
        if ((匹配[2] === '<' && 真) || (匹配[2] === '>' && !真)) 上界 = Math.min(上界, 值)
        else 下界 = Math.max(下界, 值)
        if (匹配[2] === '>' && 真) 活跃.add(匹配[1])
        区间.set(匹配[1], [下界, 上界])
      }
      for (const { 叶, 匹配 } of 时钟) {
        样本.check()
        if (匹配[2] !== '<' || 样本.truth[叶] & 位 || !活跃.has(匹配[1])) continue
        const [下界, 上界] = 区间.get(匹配[1])!,
          阈值 = Number(匹配[3])
        const 最早 = 点.time + 下界 - 阈值,
          末尾 = 点.time + 上界 - 阈值
        const 交点 = 时点?.filter((时间) => 最早 <= 时间 && 时间 <= 末尾)
        if (下界 > 上界 || (时点 === null ? 末尾 < 中心 - 容差 || 最早 > 最晚 : !交点!.length))
          continue
        const 距离 =
          时点 === null
            ? Math.abs((Math.max(点.time, 最早) + Math.min(最晚, 末尾)) / 2 - 中心)
            : Math.min(
                ...交点!.map((时间) =>
                  Math.abs((Math.max(点.time, 最早) + Math.min(时间, 末尾)) / 2 - 时间),
                ),
              )
        for (const { 位置, 匹配: 旧 } of 旧时钟) {
          if (行.atoms.includes(叶) || 匹配[2] !== 旧[2]) continue
          const 候选 = 规范复制(原规则)
          候选[行号].atoms[位置] = 叶
          const 成本 = 样本.规则成本(候选[行号]) - 样本.规则成本(行)
          if (成本 > 0) continue
          const 键 = 程序标识(候选),
            排序 = [距离, 成本, 行号, 叶, 位置]
          if (!提案.has(键) || 比较排序值(排序, 提案.get(键)!.排序) < 0)
            提案.set(键, {
              排序,
              规则: 候选,
              桶: `${行.action};${行号};${匹配[1]}`,
              行: `${行.action};${行号}`,
            })
        }
      }
    }
  })
  type 条目 = { 排序: number[]; 规则: 原生规则[]; 桶: string; 行: string }
  const 桶 = new Map<string, 条目[]>(),
    行桶 = new Map<string, 条目[][]>()
  for (const 项 of [...提案.values()].sort((a, b) => 比较排序值(a.排序, b.排序))) {
    const 队列 = 桶.get(项.桶) ?? []
    队列.push(项)
    桶.set(项.桶, 队列)
  }
  for (const 队列 of 桶.values()) {
    const 组 = 行桶.get(队列[0].行) ?? []
    组.push(队列)
    行桶.set(队列[0].行, 组)
  }
  const 结果: 原生候选[] = []
  while (结果.length < 上限) {
    let 已加入 = false
    for (const 组 of 行桶.values()) {
      样本.check()
      const 可用 = 组.filter((队列) => 队列.length).sort((a, b) => 比较排序值(a[0].排序, b[0].排序))
      if (!可用.length) continue
      const 队列 = 可用[0],
        项 = 队列.shift()!
      组.splice(组.indexOf(队列), 1)
      组.push(队列)
      结果.push(['beam_timing_alias', 项.规则])
      已加入 = true
      if (结果.length >= 上限) break
    }
    if (!已加入) break
  }
  return 结果
}
