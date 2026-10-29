import type { 登阶文案 } from '../文案'

/** 仅在主动入境时加载；与计算、存储分离，动画失败或被取消不会提交状态。 */
export async function 播放踏天切换(
  进度条: HTMLElement | null,
  signal: AbortSignal,
  铺满时: (() => void) | undefined,
  文案: 登阶文案,
) {
  if (signal.aborted) throw new DOMException('已取消', 'AbortError')
  const 减少动态 = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const 内存 = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (
    减少动态 ||
    (内存 !== undefined && 内存 <= 2) ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)
  ) {
    铺满时?.()
    return
  }
  if (!Element.prototype.animate) {
    铺满时?.()
    return
  }
  const 原焦点 = document.activeElement as HTMLElement | null
  const 遮罩 = document.createElement('div')
  遮罩.className = 'dragon-heaven-transition'
  遮罩.tabIndex = -1
  遮罩.setAttribute('role', 'status')
  遮罩.setAttribute('aria-label', 文案['踏天.切换.aria'])
  Object.assign(遮罩.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    overflow: 'hidden',
    outline: 'none',
  })
  const 白光 = document.createElement('div')
  const 框 = 进度条?.getBoundingClientRect()
  const x = Math.max(
    0,
    Math.min(window.innerWidth, 框 ? 框.left + 框.width / 2 : window.innerWidth / 2),
  )
  const y = Math.max(
    0,
    Math.min(window.innerHeight, 框 ? 框.top + 框.height / 2 : window.innerHeight / 2),
  )
  const 半径 =
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 20
  Object.assign(白光.style, {
    position: 'absolute',
    width: 半径 * 2 + 'px',
    height: 半径 * 2 + 'px',
    left: x - 半径 + 'px',
    top: y - 半径 + 'px',
    borderRadius: '50%',
    background: '#fff',
    transform: 'scale(0)',
  })
  遮罩.appendChild(白光)
  document.body.appendChild(遮罩)
  遮罩.focus({ preventScroll: true })
  const 阻止按键 = (事件: KeyboardEvent) => {
    if (['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'Escape'].includes(事件.key)) {
      事件.preventDefault()
      事件.stopImmediatePropagation()
    }
  }
  const 阻止滚动 = (事件: Event) => 事件.preventDefault()
  document.addEventListener('keydown', 阻止按键, true)
  遮罩.addEventListener('wheel', 阻止滚动, { passive: false })
  遮罩.addEventListener('touchmove', 阻止滚动, { passive: false })
  const 动画: Animation[] = []
  const 取消 = () => 动画.forEach((项) => 项.cancel())
  signal.addEventListener('abort', 取消)
  const 播放 = async (元素: Element, 帧: Keyframe[], 选项: KeyframeAnimationOptions) => {
    if (signal.aborted) throw new DOMException('已取消', 'AbortError')
    const 项 = 元素.animate(帧, 选项)
    动画.push(项)
    await 项.finished
  }
  try {
    if (进度条)
      await 播放(
        进度条,
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-2px)' },
          { transform: 'translateX(2px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 125, iterations: 16, easing: 'ease-in-out' },
      )
    await 播放(白光, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
      duration: 650,
      fill: 'forwards',
      easing: 'cubic-bezier(.4,0,.2,1)',
    })
    // 白光铺满时切换主卡，淡出阶段直接露出踏天面板，避免先看到登龙长阶再闪切。
    铺满时?.()
    await 播放(遮罩, [{ opacity: 1 }, { opacity: 0 }], {
      duration: 500,
      fill: 'forwards',
      easing: 'ease-out',
    })
    if (signal.aborted) throw new DOMException('已取消', 'AbortError')
  } finally {
    signal.removeEventListener('abort', 取消)
    取消()
    遮罩.remove()
    document.removeEventListener('keydown', 阻止按键, true)
    if (原焦点?.isConnected) 原焦点.focus({ preventScroll: true })
  }
}
