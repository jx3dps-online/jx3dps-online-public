import { useLayoutEffect, useState } from 'react'

export function use引导定位(选择器: string, 开启: boolean) {
  const [版本, 更新版本] = useState(0)
  const [就绪, 设置就绪] = useState(false)
  const [居中, 设置居中] = useState(false)
  useLayoutEffect(() => {
    if (!开启) return
    let 动画帧 = 0
    let 上次位置 = ''
    let 已观察元素: HTMLElement | null = null
    设置就绪(false)
    const 重新定位 = () => {
      cancelAnimationFrame(动画帧)
      动画帧 = requestAnimationFrame(() => {
        const 元素 = document.querySelector<HTMLElement>(选择器)
        if (元素 !== 已观察元素) {
          观察器.disconnect()
          已观察元素 = 元素
          if (元素) {
            观察器.observe(元素)
            元素.scrollIntoView({ block: 'nearest', inline: 'nearest' })
          }
        }
        const 矩形 = 元素?.getBoundingClientRect()
        const 可见 =
          !!矩形 &&
          矩形.width > 0 &&
          矩形.height > 0 &&
          矩形.bottom > 0 &&
          矩形.top < window.innerHeight &&
          矩形.right > 0 &&
          矩形.left < window.innerWidth
        const 完整可见 =
          !!矩形 &&
          矩形.top >= 0 &&
          矩形.left >= 0 &&
          矩形.bottom <= window.innerHeight &&
          矩形.right <= window.innerWidth
        设置居中(!完整可见)
        设置就绪(可见)
        const 位置 = 可见 ? [矩形.x, 矩形.y, 矩形.width, 矩形.height].join(',') : ''
        if (位置 !== 上次位置) {
          上次位置 = 位置
          更新版本((值) => 值 + 1)
        }
      })
    }
    const 观察器 = new ResizeObserver(重新定位)
    const 挂载观察器 = new MutationObserver(重新定位)
    挂载观察器.observe(document.body, { childList: true, subtree: true })
    重新定位()
    document.addEventListener('scroll', 重新定位, true)
    document.addEventListener('transitionend', 重新定位, true)
    document.addEventListener('animationend', 重新定位, true)
    window.addEventListener('resize', 重新定位)
    return () => {
      cancelAnimationFrame(动画帧)
      观察器.disconnect()
      挂载观察器.disconnect()
      document.removeEventListener('scroll', 重新定位, true)
      document.removeEventListener('transitionend', 重新定位, true)
      document.removeEventListener('animationend', 重新定位, true)
      window.removeEventListener('resize', 重新定位)
    }
  }, [开启, 选择器])
  return { 版本, 就绪, 居中 }
}
