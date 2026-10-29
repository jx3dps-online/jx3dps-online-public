import type { 原生候选, 原生规则 } from './类型'
import { 空位图, 一位图 } from './类型'
import type { 原生样本 } from './样本'
import { 纯与条件 } from './条件'

export interface 有限求解请求 {
  smt: string
  variables: string[]
  limit: number
  timeout: number
}

export interface 有限求解结果 {
  models: boolean[][]
  checks: { status: string; solve_ms: number; reason?: string }[]
}

export type 有限求解 = (请求: 有限求解请求) => Promise<有限求解结果>

const 或 = (项: string[]) =>
  项.length ? (项.length === 1 ? 项[0] : `(or ${项.join(' ')})`) : 'false'
const 与 = (项: string[]) =>
  项.length ? (项.length === 1 ? 项[0] : `(and ${项.join(' ')})`) : 'true'
const 非 = (项: string) => `(not ${项})`
const 权重约束 = (类型: 'pble' | 'pbeq', 项: [string, number][], 上界: number) =>
  项.length
    ? `((_ ${类型} ${上界} ${项.map(([, 权重]) => 权重).join(' ')}) ${项.map(([变量]) => 变量).join(' ')})`
    : String(类型 === 'pbeq' ? 上界 === 0 : 上界 >= 0)
const 复制 = (规则: 原生规则[]) =>
  规则.map((行) => ({ ...行, atoms: [...行.atoms], ops: 行.ops && [...行.ops] }))
const 字符数 = (文本: string) => 文本.length

