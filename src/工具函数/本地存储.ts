/** 版本化本地存储：坏缓存保留原文，再次保存前备份；订阅同时覆盖同页与跨页。 */
export const 是对象 = (值: unknown): 值 is Record<string, any> =>
  !!值 && typeof 值 === 'object' && !Array.isArray(值)

export const 生成id = () =>
  typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)

const 同页事件 = 'jx3dps:本地数据:更新'

export function 创建本地存储<T>(键: string, 默认值: T, 校验: (值: unknown) => boolean) {
  let 缓存原文: string | null | undefined
  let 缓存值 = 默认值
  let 错误: string | undefined

  const 读取 = (): T => {
    let 原文: string | null
    try {
      原文 = localStorage.getItem(键)
    } catch {
      错误 = '浏览器无法读取本地数据，请检查存储权限。'
      return 缓存值
    }
    if (原文 === 缓存原文) return 缓存值
    缓存原文 = 原文
    缓存值 = 默认值
    错误 = undefined
    if (原文 !== null) {
      try {
        const 值 = JSON.parse(原文)
        if (!校验(值)) throw new Error('invalid')
        缓存值 = 值
      } catch {
        错误 = '本地数据损坏，原文已保留；再次保存前会备份原文。'
      }
    }
    return 缓存值
  }

  const 保存 = (值: T) => {
    if (!校验(值)) throw new Error('数据格式不完整，未保存。')
    读取()
    try {
      if (错误 && 缓存原文 != null) {
        localStorage.setItem(键 + ':recovery:' + 生成id(), 缓存原文)
      }
      localStorage.setItem(键, JSON.stringify(值))
    } catch {
      throw new Error('未保存：浏览器存储不可用或空间不足。')
    }
    缓存原文 = undefined
    window.dispatchEvent(new CustomEvent(同页事件, { detail: 键 }))
  }

  const 订阅 = (通知: () => void) => {
    const 同页 = (事件: Event) => {
      if ((事件 as CustomEvent).detail === 键) 通知()
    }
    const 跨页 = (事件: StorageEvent) => {
      if (事件.key === null || 事件.key === 键) 通知()
    }
    window.addEventListener(同页事件, 同页)
    window.addEventListener('storage', 跨页)
    return () => {
      window.removeEventListener(同页事件, 同页)
      window.removeEventListener('storage', 跨页)
    }
  }

  return {
    读取,
    读取错误: () => {
      读取()
      return 错误
    },
    保存,
    订阅,
  }
}
