import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from './PixelHover.module.less'
import { 移动端媒体查询 } from '@/hooks/use移动端'
const cj = `${GLOBAL_CDN_PREFIX}/20261025/cangjian.png`
const cangyun = `${GLOBAL_CDN_PREFIX}/20261025/cangyun.png`

const mainBg = 'https://cdn.arkwish.com/jx3dps/home/main_bg_20260906_075.jpg'
const txj = 'https://cdn.arkwish.com/jx3dps/home/txj_2_465_725.png'
const gfj = 'https://cdn.arkwish.com/jx3dps/home/gfj_545_769_20260906_085.png'
const bxj = 'https://cdn.arkwish.com/jx3dps/home/bxj_20260906_077.png'
const yjj = 'https://cdn.arkwish.com/jx3dps/home/yjj_440_482_20260906_094.png'
const dj = 'https://cdn.arkwish.com/jx3dps/home/dj_425_508_20260906_082.png'
const bd = 'https://cdn.arkwish.com/jx3dps/home/bd_299_378_20260906_076.png'
const cg = 'https://cdn.arkwish.com/jx3dps/home/cg_873_375_20260906_078.png'
const cy = 'https://cdn.arkwish.com/jx3dps/home/cy_854_490_20260906_081.png'
const ds = 'https://cdn.arkwish.com/jx3dps/home/ds_372_500_20260906_083.png'
const gb = 'https://cdn.arkwish.com/jx3dps/home/gb_254_473_20260906_084.png'
const hj = 'https://cdn.arkwish.com/jx3dps/home/hj_406_478_20260906_086.png'
const lx = 'https://cdn.arkwish.com/jx3dps/home/lx_359_240_20260906_087.png'
const mj = 'https://cdn.arkwish.com/jx3dps/home/mj_349_317_20260906_088.png'
const pl = 'https://cdn.arkwish.com/jx3dps/home/pl_411_601_20260906_089.png'
const tc = 'https://cdn.arkwish.com/jx3dps/home/tc_777_578_20260906_090.png'
const tm = 'https://cdn.arkwish.com/jx3dps/home/tm_312_497_20260906_091.png'
const wl = 'https://cdn.arkwish.com/jx3dps/home/wl_269_376_20260906_093.png'
const yz = 'https://cdn.arkwish.com/jx3dps/home/yz_296_344_20260906_095.png'

// 透明度判定阈值：alpha > 该值即视为命中（边缘抗锯齿像素 alpha 较小，可适当调大）
const ALPHA_THRESHOLD = 0

// 背景图设计分辨率（须与 main_bg.jpg 自然分辨率一致，2560 x 1440）
const DESIGN_WIDTH = 2560
const DESIGN_HEIGHT = 1440
const 横向单侧裁剪比例 = 0.05
const 纵向单侧裁剪比例 = 0.1

interface CharacterConfig {
  key: string
  url: string
  left: number
  top: number
  width: number
  height: number
  zIndex: number
}

// 点击跳转目标：
//   - 本项目心法简写（如 'gfj'）→ 站内跳转 /dps/<简写>
//   - 自定义外部地址（http/https 开头）→ 新窗口打开
type 跳转目标 = string

interface 心法选项 {
  名称: string
  图标: string
  目标: 跳转目标
}