export async function* 局部重写(
  规则: 原生规则[],
  样本: 原生样本,
  渲染: (规则: 原生规则[]) => string,
  求解: 有限求解,
  诊断: (消息: Record<string, unknown>) => void,
): AsyncGenerator<原生候选> {
  const [选中] = 样本.选择(规则)
  for (let 起点 = 0; 起点 < 规则.length - 1; 起点++) {
    样本.check()
    const 窗口 = 规则.slice(起点, 起点 + 3)
    if (窗口.some((行) => !纯与条件(行))) continue
    const 区域 = 选中.slice(起点, 起点 + 窗口.length).reduce((值, 位) => 值 | 位, 空位图)
    if (!区域) continue
    const 动作 = [...new Set(窗口.map((行) => 行.action))].sort((a, b) => a - b)
    for (const 索引 of [...动作]) {
      const 当前 = 样本.actions[索引]
      if (当前.fcast)
        样本.actions.forEach((项, i) => {
          if (!项.fcast && 项.name === 当前.name && !动作.includes(i)) 动作.push(i)
        })
    }
    if (样本.short_features == null) {
      const 签名 = new Map<bigint, number>()
      样本.truth.forEach((位, i) => {
        if (!位 || 位 === 样本.all) return
        const 原 = 签名.get(位)
        if (原 === undefined || 样本.atom_costs[i] < 样本.atom_costs[原]) 签名.set(位, i)
      })
      样本.short_features = [...签名.values()]
        .sort((a, b) => 样本.atom_costs[a] - 样本.atom_costs[b] || a - b)
        .slice(0, 24)
    }
    const 原子 = [...new Set([...窗口.flatMap((行) => 行.atoms), ...样本.short_features])].sort(
      (a, b) => a - b,
    )
    if (原子.length > 64) {
      诊断({ kind: 'local_sat', start: 起点, status: 'skipped_large_window' })
      continue
    }
    const 语句: string[] = []
    const 变量: string[] = []
    const 权重: [string, number][] = []
    const 声明 = (名称: string) => {
      语句.push(`(declare-fun ${名称} () Bool)`)
      return 名称
    }
    const 断言 = (式: string) => {
      语句.push(`(assert ${式})`)
    }
    const 槽 = 窗口.map((_, i) => {
      const acts = new Map(动作.map((a) => [a, 声明(`a_${i}_${a}`)]))
      const cond = new Map(原子.map((k) => [k, 声明(`c_${i}_${k}`)]))
      const on = 声明(`on_${i}`)
      const guard = 声明(`guard_${i}`)
      断言(
        权重约束(
          'pbeq',
          [...acts.values()].map((v) => [v, 1]),
          1,
        ),
      )
      断言(`(= ${guard} ${或([...cond.values()])})`)
      断言(`(=> ${非(on)} ${非(guard)})`)
      if (i) 断言(`(=> ${on} on_${i - 1})`)
      if (cond.size)
        断言(
          权重约束(
            'pble',
            [...cond.values()].map((v) => [v, 1]),
            3,
          ),
        )
      for (const [a, v] of acts)
        权重.push([
          与([on, v]),
          字符数(`/${样本.actions[a].fcast ? 'fcast' : 'cast'} ${样本.actions[a].name}`) + 1,
        ])
      for (const [k, v] of cond) 权重.push([v, 字符数(样本.atoms[k]) + 1])
      变量.push(on, ...acts.values(), ...cond.values())
      return { acts, cond, on }
    })
    断言(或(槽.map((项) => 项.on)))
    断言(权重约束('pble', 权重, 字符数(渲染(窗口))))
    const 前缀 = 规则.slice(0, 起点)
    const 后缀 = 规则.slice(起点 + 窗口.length)
    const [, 剩余] = 样本.选择(前缀)
    const [后缀选中] = 样本.选择(后缀)
    const 已满足 = new Set(
      [...样本.groups].filter(([, 位]) => !!(位 & ~剩余)).map(([游标]) => 游标),
    )
    const 编码 = new Map<string, string>()
    const 游标覆盖 = new Map<number, Set<string>>()
    for (let 行号 = 0; 行号 < 样本.rows.length; 行号++) {
      样本.check()
      const 位 = 一位图 << BigInt(行号)
      if (!(剩余 & 位)) continue
      const 行 = 样本.rows[行号]
      const 命中行 = 后缀选中.findIndex((值) => !!(值 & 位))
      const 后缀动作 = 命中行 < 0 ? undefined : 后缀[命中行].action
      const 禁止 = 动作.filter((a) => !!(样本.rejected[a] & 位))
      const 后缀错误 = 后缀动作 !== undefined && !!(样本.rejected[后缀动作] & 位)
      const 必须 = !!(样本.required & 位)
      const 真值 = 原子.map((k) => !!(样本.truth[k] & 位))
      const 可执行 = 动作.filter((a) => !!(样本.executable[a] & 位))
      const 键 = JSON.stringify([真值, 可执行, 禁止, 后缀动作, 后缀错误, 必须])
      let 覆盖 = 编码.get(键)
      if (!覆盖) {
        let 更早 = 'false'
        const 编号 = 编码.size
        for (let i = 0; i < 槽.length; i++) {
          const { acts, cond, on } = 槽[i]
          const 命中 = `hit_${编号}_${i}`
          const 表达式 = 与([
            on,
            或(可执行.map((a) => acts.get(a)!)),
            非(或(原子.filter((_, j) => !真值[j]).map((k) => cond.get(k)!))),
          ])
          语句.push(`(define-fun ${命中} () Bool ${表达式})`)
          断言(非(与([命中, 非(更早), 或(禁止.map((a) => acts.get(a)!))])))
          更早 = 或([更早, 命中])
        }
        if (后缀错误 || (后缀动作 === undefined && 必须)) 断言(更早)
        覆盖 = `covered_${编号}`
        语句.push(
          `(define-fun ${覆盖} () Bool ${或([更早, String(后缀动作 !== undefined && !后缀错误)])})`,
        )
        编码.set(键, 覆盖)
      }
      const 游标 = 行.cursor ?? 行号
      if (!已满足.has(游标) && (样本.groups.get(游标) ?? 空位图) & 位) {
        const 集合 = 游标覆盖.get(游标) ?? new Set<string>()
        集合.add(覆盖)
        游标覆盖.set(游标, 集合)
      }
    }
    for (const 集合 of 游标覆盖.values()) 断言(或([...集合]))
    样本.check()
    const 结果 = await 求解({ smt: 语句.join('\n'), variables: 变量, limit: 3, timeout: 1000 })
    样本.check()
    结果.checks.forEach((检查, 模型) =>
      诊断({
        kind: 'local_sat',
        start: 起点,
        model: 模型,
        slots: 槽.length,
        atoms: 原子.length,
        ...检查,
      }),
    )
    // 每窗模型一次收集完成再回放，避免 Z3 超时状态跨候选 await 保留。
    for (const 模型 of 结果.models) {
      const 取值 = new Map(变量.map((名称, i) => [名称, 模型[i]]))
      const 替代 = 槽
        .filter((项) => 取值.get(项.on))
        .map(({ acts, cond }) => ({
          action: [...acts].find(([, v]) => 取值.get(v))![0],
          atoms: [...cond].filter(([, v]) => 取值.get(v)).map(([k]) => k),
        }))
      yield ['local_sat_rewrite', [...复制(前缀), ...替代, ...复制(后缀)]]
    }
  }
}
