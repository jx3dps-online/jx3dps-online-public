import type { 桌宠资源 } from '../interface'

const 透明检测片段 =
  'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwH/////////EU2bdKtNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHLTbuMU6uEElTDZ1OsggEc7AEAAAAAAABoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmpSrXsYMPQkBNgIxMYXZmNjMuMS4xMDJXQYxMYXZmNjMuMS4xMDIWVK5rzK4BAAAAAAAAQ9eBAXPFiKP2dQZSuxZWnIEAIrWcg3VuZIiBAIaFVl9WUDmDgQEj44OEHc1lAOCUsIEQuoEQmoECU8CBAVWwhFW5gQESVMNn2nNzn2PAgGfImUWjh0VOQ09ERVJEh4xMYXZmNjMuMS4xMDJzc7VjwItjxYij9nUGUrsWVmfIpEWjh0VOQ09ERVJEh5dMYXZjNjMuMS4xMDIgbGlidnB4LXZwOR9DtnVAlueBAKDfoa6BAAAAgkmDQgAA8AD2ADgkHBgAAAAgAAAQv///yNeAMf///+z8hw////9sjAAAdaGspqrugQGlpYJJg0IAAPAA9gA4JBwYAAAAIAAAHv////3V+JT////r+oMAAACgsKGSgQH0AIYAQJKcAEAAAAIAAEJAdaGVppPugQGljoYAQJKcAEAAAAIAAEJA+4L+DA=='
const 已加载资源 = new Set<string>()
interface 加载任务 {
  结果: Promise<boolean>
  取消: () => void
  使用数: number
}
const 加载中的资源 = new Map<string, 加载任务>()
let 透明能力检测: Promise<boolean> | undefined

const 检测透明WebM = () => {
  if (透明能力检测) return 透明能力检测
  透明能力检测 = new Promise<boolean>((resolve) => {
    const 视频 = document.createElement('video')
    let 已结束 = false
    const 完成 = (支持: boolean) => {
      if (已结束) return
      已结束 = true
      window.clearTimeout(超时)
      视频.onloadeddata = null
      视频.onerror = null
      视频.pause()
      视频.removeAttribute('src')
      视频.load()
      resolve(支持)
    }
    const 超时 = window.setTimeout(() => 完成(false), 1000)
    if (!视频.canPlayType('video/webm; codecs="vp9"')) {
      完成(false)
      return
    }
    视频.muted = true
    视频.playsInline = true
    视频.preload = 'auto'
    视频.onerror = () => 完成(false)
    视频.onloadeddata = () => {
      try {
        const 画布 = document.createElement('canvas')
        画布.width = 16
        画布.height = 16
        const 上下文 = 画布.getContext('2d', { willReadFrequently: true })
        if (!上下文) {
          完成(false)
          return
        }
        // 片段左半透明、右半不透明，不能把未解码的空画布判成支持透明。
        上下文.drawImage(视频, 0, 0, 16, 16)
        const 像素 = 上下文.getImageData(0, 0, 16, 16).data
        完成(像素[(8 * 16 + 3) * 4 + 3] === 0 && 像素[(8 * 16 + 12) * 4 + 3] === 255)
      } catch {
        完成(false)
      }
    }
    视频.src = 透明检测片段
    视频.load()
  })
  return 透明能力检测
}

export const 获取播放资源 = async (资源: 桌宠资源): Promise<桌宠资源> => {
  if (资源.类型 !== 'webm' || (await 检测透明WebM())) return 资源
  return 资源.兼容资源 || 资源
}

const 加载单个资源 = (资源: 桌宠资源, 信号?: AbortSignal): Promise<boolean> => {
  if (信号?.aborted) return Promise.resolve(false)
  const 是视频 = 资源.类型 === 'webm'
  const 键 = `${是视频 ? 'webm' : 'image'}:${资源.资源}`
  if (已加载资源.has(键)) return Promise.resolve(true)
  let 任务 = 加载中的资源.get(键)
  if (!任务) {
    let 取消加载: () => void
    const 结果 = new Promise<boolean>((resolve) => {
      const 媒体 = 是视频 ? document.createElement('video') : new Image()
      let 已结束 = false
      const 完成 = (成功: boolean) => {
        if (已结束) return
        已结束 = true
        window.clearTimeout(超时)
        媒体.onload = null
        媒体.onerror = null
        媒体.onloadeddata = null
        if (媒体 instanceof HTMLVideoElement) {
          媒体.pause()
          媒体.removeAttribute('src')
          媒体.load()
        } else {
          媒体.removeAttribute('src')
        }
        resolve(成功)
      }
      取消加载 = () => 完成(false)
      const 超时 = window.setTimeout(() => 完成(false), 3000)
      媒体.onerror = () => 完成(false)
      if (媒体 instanceof HTMLVideoElement) {
        媒体.muted = true
        媒体.playsInline = true
        媒体.preload = 'auto'
        媒体.onloadeddata = () => 完成(true)
        媒体.src = 资源.资源
        媒体.load()
      } else {
        媒体.onload = () => 完成(true)
        媒体.src = 资源.资源
      }
    }).then((成功) => {
      加载中的资源.delete(键)
      if (成功) 已加载资源.add(键)
      return 成功
    })
    任务 = { 结果, 取消: 取消加载!, 使用数: 0 }
    加载中的资源.set(键, 任务)
  }
  const 当前任务 = 任务
  当前任务.使用数++
  return new Promise<boolean>((resolve) => {
    let 已结束 = false
    const 完成 = (成功: boolean) => {
      if (已结束) return
      已结束 = true
      信号?.removeEventListener('abort', 取消)
      当前任务.使用数--
      if (!当前任务.使用数) 当前任务.取消()
      resolve(成功)
    }
    const 取消 = () => 完成(false)
    信号?.addEventListener('abort', 取消, { once: true })
    当前任务.结果.then(完成)
  })
}

export const 预加载资源 = async (
  资源?: 桌宠资源 | string,
  信号?: AbortSignal,
): Promise<boolean> => {
  if (!资源 || 信号?.aborted) return false
  const 当前资源: 桌宠资源 = typeof 资源 === 'string' ? { 资源 } : 资源
  if (当前资源.类型 === '序列帧') return 预加载资源(当前资源.序列帧?.帧[0], 信号)
  const 实际资源 = await 获取播放资源(当前资源)
  if (信号?.aborted) return false
  if (await 加载单个资源(实际资源, 信号)) return true
  if (!信号?.aborted && 实际资源 === 当前资源 && 当前资源.类型 === 'webm' && 当前资源.兼容资源) {
    return 加载单个资源(当前资源.兼容资源, 信号)
  }
  return false
}

export const 预加载资源组 = (资源列表?: (桌宠资源 | string | undefined)[]): (() => void) => {
  const 控制器 = new AbortController()
  资源列表?.forEach((资源) => {
    void 预加载资源(资源, 控制器.signal)
  })
  return () => 控制器.abort()
}