// 图片 key ↔ 心法计算器地址映射：
//   - 值为字符串：点击后直接跳转（心法简写或外部地址）
//   - 值为 { options }：点击后弹窗选择（唐门/纯阳双心法）
const 图片心法映射: Record<string, 跳转目标 | { options: 心法选项[] }> = {
  txj: 'txj', // 太玄经（衍天）
  gfj: 'gfj', // 孤锋诀（刀宗）
  bxj: 'bxj', // 冰心诀（七秀）
  yjj: 'yjj', // 易筋经（少林）
  dj: 'dj', // 毒经（五毒）
  tc: 'axzy', // 天策 → 傲血战意
  cj: 'https://www.jx3box.com/bps/107703', // 藏剑 → 问水诀
  gb: 'xcj', // 丐帮 → 笑尘诀
  mj: 'fysj', // 明教 → 焚影圣诀
  pl: 'lhj', // 蓬莱 → 凌海诀
  lx: 'http://www.j3lxg.cn/compute/dy', // 凌雪 → 隐龙诀
  bd: 'baj', // 霸刀 → 北傲诀
  hj: 'hjy', // 万花 → 花间游
  cangyun: {
    // 苍云双心法
    options: [
      { 名称: '分山劲', 图标: 'https://img.jx3box.com/image/xf/10390.png', 目标: 'fsj' },
      { 名称: '分山劲·悟', 图标: 'https://icon.jx3box.com/icon/101024.png', 目标: 'w_fsj' },
    ],
  },
  yz: {
    options: [
      { 名称: '无方', 图标: 'https://img.jx3box.com/image/xf/10627.png', 目标: 'wf' },
      { 名称: '无方·悟', 图标: 'https://icon.jx3box.com/icon/101355.png', 目标: 'w_wf' },
    ],
  },
  wl: 'shxj', // 万灵 → 山海心诀
  ds: 'ztg', // 段氏 → 周天功
  cg: 'http://47.107.131.170:8000/dps?xf=mw', // 长歌 → 莫问（未接入，填入外部地址）
  tm: {
    // 唐门双心法
    options: [
      {
        名称: '惊羽诀',
        图标: 'https://icon.jx3box.com/icon/3165.png',
        目标: 'https://www.jx3box.com/bps/49353',
      }, // 未接入，填入外部地址
      { 名称: '天罗诡道', 图标: 'https://img.jx3box.com/image/xf/10225.png', 目标: 'tlgd' },
    ],
  },
  cy: {
    // 纯阳双心法
    options: [
      { 名称: '紫霞功', 图标: 'https://img.jx3box.com/image/xf/10014.png', 目标: 'zxg' },
      {
        名称: '太虚剑意',
        图标: 'https://icon.jx3box.com/icon/619.png',
        目标: 'https://www.txjydps.online/',
      }, // 未接入，填入外部地址
    ],
  },
}

// 人物列表：left/top/width/height 均相对于「设计坐标系」（DESIGN_WIDTH x DESIGN_HEIGHT），
// 即直接对应背景图上的像素位置。整块内容共用缩放比例与居中偏移，桌面限制裁剪、移动端沿用 cover，
// 因此任意浏览器窗口/缩放比例下，人物与背景的相对位置都保持不变。
const CHARACTERS: CharacterConfig[] = [
  { key: 'txj', url: txj, left: 5, top: 97, width: 465, height: 725, zIndex: 2 },
  { key: 'gfj', url: gfj, left: 164, top: 599, width: 545, height: 769, zIndex: 3 },
  { key: 'bxj', url: bxj, left: 15, top: 278, width: 586, height: 769, zIndex: 3 },
  { key: 'yjj', url: yjj, left: 1, top: 825, width: 440, height: 482, zIndex: 1 },
  { key: 'dj', url: dj, left: 395, top: 305, width: 425, height: 508, zIndex: 1 },
  { key: 'bd', url: bd, left: 633, top: 719, width: 299, height: 378, zIndex: 1 },
  { key: 'cg', url: cg, left: 1490, top: 0, width: 873, height: 375, zIndex: 1 },
  { key: 'cj', url: cj, left: 729, top: 813, width: 696, height: 756, zIndex: 1 },
  { key: 'cy', url: cy, left: 230, top: 946, width: 854, height: 490, zIndex: 3 },
  { key: 'cangyun', url: cangyun, left: 1670, top: 160, width: 354, height: 518, zIndex: 1 },
  { key: 'ds', url: ds, left: 1840, top: 415, width: 372, height: 500, zIndex: 1 },
  { key: 'gb', url: gb, left: 869, top: 782, width: 254, height: 473, zIndex: 4 },
  { key: 'hj', url: hj, left: 2150, top: 500, width: 406, height: 478, zIndex: 1 },
  { key: 'lx', url: lx, left: 1506, top: 756, width: 359, height: 240, zIndex: 1 },
  { key: 'mj', url: mj, left: 1864, top: 190, width: 349, height: 317, zIndex: 3 },
  { key: 'pl', url: pl, left: 2130, top: 836, width: 411, height: 601, zIndex: 1 },
  { key: 'tc', url: tc, left: 1434, top: 863, width: 777, height: 578, zIndex: 1 },
  { key: 'tm', url: tm, left: 1364, top: 943, width: 312, height: 497, zIndex: 1 },
  { key: 'wl', url: wl, left: 1650, top: 486, width: 269, height: 376, zIndex: 1 },
  { key: 'yz', url: yz, left: 1310, top: 760, width: 296, height: 344, zIndex: 2 },
  // 后续新增人物，直接复制上面对象改参数即可
]

