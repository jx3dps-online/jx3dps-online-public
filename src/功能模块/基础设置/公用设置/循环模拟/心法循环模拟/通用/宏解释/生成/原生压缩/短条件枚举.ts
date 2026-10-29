import type { 原生条件, 原生候选, 原生规则, 位图 } from './类型'
import type { 原生样本 } from './样本'
import { 条件字数 } from './条件'
import { 复制规则 } from './基础候选'

// 仅按成本和必要真值剪枝；相同真值的计时原子仍分别枚举，保留不同唤醒行为。
export async function* 枚举短条件(
  正例: 位图,
  负例: 位图,
  样本: 原生样本,
  成本上界: number,
  控制: () => Promise<void>,
): AsyncGenerator<原生条件> {
  if (!正例 || 正例 & 负例 || 成本上界 <= 0) return
  await 控制()
  if (!负例) yield { atoms: [] }
  const 成本组 = new Map<number, number[]>()
  const 与项 = new Set<number>(),
    或项 = new Set<number>()
  let 工作量 = 0
  for (let i = 0; i < 样本.atoms.length; i++) {
    if (++工作量 % 256 === 0) await 控制()
    const 成本 = 样本.atom_costs[i]
    if (成本 + 1 >= 成本上界) continue
    const 真值 = 样本.truth[i]
    if (!(正例 & ~真值)) 与项.add(i)
    if (!(负例 & 真值)) 或项.add(i)
    if (!与项.has(i) && !或项.has(i)) continue
    const 组 = 成本组.get(成本) ?? []
    组.push(i)
    成本组.set(成本, 组)
  }
  const 成本列表 = [...成本组.keys()].sort((a, b) => a - b)
  for (let 成本 = 1; 成本 < 成本上界; 成本++) {
    for (const i of 成本组.get(成本 - 1) ?? []) {
      if (++工作量 % 256 === 0) await 控制()
      if (与项.has(i) && 或项.has(i)) yield { atoms: [i] }
    }
    for (const 左成本 of 成本列表) {
      const 右成本 = 成本 - 2 - 左成本
      if (左成本 > 右成本) break
      const 右组 = 成本组.get(右成本)
      if (!右组) continue
      for (const 左 of 成本组.get(左成本)!) {
        for (const 右 of 右组) {
          if (++工作量 % 256 === 0) await 控制()
          if (左 === 右 || (左成本 === 右成本 && 左 > 右)) continue
          if (与项.has(左) && 与项.has(右) && !(负例 & 样本.truth[左] & 样本.truth[右]))
            yield { atoms: [左, 右], ops: ['&'] }
          if (或项.has(左) && 或项.has(右) && !(正例 & ~(样本.truth[左] | 样本.truth[右])))
            yield { atoms: [左, 右], ops: ['|'] }
        }
      }
    }
  }
}

export async function* 短条件替换(
  规则: 原生规则[],
  样本: 原生样本,
  控制: () => Promise<void>,
): AsyncGenerator<原生候选> {
  const [选择] = 样本.选择(规则)
  let 剩余 = 样本.all
  for (let i = 0; i < 规则.length; i++) {
    const 行 = 规则[i]
    const 负例 = 剩余 & 样本.executable[行.action] & 样本.rejected[行.action]
    for await (const 条件 of 枚举短条件(选择[i], 负例, 样本, 条件字数(行, 样本.atom_costs), 控制)) {
      const 提案 = 复制规则(规则)
      提案[i] = { action: 行.action, ...条件 }
      yield ['short_guard_enumeration', 提案]
    }
    剩余 &= ~选择[i]
  }
}
