// 资源预加载：CDN 与本地 import 产物（均为 URL 字符串）统一处理

const 已加载资源 = new Set<string>()

/**
 * 预加载单个资源（用于 gif/图片的 prefetch，消除切换时加载闪烁）
 */
export const 预加载资源 = (资源地址?: string) => {
  if (!资源地址 || 已加载资源.has(资源地址)) {
    return
  }
  已加载资源.add(资源地址)
  const 图片 = new Image()
  图片.src = 资源地址
}

/**
 * 预加载一组资源
 */
export const 预加载资源组 = (资源地址列表?: (string | undefined)[]) => {
  ;(资源地址列表 || [])?.forEach((地址) => 预加载资源(地址))
}