// 切出遮罩微调：进入 logo 轮廓时，单个立绘的显示位置与缩放。
//   x / y 为 object-position 百分比（0% 左/上，50% 居中，100% 右/下）
//   scale 为整体放大倍数
interface 遮罩微调 {
  x: number
  y: number
  scale: number
}

const 默认遮罩微调: 遮罩微调 = { x: 50, y: 18, scale: 1.5 }

// 立绘 key → 遮罩微调覆盖项；未在此列出的立绘使用「默认遮罩微调」
const 遮罩微调映射: Record<string, Partial<遮罩微调>> = {
  gfj: { x: 50, y: 50, scale: 1.5 },
  tc: { x: 15, y: 20, scale: 1 },
  // txj: { x: 50, y: 20, scale: 1.8 },
}

const 获取遮罩微调 = (key: string): 遮罩微调 => ({
  ...默认遮罩微调,
  ...遮罩微调映射[key],
})

// 按 zIndex 从高到低排序后的索引：遍历顺序即命中优先级
const sortedIndexes = CHARACTERS.map((_, index) => index).sort(
  (a, b) => CHARACTERS[b].zIndex - CHARACTERS[a].zIndex,
)

// 心法简写 → 立绘索引（供顶部心法图标 hover 联动点亮对应门派立绘）
const 心法简写到立绘索引: Record<string, number> = {}
CHARACTERS.forEach((cfg, index) => {
  const 映射 = 图片心法映射[cfg.key]
  if (!映射) return
  const 记录 = (目标: string) => {
    if (目标 && !/^https?:\/\//i.test(目标)) {
      心法简写到立绘索引[目标] = index
    }
  }
  if (typeof 映射 === 'string') {
    记录(映射)
  } else {
    映射.options.forEach((选项) => 记录(选项.目标))
  }
})

// 无界心法简写（w_xxx）对应同门派旗舰立绘，解析时剥掉 w_ 前缀回退
const 解析立绘索引 = (简写: string): number => {
  if (心法简写到立绘索引[简写] !== undefined) return 心法简写到立绘索引[简写]
  if (简写?.startsWith('w_')) return 心法简写到立绘索引[简写.slice(2)] ?? -1
  return -1
}

interface PixelData {
  data: Uint8ClampedArray
  naturalWidth: number
  naturalHeight: number
}

interface PixelHoverProps {
  // 站内心法跳转回调：由登录页注入「登录 + 跳转 /dps/<简写>」逻辑
  onNavigate?: (目标心法: string) => void
  // logo 图片地址：用作遮罩形状（仅 logo PNG 中不透明区域显示立绘）
  logoUrl?: string
}

export interface PixelHoverHandle {
  // 顶部心法图标 hover 联动：传入心法简写，点亮对应门派立绘
  联动高亮: (简写: string) => void
  联动清除: () => void
  // 切出首页：在 logo 局部用对应门派立绘从左到右遮罩铺满，动画结束后再跳转
  切入过渡: (简写: string, 区域?: DOMRect) => Promise<void>
}

