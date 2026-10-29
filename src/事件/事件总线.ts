export type 事件监听器<载荷 = any> = (载荷: 载荷) => void

/**
 * 通用事件总线（泛型）
 * 与业务解耦，任何模块均可订阅/派发；由 ESM 模块缓存保证全应用单实例
 */
export class 事件总线<事件映射 extends Record<string, any>> {
  private 监听器 = new Map<keyof 事件映射, Set<事件监听器>>()

  // 缓冲每个事件最近一次载荷，供晚订阅者补发（解决事件早于订阅触发的竞态）
  private 最近事件 = new Map<keyof 事件映射, any>()

  /**
   * 订阅事件，返回取消订阅函数
   * 若该事件此前已触发过，则立即补发最近一次
   */
  on<K extends keyof 事件映射>(事件: K, 监听器: 事件监听器<事件映射[K]>): () => void {
    if (!this.监听器.has(事件)) {
      this.监听器.set(事件, new Set())
    }
    this.监听器.get(事件)!.add(监听器 as 事件监听器)

    if (this.最近事件.has(事件)) {
      监听器(this.最近事件.get(事件) as 事件映射[K])
    }

    return () => this.off(事件, 监听器)
  }

  /**
   * 订阅一次，触发后自动取消
   */
  once<K extends keyof 事件映射>(事件: K, 监听器: 事件监听器<事件映射[K]>): () => void {
    const 包装监听器 = (载荷: 事件映射[K]) => {
      监听器(载荷)
      this.off(事件, 包装监听器)
    }
    return this.on(事件, 包装监听器)
  }

  /**
   * 派发事件
   */
  emit<K extends keyof 事件映射>(事件: K, 载荷: 事件映射[K]): void {
    this.最近事件.set(事件, 载荷)

    const 监听器集合 = this.监听器.get(事件)
    if (监听器集合) {
      监听器集合.forEach((监听器) => {
        try {
          监听器(载荷)
        } catch (error) {
          console.error(`[事件总线] 监听器执行异常: ${String(事件)}`, error)
        }
      })
    }
  }

  /**
   * 取消订阅，不传监听器则取消该事件全部订阅
   */
  off<K extends keyof 事件映射>(事件: K, 监听器?: 事件监听器<事件映射[K]>): void {
    if (!监听器) {
      this.监听器.delete(事件)
      return
    }
    this.监听器.get(事件)?.delete(监听器 as 事件监听器)
  }

  /**
   * 清空全部订阅与缓冲
   */
  clear(): void {
    this.监听器.clear()
    this.最近事件.clear()
  }
}
