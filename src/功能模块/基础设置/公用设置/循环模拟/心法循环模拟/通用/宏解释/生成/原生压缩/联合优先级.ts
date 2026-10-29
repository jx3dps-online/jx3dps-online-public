import type { 原生候选, 原生规则 } from './类型'
import type { 原生样本 } from './样本'
import { 条件字数, 规范规则 } from './条件'
import { 复制规则, 删除链原子 } from './基础候选'
import { 枚举短条件 } from './短条件枚举'

export async function* 联合优先级(
  规则: 原生规则[],
  样本: 原生样本,
  控制: () => Promise<void>,
): AsyncGenerator<原生候选> {
  const [原选择] = 样本.选择(规则)
  const 成本 = 规则.map((行) => 条件字数(行, 样本.atom_costs))
  const 原成本 = 成本.reduce((和, 值) => 和 + 值, 0)
  for (let 来源 = 规则.length - 1; 来源 >= 0; 来源--) {
    if (!原选择[来源]) continue
    for (let 位置 = 0; 位置 < 规则.length; 位置++) {
      await 控制()
      if (位置 === 来源) continue
      const 左 = Math.min(位置, 来源),
        右 = Math.max(位置, 来源)
      const 可节省 = 成本.slice(左, 右 + 1).reduce((和, 值) => 和 + 值, 0) - 成本[来源]
      if (!可节省) continue
      const 保留 = 复制规则(规则),
        [移动] = 保留.splice(来源, 1)
      const [, 可达] = 样本.选择(保留.slice(0, 位置))
      const 正例 = 原选择[来源] & 可达
      const 负例 = 可达 & 样本.executable[移动.action] & 样本.rejected[移动.action]
      for await (const 条件 of 枚举短条件(正例, 负例, 样本, 成本[来源] + 可节省, 控制)) {
        const 提案 = 复制规则(保留)
        提案.splice(位置, 0, { action: 移动.action, ...条件 })
        if (!样本.兼容(提案)) continue
        // 先允许移动行变长；在新优先级下逐步简化被跨过的行，最后比较整份宏。
        for (let i = 左; i <= 右; i++) {
          if (i === 位置 || !提案[i].atoms.length) continue
          await 控制()
          const 原行 = 提案[i]
          提案[i] = { action: 原行.action, atoms: [] }
          if (样本.兼容(提案)) continue
          提案[i] = { action: 原行.action, ...规范规则(原行) }
          for (let k = 提案[i].atoms.length - 1; k >= 0; k--) {
            await 控制()
            const 前 = 提案[i]
            提案[i] = 删除链原子(前, k)
            if (!样本.兼容(提案)) 提案[i] = 前
          }
        }
        if (提案.reduce((和, 行) => 和 + 条件字数(行, 样本.atom_costs), 0) < 原成本)
          yield ['joint_priority_guard', 提案]
      }
    }
  }
}