const PixelHover = React.forwardRef<PixelHoverHandle, PixelHoverProps>(
  ({ onNavigate, logoUrl }, ref) => {
    const stageRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)
    const pixelsRef = useRef<Map<number, PixelData>>(new Map())
    const rectRef = useRef<DOMRect | null>(null)
    const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
    const [highlightIndex, setHighlightIndex] = useState(-1)
    const highlightIndexRef = useRef(-1)
    const [选择弹窗, set选择弹窗] = useState<心法选项[] | null>(null)
    // null 表示未联动；-1 表示已联动但该心法无立绘，此时不点亮任何立绘
    const [联动Index, set联动Index] = useState<number | null>(null)
    const [切入遮罩, set切入遮罩] = useState<{
      url: string
      left: number
      top: number
      width: number
      height: number
      微调: 遮罩微调
    } | null>(null)
    // 记录用户是否正通过鼠标悬停在某个立绘上：悬停期间应暂停吸引动画
    const hoveringRef = useRef(false)
    const 切出中Ref = useRef(false)
    const 切入结束Ref = useRef<(() => void) | null>(null)

    // 切出首页：在 logo 局部用对应门派立绘从左到右遮罩铺满，动画结束后 resolve
    const 切入过渡 = (简写: string, 区域?: DOMRect): Promise<void> => {
      const index = 解析立绘索引(简写)
      if (index < 0 || 切出中Ref.current) {
        return Promise.resolve()
      }

      const char = CHARACTERS[index]
      if (window.matchMedia(移动端媒体查询).matches) {
        const stage = stageRef.current
        const viewport = viewportRef.current
        if (!stage || !viewport) return Promise.resolve()
        切出中Ref.current = true
        set联动Index(index)
        const { width, height } = stage.getBoundingClientRect()
        const { scale } = transformRef.current
        const offsetX = Math.min(
          0,
          Math.max(width - DESIGN_WIDTH * scale, width / 2 - (char.left + char.width / 2) * scale),
        )
        const offsetY = Math.min(
          0,
          Math.max(
            height - DESIGN_HEIGHT * scale,
            height / 2 - (char.top + char.height / 2) * scale,
          ),
        )
        const 减少动画 = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        viewport.style.transition = 减少动画 ? 'none' : 'transform 650ms ease-in-out'
        viewport.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
        return new Promise<void>((resolve) => window.setTimeout(resolve, 减少动画 ? 0 : 950))
      }
      const rect = 区域
        ? { left: 区域.left, top: 区域.top, width: 区域.width, height: 区域.height }
        : { left: 0, top: 0, width: 0, height: 0 }

      切出中Ref.current = true
      set切入遮罩({ url: char.url, ...rect, 微调: 获取遮罩微调(char.key) })

      return new Promise<void>((resolve) => {
        let 已结束 = false
        const 结束 = () => {
          if (已结束) return
          已结束 = true
          切入结束Ref.current = null
          resolve()
        }
        切入结束Ref.current = 结束
        // 兜底：动画时长约 0.7s，超时强制结束，避免 animationend 丢失卡住跳转
        window.setTimeout(结束, 800)
      })
    }

    // 暴露给父级（登录页）的联动控制接口
    useImperativeHandle(ref, () => ({
      联动高亮: (简写: string) => {
        if (切出中Ref.current) return
        set联动Index(解析立绘索引(简写))
      },
      联动清除: () => {
        if (切出中Ref.current) return
        set联动Index(null)
      },
      切入过渡,
    }))

    // 用 ref 保存最新回调与弹窗状态，供一次性注册的 window 事件监听读取
    const onNavigateRef = useRef(onNavigate)
    onNavigateRef.current = onNavigate
    const 选择弹窗Ref = useRef<心法选项[] | null>(null)

    const 关闭选择弹窗 = () => {
      选择弹窗Ref.current = null
      set选择弹窗(null)
    }

    // 根据屏幕坐标做像素级命中检测，返回命中的角色索引，未命中返回 -1
    const findHitIndex = (clientX: number, clientY: number): number => {
      const rect = rectRef.current
      if (!rect) return -1
      const { scale, offsetX, offsetY } = transformRef.current
      // 屏幕坐标 -> 设计坐标
      const dx = (clientX - rect.left - offsetX) / scale
      const dy = (clientY - rect.top - offsetY) / scale
      if (dx < 0 || dx >= DESIGN_WIDTH || dy < 0 || dy >= DESIGN_HEIGHT) return -1
      for (const index of sortedIndexes) {
        const cfg = CHARACTERS[index]
        // 边界框快速剔除
        if (
          dx < cfg.left ||
          dx > cfg.left + cfg.width ||
          dy < cfg.top ||
          dy > cfg.top + cfg.height
        ) {
          continue
        }
        const pixel = pixelsRef.current.get(index)
        if (!pixel) continue
        // 设计坐标 -> 人物自然分辨率坐标
        const lx = ((dx - cfg.left) / cfg.width) * pixel.naturalWidth
        const ly = ((dy - cfg.top) / cfg.height) * pixel.naturalHeight
        const px = Math.floor(lx)
        const py = Math.floor(ly)
        if (px < 0 || px >= pixel.naturalWidth || py < 0 || py >= pixel.naturalHeight) continue
        // 读取 alpha 通道：下标 = (行 * 宽 + 列) * 4 + 3
        const alpha = pixel.data[(py * pixel.naturalWidth + px) * 4 + 3]
        if (alpha > ALPHA_THRESHOLD) return index
      }
      return -1
    }

    // 执行跳转：外部地址新窗口打开，否则作为心法简写回调给父级
    const 执行跳转 = (目标: 跳转目标) => {
      if (!目标) return
      if (/^https?:\/\//i.test(目标)) {
        window.open(目标, '_blank')
      } else {
        onNavigateRef.current?.(目标)
      }
    }

    // 依据窗口尺寸计算统一缩放与居中偏移，并应用到 viewport（设计尺寸容器）。
    // 屏幕坐标 <-> 设计坐标 的换算：design = (client - offset) / scale。
    useEffect(() => {
      const update = () => {
        const stage = stageRef.current
        const viewport = viewportRef.current
        if (!stage || !viewport) return
        const rect = stage.getBoundingClientRect()
        rectRef.current = rect
        if (切出中Ref.current) return
        const 移动端 = window.matchMedia(移动端媒体查询).matches
        const 铺满缩放 = Math.max(rect.width / DESIGN_WIDTH, rect.height / DESIGN_HEIGHT)
        // 居中裁剪时，可见宽高至少保留各自的 1 - 2 * 单侧裁剪比例。
        const scale = 移动端
          ? 铺满缩放
          : Math.min(
              铺满缩放,
              rect.width / (DESIGN_WIDTH * (1 - 2 * 横向单侧裁剪比例)),
              rect.height / (DESIGN_HEIGHT * (1 - 2 * 纵向单侧裁剪比例)),
            )
        const offsetX = (rect.width - DESIGN_WIDTH * scale) / 2
        const offsetY = (rect.height - DESIGN_HEIGHT * scale) / 2
        const 留边宽度 = 移动端 ? 0 : Math.max(offsetX, offsetY, 0)
        transformRef.current = { scale, offsetX, offsetY }
        viewport.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
        stage.style.setProperty('--背景补边显示', 留边宽度 > 0 ? 'block' : 'none')
        viewport.style.setProperty('--背景渐隐方向', offsetX > 0 ? 'to right' : 'to bottom')
        viewport.style.setProperty('--背景渐隐宽度', `${Math.min(40, 留边宽度) / scale}px`)
      }
      update()
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }, [])

    // 图片加载完成后，在离屏 canvas 绘制一次，缓存整张图 RGBA 像素
    const cachePixels = (index: number, img: HTMLImageElement) => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, w, h)
      pixelsRef.current.set(index, { data: imageData.data, naturalWidth: w, naturalHeight: h })
    }

    // 鼠标移动：像素级命中检测，命中角色高亮显示
    useEffect(() => {
      let rafId: number | null = null
      let pendingX = 0
      let pendingY = 0

      // requestAnimationFrame 节流，合并高频 mousemove
      const onMouseMove = (e: MouseEvent) => {
        if (window.matchMedia(移动端媒体查询).matches) return
        pendingX = e.clientX
        pendingY = e.clientY
        if (rafId != null) return
        rafId = requestAnimationFrame(() => {
          rafId = null
          if (切出中Ref.current) return
          const index = findHitIndex(pendingX, pendingY)
          // 命中则更新；未命中可能只是划过立绘内部的透明空洞，
          // 保持当前高亮，直到进入另一个立绘或鼠标离开页面
          if (index >= 0) {
            hoveringRef.current = true
            highlightIndexRef.current = index
            setHighlightIndex(index)
          }
        })
      }

      const onMouseLeave = () => {
        if (切出中Ref.current) return
        if (rafId != null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
        hoveringRef.current = false
        highlightIndexRef.current = -1
        setHighlightIndex(-1)
      }

      // 监听 window 而非舞台，避免被上层登录框拦截
      window.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseleave', onMouseLeave)

      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseleave', onMouseLeave)
        if (rafId != null) cancelAnimationFrame(rafId)
      }
    }, [])

    // 点击命中角色 → 直接跳转，或弹窗选择心法（唐门/纯阳）
    useEffect(() => {
      const onClick = (e: MouseEvent) => {
        if (window.matchMedia(移动端媒体查询).matches) return
        // 弹窗内部的点击交由弹窗自身处理
        if (切出中Ref.current) return
        if (popupRef.current?.contains(e.target as Node)) return
        if (选择弹窗Ref.current) return
        // 顶部心法图标盖在立绘上，点击图标时不再按坐标命中下方立绘
        if (e.target instanceof Element && e.target.closest('[data-心法图标栏]')) return
        const index = findHitIndex(e.clientX, e.clientY)
        if (index < 0) return
        const 映射 = 图片心法映射[CHARACTERS[index].key]
        if (!映射) return
        if (typeof 映射 === 'string') {
          执行跳转(映射)
        } else {
          选择弹窗Ref.current = 映射.options
          set选择弹窗(映射.options)
        }
      }
      window.addEventListener('click', onClick)
      return () => window.removeEventListener('click', onClick)
    }, [])

    // 吸引动画：进入页面 10 秒后随机高亮一个门派立绘，之后每 3 秒切换一次
    useEffect(() => {
      let intervalId: number | null = null
      const timer = window.setTimeout(() => {
        const 随机高亮 = () => {
          // 用户正停留于某个立绘时暂停自动轮播
          if (hoveringRef.current || 切出中Ref.current || window.matchMedia(移动端媒体查询).matches)
            return
          const total = CHARACTERS.length
          if (total === 0) return
          let next = Math.floor(Math.random() * total)
          if (total > 1) {
            let guard = 0
            while (next === highlightIndexRef.current && guard < total) {
              next = Math.floor(Math.random() * total)
              guard++
            }
          }
          highlightIndexRef.current = next
          setHighlightIndex(next)
        }
        随机高亮()
        intervalId = window.setInterval(随机高亮, 3000)
      }, 10000)

      return () => {
        window.clearTimeout(timer)
        if (intervalId != null) window.clearInterval(intervalId)
      }
    }, [])

    // 联动高亮优先于鼠标悬停 / 吸引动画；无立绘的心法联动时保持全灭
    const 高亮Index = 联动Index !== null ? 联动Index : highlightIndex

    return (
      <>
        <div className={styles.stage} ref={stageRef}>
          <div
            className={styles.模糊背景}
            style={{ backgroundImage: `url("${mainBg}")` }}
            aria-hidden='true'
          />
          <div
            className={styles.viewport}
            ref={viewportRef}
            style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}
          >
            <img className={styles.bg} src={mainBg} alt='' draggable={false} />
            {CHARACTERS.map((char, index) => (
              <img
                key={index}
                className={高亮Index === index ? `${styles.char} ${styles.highlight}` : styles.char}
                src={char.url}
                alt=''
                draggable={false}
                crossOrigin='anonymous'
                onLoad={(e) => cachePixels(index, e.currentTarget)}
                style={{
                  left: char.left,
                  top: char.top,
                  width: char.width,
                  height: char.height,
                  zIndex: char.zIndex,
                }}
              />
            ))}
          </div>
        </div>
        {选择弹窗 && (
          <div className={styles.popupMask} ref={popupRef} onClick={关闭选择弹窗}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popupTitle}>选择心法</div>
              <div className={styles.popupList}>
                {选择弹窗.map((选项) => (
                  <div
                    key={选项.名称}
                    className={styles.popupItem}
                    onClick={() => {
                      执行跳转(选项.目标)
                      关闭选择弹窗()
                    }}
                  >
                    <img className={styles.popupIcon} src={选项.图标} alt={选项.名称} />
                    <span className={styles.popupName}>{选项.名称}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {切入遮罩 && (
          <div
            className={styles.切入遮罩}
            style={{
              left: 切入遮罩.left,
              top: 切入遮罩.top,
              width: 切入遮罩.width,
              height: 切入遮罩.height,
              WebkitMaskImage: logoUrl ? `url("${logoUrl}")` : undefined,
              maskImage: logoUrl ? `url("${logoUrl}")` : undefined,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
            }}
            onAnimationEnd={() => 切入结束Ref.current?.()}
          >
            <img
              className={styles.切入立绘}
              src={切入遮罩.url}
              alt=''
              draggable={false}
              style={{
                objectPosition: `${切入遮罩.微调.x}% ${切入遮罩.微调.y}%`,
                transform: `scale(${切入遮罩.微调.scale})`,
              }}
            />
          </div>
        )}
      </>
    )
  },
)

export default PixelHover
