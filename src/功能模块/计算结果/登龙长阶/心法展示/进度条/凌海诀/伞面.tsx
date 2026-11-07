import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useEffect, useRef } from 'react'
import 绘制伞体 from './伞体绘制'
import 绘制雪晶伞 from './雪晶伞面'
import 创建龙纹流光 from './龙纹流光'
import 样式 from './index.module.less'
const 绢纹 = `${GLOBAL_CDN_PREFIX}/xianyu-longwenjuan-bbd76bcb4b.webp`
const 素伞 = `${GLOBAL_CDN_PREFIX}/xianyu-susan-2ffc1d8f40.webp`
const 微开伞 = `${GLOBAL_CDN_PREFIX}/xianyu-weikai-8ee3743b29.webp`
const 龙纹 = `${GLOBAL_CDN_PREFIX}/xianyu-longwen-c6377e9536.webp`
const 冰晶伞骨 = `${GLOBAL_CDN_PREFIX}/bingjing-sangu-addea9b588.webp`
const 雪花合拢 = `${GLOBAL_CDN_PREFIX}/xuehuasan-helong-22693fb821.webp`
const 雪花微开 = `${GLOBAL_CDN_PREFIX}/xuehuasan-weikai-32fe932ea5.webp`

export default function 伞面({
  进度,
  忙碌,
  就绪,
  更新就绪,
  雪花 = true,
}: {
  进度: number
  忙碌: boolean
  就绪: boolean
  更新就绪: (就绪: boolean) => void
  雪花?: boolean
}) {
  const 画布 = useRef<HTMLCanvasElement>(null)
  const 状态 = useRef({ 进度, 忙碌 })
  const 更新 = useRef<() => void>()

  useEffect(() => {
    状态.current = { 进度, 忙碌 }
    更新.current?.()
  }, [进度, 忙碌])

  useEffect(() => {
    const 节点 = 画布.current!
    节点.dataset.shareReady = 'false'
    节点.dataset.shareError = 'false'
    const 画笔 = 节点.getContext('2d')
    if (!画笔) {
      节点.dataset.shareError = 'true'
      return
    }
    const 材质 = new Image()
    const 龙纹图片 = new Image()
    材质.crossOrigin = 'anonymous'
    龙纹图片.crossOrigin = 'anonymous'
    let 龙纹就绪 = 雪花
    let 绘制龙纹: ReturnType<typeof 创建龙纹流光>
    const 减少动态 = window.matchMedia('(prefers-reduced-motion: reduce)')
    let 已卸载 = false
    let 图片就绪 = false
    let 可见 = true
    let 帧号 = 0
    let 上次时间 = 0
    let 转角 = 0.6
    let 流光时间 = 2400
    let 当前进度 = 状态.current.进度

    const 绘制 = () => {
      if (!图片就绪 || 已卸载) return
      画笔.setTransform(节点.width / 1000, 0, 0, 节点.height / 220, 0, 0)
      if (雪花) 绘制雪晶伞(画笔, 材质, 当前进度, 转角)
      else 绘制伞体(画笔, 材质, 当前进度, 转角, 绘制龙纹?.(当前进度, 流光时间))
      节点.dataset.shareReady = String(龙纹就绪)
    }
    const 可播放 = () => 可见 && !document.hidden && !状态.current.忙碌 && !减少动态.matches
    const 循环 = (时间: number) => {
      帧号 = 0
      if (已卸载 || !图片就绪 || !可播放()) return
      if (时间 - 上次时间 >= 1000 / 24) {
        const 间隔 = Math.min(时间 - 上次时间, 80)
        当前进度 += (状态.current.进度 - 当前进度) * Math.min(1, 间隔 / 180)
        if (Math.abs(当前进度 - 状态.current.进度) < 0.001) 当前进度 = 状态.current.进度
        if (当前进度 > 0) 转角 -= 间隔 * 0.00022
        流光时间 += 间隔
        上次时间 = 时间
        绘制()
      }
      if (当前进度 > 0 || 当前进度 !== 状态.current.进度) 帧号 = requestAnimationFrame(循环)
    }
    const 同步 = () => {
      if (已卸载) return
      cancelAnimationFrame(帧号)
      帧号 = 0
      if (!可播放()) 当前进度 = 状态.current.进度
      绘制()
      上次时间 = performance.now()
      if (图片就绪 && 可播放() && (当前进度 > 0 || 当前进度 !== 状态.current.进度)) {
        帧号 = requestAnimationFrame(循环)
      }
    }
    const 调整尺寸 = () => {
      if (已卸载) return
      const 宽度 = Math.round(节点.clientWidth * Math.min(window.devicePixelRatio || 1, 2))
      节点.width = Math.max(1, 宽度)
      节点.height = Math.max(1, Math.round((宽度 * 220) / 1000))
      同步()
    }
    更新.current = 同步
    材质.onload = () => {
      if (已卸载) return
      图片就绪 = true
      更新就绪(true)
      调整尺寸()
    }
    材质.onerror = () => {
      if (已卸载) return
      图片就绪 = false
      节点.dataset.shareReady = 'false'
      节点.dataset.shareError = 'true'
      更新就绪(false)
      cancelAnimationFrame(帧号)
    }
    材质.src = 雪花 ? 冰晶伞骨 : 绢纹
    if (!雪花) {
      龙纹图片.onload = () => {
        if (已卸载) return
        绘制龙纹 = 创建龙纹流光(龙纹图片)
        龙纹就绪 = true
        同步()
      }
      龙纹图片.onerror = () => {
        if (!已卸载) 节点.dataset.shareError = 'true'
      }
      龙纹图片.src = 龙纹
    }
    const 尺寸观察 = new ResizeObserver(调整尺寸)
    尺寸观察.observe(节点)
    const 可见观察 = new IntersectionObserver(([记录]) => {
      可见 = 记录.isIntersecting
      同步()
    })
    可见观察.observe(节点)
    document.addEventListener('visibilitychange', 同步)
    减少动态.addEventListener('change', 同步)

    return () => {
      已卸载 = true
      更新.current = undefined
      cancelAnimationFrame(帧号)
      尺寸观察.disconnect()
      可见观察.disconnect()
      document.removeEventListener('visibilitychange', 同步)
      减少动态.removeEventListener('change', 同步)
      材质.onload = null
      材质.onerror = null
      龙纹图片.onload = null
      龙纹图片.onerror = null
    }
  }, [更新就绪, 雪花])

  return (
    <div className={样式.伞面}>
      {!就绪 && (
        <img
          className={雪花 ? 样式.静态雪伞 : 样式.静态伞}
          src={雪花 ? (进度 >= 0.5 ? 雪花微开 : 雪花合拢) : 进度 >= 0.5 ? 微开伞 : 素伞}
          alt=''
        />
      )}
      <canvas ref={画布} className={样式.折伞画布} width={1000} height={220} />
    </div>
  )
}
