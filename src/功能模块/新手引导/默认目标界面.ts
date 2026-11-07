import { useLayoutEffect, useState } from 'react'

export function 有其他操作弹窗() {
  return Array.from(document.querySelectorAll<HTMLElement>('.ant-modal-wrap')).some(
    (元素) => !元素.classList.contains('default-goal-notice') && 元素.getClientRects().length > 0,
  )
}

export function use其他操作弹窗() {
  const [打开, 设置打开] = useState(有其他操作弹窗)
  useLayoutEffect(() => {
    let 动画帧 = 0
    const 检查 = () => {
      cancelAnimationFrame(动画帧)
      动画帧 = requestAnimationFrame(() => 设置打开(有其他操作弹窗()))
    }
    const 观察器 = new MutationObserver(检查)
    观察器.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })
    检查()
    return () => {
      cancelAnimationFrame(动画帧)
      观察器.disconnect()
    }
  }, [])
  return 打开
}
