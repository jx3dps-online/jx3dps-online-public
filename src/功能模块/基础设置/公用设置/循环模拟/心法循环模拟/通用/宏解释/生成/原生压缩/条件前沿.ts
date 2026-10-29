import type { 条件连接, 位图 } from './类型'
import { 空位图, 一位图 } from './类型'

export type 条件链 = readonly [number[], 条件连接[]]
export type 条件分支项 = readonly [boolean, number, number, number, 位图[], 位图]
export type 条件分支 = readonly [条件连接, 条件分支项]
type 前沿状态 = {
  偏离: number
  原子: number[]
  连接: 条件连接[]
  窗口: 位图[]
  负例: 位图
  分支: readonly 条件分支[] | null
  偏移: number
}
type 队列项 = { 优先级: number; 深度: number; 成本: number; 序号: number; 状态: 前沿状态 }

export class 条件前沿 {
  private 队列: 队列项[] = []
  private 序号 = 0
  private 状态数 = 0
  private 对数 = 0
  private 最佳: 条件链[] = []
  private 尾部缓存 = new Map<string, 条件链[]>()
  constructor(
    窗口: 位图[],
    负例: 位图,
    private 位图列: readonly 位图[],
    private 原子池: readonly number[],
    private 成本: readonly number[],
    private 最大项数: number,
    private 根分支: (窗口: 位图[], 负例: 位图) => readonly [条件链[], 条件分支[]],
    private 剪枝: (链: 条件链[]) => 条件链[],
    private 检查: () => void,
  ) {
    this.加入({ 偏离: 0, 原子: [], 连接: [], 窗口, 负例, 分支: null, 偏移: 0 })
  }
  private 排序(a: 队列项, b: 队列项) {
    return a.优先级 - b.优先级 || b.深度 - a.深度 || a.成本 - b.成本 || a.序号 - b.序号
  }
  private 加入(状态: 前沿状态) {
    if (状态.分支 && 状态.偏移 >= 状态.分支.length) return
    const 原子 = 状态.分支?.[状态.偏移][1][3]
    const 项: 队列项 = {
      优先级: 状态.偏离 + (状态.分支 ? 状态.偏移 : 0),
      深度: 状态.原子.length + (状态.分支 ? 1 : 0),
      成本:
        状态.原子.reduce((总, k) => 总 + this.成本[k] + 1, 0) +
        (原子 === undefined ? 0 : this.成本[原子] + 1),
      序号: ++this.序号,
      状态,
    }
    this.队列.push(项)
    let i = this.队列.length - 1
    while (i > 0) {
      const 父 = (i - 1) >> 1
      if (this.排序(this.队列[父], 项) <= 0) break
      this.队列[i] = this.队列[父]
      i = 父
    }
    this.队列[i] = 项
  }
  private 取出() {
    const 末尾 = this.队列.pop()!
    if (!this.队列.length) return
    let i = 0
    while (i * 2 + 1 < this.队列.length) {
      let 子 = i * 2 + 1
      if (子 + 1 < this.队列.length && this.排序(this.队列[子 + 1], this.队列[子]) < 0) 子++
      if (this.排序(末尾, this.队列[子]) <= 0) break
      this.队列[i] = this.队列[子]
      i = 子
    }
    this.队列[i] = 末尾
  }
  private 尾部(窗口: 位图[], 负例: 位图, 余量: number, 已用: number[]) {
    const 键 = `${窗口.join(',')};${负例};${Math.min(余量, 2)};${[...已用].sort((a, b) => a - b).join(',')}`
    const 缓存 = this.尾部缓存.get(键)
    if (缓存) return 缓存
    if (!负例) return [[[], []]] as 条件链[]
    const 分组 = new Map<位图, number[]>()
    for (let i = 0; i < this.原子池.length; i++) {
      if (i % 64 === 0) this.检查()
      const k = this.原子池[i]
      if (已用.includes(k)) continue
      const 组 = 分组.get(this.位图列[k]) ?? []
      组.push(k)
      分组.set(this.位图列[k], 组)
    }
    let 结果: 条件链[] = []
    const 与列: 位图[] = []
    const 或列: [位图, 位图][] = []
    const 全部 = (一位图 << BigInt(窗口.length)) - 一位图
    for (const [列, 原子] of 分组) {
      this.检查()
      let 覆盖 = 空位图
      窗口.forEach((位, i) => {
        if (位 & 列) 覆盖 |= 一位图 << BigInt(i)
      })
      if (覆盖 === 全部) {
        与列.push(列)
        if (!(列 & 负例)) 结果.push(...原子.map((k): 条件链 => [[k], []]))
      }
      if (!(列 & 负例) && 覆盖) 或列.push([列, 覆盖])
    }
    if (余量 > 1) {
      for (const 类型 of ['&', '|'] as const) {
        const 条目 = 类型 === '&' ? 与列.map((列): [位图, 位图] => [列, 空位图]) : 或列
        for (let i = 0; i < 条目.length; i++)
          for (let j = i; j < 条目.length; j++) {
            if (++this.对数 % 128 === 0) this.检查()
            const [a, ac] = 条目[i],
              [b, bc] = 条目[j]
            const 合法 =
              类型 === '&'
                ? !(a & b & 负例) && 窗口.every((位) => !!(位 & a & b))
                : (ac | bc) === 全部
            if (!合法) continue
            for (const 左 of 分组.get(a)!) {
              for (const 右 of 分组.get(b)!)
                if (左 !== 右) 结果.push([[左, 右].sort((x, y) => x - y), [类型]])
              this.检查()
            }
            if (结果.length > 256) 结果 = this.剪枝(结果)
          }
      }
    }
    结果 = this.剪枝(结果)
    this.尾部缓存.set(键, 结果)
    return 结果
  }
  推进(限额: number) {
    const 起点 = this.状态数
    while (this.队列.length && this.状态数 - 起点 < 限额) {
      this.检查()
      const 待处理 = this.队列[0].状态
      let { 偏离, 原子, 连接, 窗口, 负例 } = 待处理
      if (待处理.分支) {
        const [符号, [, , , k, 新窗口, 新负例]] = 待处理.分支[待处理.偏移]
        if (原子.includes(k)) {
          this.取出()
          this.加入({ ...待处理, 偏移: 待处理.偏移 + 1 })
          continue
        }
        原子 = [...原子, k]
        连接 = [...连接, 符号]
        窗口 = 新窗口
        负例 = 新负例
        偏离 += 待处理.偏移
      }
      const 余量 = this.最大项数 - 原子.length
      const 结果 = this.尾部(窗口, 负例, 余量, 原子).map(([尾, 尾连接]): 条件链 => {
        let 后缀 = [...尾],
          后缀连接 = [...尾连接]
        for (let i = 原子.length - 1; i >= 0; i--) {
          if (!后缀.length) {
            if (连接[i] === '&') 后缀 = [原子[i]]
          } else {
            后缀 = [原子[i], ...后缀]
            后缀连接 = [连接[i], ...后缀连接]
          }
        }
        return [后缀, 后缀连接]
      })
      const 子分支 = 余量 > 2 ? this.根分支(窗口, 负例)[1] : []
      const 更新 = this.剪枝([...this.最佳, ...结果])
      this.取出()
      if (待处理.分支) this.加入({ ...待处理, 偏移: 待处理.偏移 + 1 })
      this.最佳 = 更新
      this.状态数++
      if (子分支.length) this.加入({ 偏离, 原子, 连接, 窗口, 负例, 分支: 子分支, 偏移: 0 })
    }
    return this.最佳
  }
  诊断() {
    return {
      status: this.队列.length ? 'pending' : 'scope_exhausted',
      found: !!this.最佳.length,
      states: this.状态数,
      pending: this.队列.length,
      pair_checks: this.对数,
      tail_queries: this.尾部缓存.size,
    }
  }
}
