import { useEffect, useId, useRef } from 'react'
import 创建画面 from './画面结构'
import 更新画面 from './绘制'
import 样式 from './index.module.less'

export default function 牵丝画面({
  进度,
  达成,
  忙碌,
}: {
  进度: number
  达成: boolean
  忙碌: boolean
}) {
  const 画布 = useRef<SVGSVGElement>(null)
  const 前缀 = `yly-${useId().replace(/:/g, '')}`
  const 状态 = useRef({ 进度, 达成, 忙碌 })
  const 同步画面 = useRef<() => void>()

  useEffect(() => {
    状态.current = { 进度, 达成, 忙碌 }
    同步画面.current?.()
  }, [进度, 达成, 忙碌])

  useEffect(() => {
    const 节点 = 画布.current!
    const 画面 = 创建画面(节点, 前缀)
    const 减少动态 = window.matchMedia('(prefers-reduced-motion: reduce)')
    let 可见 = true
    let 已卸载 = false
    let 帧号 = 0
    let 上次时间 = 0
    let 时间 = 0
    let 亮相时间 = -20
    let 上次达成 = false
    const 可播放 = () =>
      状态.current.进度 > 0 && !状态.current.忙碌 && !减少动态.matches && !document.hidden && 可见
    const 绘制 = () =>
      更新画面(画面, {
        进度: 状态.current.进度,
        达成: 状态.current.达成,
        时间,
        亮相时间,
        动态: 可播放(),
      })
    const 循环 = (当前时间: number) => {
      帧号 = 0
      if (已卸载 || !可播放()) return
      const 间隔 = 当前时间 - 上次时间
      if (间隔 >= 1000 / 30) {
        时间 += Math.min(间隔, 80) / 1000
        上次时间 = 当前时间
        绘制()
      }
      帧号 = requestAnimationFrame(循环)
    }
    const 同步 = () => {
      if (已卸载) return
      cancelAnimationFrame(帧号)
      帧号 = 0
      if (!状态.current.达成 || !可播放()) 亮相时间 = -20
      else if (!上次达成) 亮相时间 = 时间
      上次达成 = 状态.current.达成
      绘制()
      上次时间 = performance.now()
      if (可播放()) 帧号 = requestAnimationFrame(循环)
    }
    同步画面.current = 同步
    const 可见观察 = new IntersectionObserver(([记录]) => {
      可见 = 记录.isIntersecting
      同步()
    })
    可见观察.observe(节点)
    减少动态.addEventListener('change', 同步)
    document.addEventListener('visibilitychange', 同步)
    同步()

    return () => {
      已卸载 = true
      同步画面.current = undefined
      cancelAnimationFrame(帧号)
      可见观察.disconnect()
      减少动态.removeEventListener('change', 同步)
      document.removeEventListener('visibilitychange', 同步)
      节点.replaceChildren()
    }
  }, [前缀])

  return (
    <svg
      ref={画布}
      className={样式.画面}
      viewBox='0 0 1000 160'
      preserveAspectRatio='xMidYMid meet'
      aria-hidden='true'
      focusable='false'
    />
  )
}
