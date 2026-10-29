const 数据库名 = (任务id: string) => 'jx3-macro-search-' + 任务id

export const 请求结果 = <T>(请求: IDBRequest<T>): Promise<T> =>
  new Promise((解决, 拒绝) => {
    请求.onsuccess = () => 解决(请求.result)
    请求.onerror = () => 拒绝(请求.error)
  })

export const 删除搜索存储 = (任务id: string) => 请求结果(indexedDB.deleteDatabase(数据库名(任务id)))

// 仅存本次搜索的可重建数据，不涉及角色或配装存档。
export class 搜索存储 {
  private 数据库?: Promise<IDBDatabase>
  constructor(readonly 任务id: string = crypto.randomUUID()) {}

  private 打开() {
    this.数据库 ??= new Promise<IDBDatabase>((解决, 拒绝) => {
      const 请求 = indexedDB.open(数据库名(this.任务id), 1)
      请求.onupgradeneeded = () => {
        请求.result.createObjectStore('data')
        const 队列 = 请求.result.createObjectStore('queue', { keyPath: 'id' })
        队列.createIndex('priority', 'priority')
        队列.createIndex('fair_ticket', 'fair_ticket')
      }
      请求.onsuccess = () => {
        请求.result.onversionchange = () => 请求.result.close()
        解决(请求.result)
      }
      请求.onerror = () => 拒绝(请求.error)
    })
    return this.数据库
  }

  async 事务<T>(
    表: string[],
    操作: (事务: IDBTransaction) => Promise<T>,
    写入 = false,
  ): Promise<T> {
    const 数据库 = await this.打开()
    return new Promise<T>((解决, 拒绝) => {
      const 事务 = 数据库.transaction(表, 写入 ? 'readwrite' : 'readonly')
      let 结果: T
      事务.oncomplete = () => 解决(结果)
      事务.onabort = () => 拒绝(事务.error ?? new Error('宏搜索临时存储事务中止'))
      void 操作(事务).then(
        (值) => {
          结果 = 值
        },
        (错误) => {
          拒绝(错误)
          事务.abort()
        },
      )
    })
  }

  读取<T>(键: IDBValidKey): Promise<T | undefined> {
    return this.事务(['data'], (事务) => 请求结果(事务.objectStore('data').get(键)))
  }

  async 保存(键: IDBValidKey, 值: unknown) {
    await this.事务(['data'], (事务) => 请求结果(事务.objectStore('data').put(值, 键)), true)
  }

  async *遍历<T>(前缀: string): AsyncGenerator<T> {
    let 下界: IDBValidKey = [前缀]
    while (true) {
      const 批次 = await this.事务(['data'], async (事务) => {
        const 表 = 事务.objectStore('data')
        const 范围 = IDBKeyRange.bound(下界, [前缀, []], true, true)
        const 键 = await 请求结果(表.getAllKeys(范围, 32))
        const 值 = (await 请求结果(表.getAll(范围, 32))) as T[]
        return { 键, 值 }
      })
      if (!批次.键.length) return
      yield* 批次.值
      下界 = 批次.键[批次.键.length - 1]
    }
  }

  async 清空() {
    await this.事务(
      ['data', 'queue'],
      async (事务) => {
        await 请求结果(事务.objectStore('data').clear())
        await 请求结果(事务.objectStore('queue').clear())
      },
      true,
    )
  }

  async 关闭() {
    if (this.数据库) (await this.数据库).close()
    await 删除搜索存储(this.任务id)
  }
}
