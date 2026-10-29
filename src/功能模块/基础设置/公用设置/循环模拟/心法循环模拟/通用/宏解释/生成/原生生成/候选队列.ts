import type { 候选流, 候选来源, 生成候选 } from './类型'
import { 搜索存储, 请求结果 } from './搜索存储'
import { 文本指纹 } from '../身份'

interface 队列项 extends 候选来源 {
  id: number
  previous: number
  next: number
  position: number
  fair_ticket: number
  priority: number
  descriptor: Record<string, any>
  expanded?: boolean
}

// 冷分支只保存描述及游标；迭代器由不可变样本重建，缓存淘汰不删除搜索分支。
export class 公平队列 {
  pending = 0
  private head = 0
  private exhausted = 0
  private registered = 0
  private steps = 0
  private ticket = 0
  private serial = 0
  private readonly active = new Map<number, Iterator<生成候选 | null>>()
  private readonly 链接缓存 = new Map<number, Pick<队列项, 'next' | 'priority'>>()

  constructor(
    private readonly storage: 搜索存储,
    private readonly restore: (描述: Record<string, any>) => Promise<候选流>,
    private readonly control: () => Promise<void>,
  ) {}

  private 缓存链接(项: 队列项) {
    if (!this.链接缓存.has(项.id) && this.链接缓存.size >= 2048)
      this.链接缓存.delete(this.链接缓存.keys().next().value!)
    this.链接缓存.set(项.id, { next: 项.next, priority: 项.priority })
  }

  async 登记(身份: unknown, 描述: Record<string, any>, 来源: 候选来源) {
    return (await this.登记批次([{ 身份, 描述, 来源 }])) > 0
  }

  async 登记批次(批次: { 身份: unknown; 描述: Record<string, any>; 来源: 候选来源 }[]) {
    const 键列表 = await Promise.all(
      批次.map(async ({ 身份 }) => ['registered', await 文本指纹(JSON.stringify(身份))]),
    )
    const 更新: 队列项[] = []
    const 已添加 = await this.storage.事务(
      ['data', 'queue'],
      async (事务) => {
        const 数据 = 事务.objectStore('data'),
          队列 = 事务.objectStore('queue')
        let 数量 = 0
        const 首id = this.pending ? this.head : this.serial + 1
        for (let i = 0; i < 批次.length; i++) {
          if (await 请求结果(数据.get(键列表[i]))) continue
          const { 来源, 描述 } = 批次[i]
          const id = this.serial + 数量 + 1
          const 新项: 队列项 = {
            ...来源,
            id,
            previous: id,
            next: id,
            position: 0,
            fair_ticket: this.ticket + 数量 + 1,
            priority: 来源.priority ?? 0,
            descriptor: 描述,
          }
          if (this.pending + 数量) {
            const 首项: 队列项 = await 请求结果(队列.get(首id))
            const 尾项: 队列项 =
              首项.previous === 首项.id ? 首项 : await 请求结果(队列.get(首项.previous))
            新项.previous = 尾项.id
            新项.next = 首项.id
            尾项.next = 新项.id
            首项.previous = 新项.id
            await 请求结果(队列.put(尾项))
            await 请求结果(队列.put(首项))
            更新.push(尾项, 首项)
          }
          await 请求结果(队列.put(新项))
          更新.push(新项)
          await 请求结果(数据.put(true, 键列表[i]))
          数量++
        }
        return 数量
      },
      true,
    )
    if (!已添加) return 0
    for (const 项 of 更新) this.缓存链接(项)
    if (!this.pending) this.head = this.serial + 1
    this.pending += 已添加
    this.registered += 已添加
    this.serial += 已添加
    this.ticket += 已添加
    return 已添加
  }

  private async 选择(优先: boolean) {
    return this.storage.事务(['queue'], async (事务) => {
      const 队列 = 事务.objectStore('queue')
      const 最值 = await 请求结果(
        队列.index(优先 ? 'priority' : 'fair_ticket').openCursor(null, 优先 ? 'prev' : 'next'),
      )
      if (!优先) return 最值!.value as 队列项
      const 目标 = 最值!.key
      let id = this.head
      while (true) {
        let 链接 = this.链接缓存.get(id)
        let 当前: 队列项 | undefined
        if (!链接) {
          当前 = await 请求结果(队列.get(id))
          this.缓存链接(当前!)
          链接 = 当前!
        }
        if (链接.priority === 目标) return 当前 ?? 请求结果<队列项>(队列.get(id))
        id = 链接.next
      }
    })
  }

  private async 迭代器(项: 队列项) {
    let 流 = this.active.get(项.id)
    if (流) {
      this.active.delete(项.id)
      this.active.set(项.id, 流)
      return 流
    }
    if (this.active.size >= 8) this.active.delete(this.active.keys().next().value!)
    流 = (项.expanded ? [] : await this.restore(项.descriptor))[Symbol.iterator]()
    if (项.descriptor.kind !== 'expand')
      for (let i = 0; i < 项.position; i++) {
        if (!(i % 64)) await this.control()
        if (流.next().done) throw new Error('宏搜索分支无法恢复到已保存游标')
      }
    this.active.set(项.id, 流)
    return 流
  }

  async 推进(
    份额 = 64,
  ): Promise<{ scope_exhausted?: boolean; item?: 生成候选; source?: 候选来源 }> {
    for (let 次数 = 0; 次数 < 份额; 次数++) {
      if (!this.pending) return { scope_exhausted: true }
      await this.control()
      const 优先 = ++this.steps % 4 !== 0
      const 当前 = await this.选择(优先)
      if (!优先) 当前.fair_ticket = ++this.ticket
      const 流 = await this.迭代器(当前)
      const 下个 = 流.next()
      const 更新: 队列项[] = []
      await this.storage.事务(
        ['queue'],
        async (事务) => {
          const 队列 = 事务.objectStore('queue')
          if (下个.done) {
            if (this.pending > 1) {
              const 前项: 队列项 = await 请求结果(队列.get(当前.previous))
              const 后项: 队列项 =
                当前.next === 前项.id ? 前项 : await 请求结果(队列.get(当前.next))
              前项.next = 当前.next
              后项.previous = 当前.previous
              await 请求结果(队列.put(前项))
              await 请求结果(队列.put(后项))
              更新.push(前项, 后项)
            }
            await 请求结果(队列.delete(当前.id))
          } else {
            当前.position++
            if (下个.value?.expand_atoms) 当前.expanded = true
            await 请求结果(队列.put(当前))
          }
        },
        true,
      )
      for (const 项 of 更新) this.缓存链接(项)
      this.head = 当前.next
      if (下个.done) {
        this.active.delete(当前.id)
        this.链接缓存.delete(当前.id)
        this.pending--
        this.exhausted++
        continue
      }
      const { descriptor, next, previous, expanded, ...来源 } = 当前
      if (下个.value !== null) return { item: 下个.value, source: 来源 }
    }
    return {}
  }

  释放() {
    this.active.clear()
    this.链接缓存.clear()
  }

  诊断() {
    return {
      steps: this.steps,
      pending: this.pending,
      exhausted: this.exhausted,
      registered: this.registered,
      active: this.active.size,
      storage: 'indexeddb',
    }
  }
}
