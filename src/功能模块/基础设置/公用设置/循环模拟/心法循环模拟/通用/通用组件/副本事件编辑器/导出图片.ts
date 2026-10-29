/**
 * 副本事件方案图片导出：原生 canvas 自绘规整时间轴示意图
 */
import { 副本事件定义类型, 副本事件方案类型 } from '@/@types/副本事件'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 默认事件颜色, 帧转分秒帧, 获取实例总持续时间, 副本事件方案版本 } from './utils'

interface 导出图片入参 {
  方案: 副本事件方案类型
  事件定义列表: 副本事件定义类型[]
}

const 标签列宽 = 160
const 行高 = 44
const 刻度行高 = 32
const 标题区高 = 96
const 图例区高 = 64
const 高清倍率 = 2
const 画布宽 = 1200

// 预加载图片（带跨域），失败返回 null
const 预加载图片 = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// 计算刻度间隔
const 获取刻度间隔帧 = (总时间: number, 时间轴宽: number) => {
  const 候选间隔 = [5, 10, 15, 30, 60, 120, 300, 600]
  const 最小像素间隔 = 70
  for (const 候选 of 候选间隔) {
    if ((候选 * 每秒郭氏帧 * 时间轴宽) / 总时间 >= 最小像素间隔) {
      return 候选 * 每秒郭氏帧
    }
  }
  return 600 * 每秒郭氏帧
}

export const 渲染时间轴图片 = async (props: 导出图片入参): Promise<HTMLCanvasElement> => {
  const { 方案, 事件定义列表 } = props
  const 实例列表 = 方案?.事件实例列表 || []
  const 总时间 = Math.max(1, 方案?.总时间 || 1)

  // 行 = 事件定义顺序 + 实例中额外出现的事件（仅显示有实例数据的事件行）
  const 行列表: { 事件名称: string; 图标?: string; 颜色: string }[] = []
  const 有数据事件名称 = new Set((实例列表 || []).map((实例) => 实例?.事件名称).filter(Boolean))
  ;(事件定义列表 || []).forEach((定义) => {
    if (!有数据事件名称.has(定义?.事件名称)) {
      return
    }
    行列表.push({
      事件名称: 定义?.事件名称,
      图标: 定义?.图标,
      颜色: 定义?.颜色 || 默认事件颜色,
    })
  })
  ;(实例列表 || []).forEach((实例) => {
    if (!行列表.some((行) => 行.事件名称 === 实例?.事件名称)) {
      行列表.push({ 事件名称: 实例?.事件名称, 颜色: 默认事件颜色 })
    }
  })

  const 时间轴宽 = 画布宽 - 标签列宽
  const 画布高 = 标题区高 + 刻度行高 + 行列表.length * 行高 + 图例区高

  const canvas = document.createElement('canvas')
  canvas.width = 画布宽 * 高清倍率
  canvas.height = 画布高 * 高清倍率
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.scale(高清倍率, 高清倍率)

  // 背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 画布宽, 画布高)

  const 像素每帧 = 时间轴宽 / 总时间

  // 标题区
  ctx.fillStyle = '#1f1f1f'
  ctx.font = 'bold 22px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`副本事件轴 · ${方案?.方案名称 || '未命名'}`, 20, 32)
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#666'
  const 总时长文本 = 帧转分秒帧(总时间).文本
  const 导出时间文本 = new Date().toLocaleString()
  ctx.fillText(`总时长：${总时长文本}`, 20, 62)
  ctx.fillText(`导出时间：${导出时间文本}`, 20, 84)

  // 时间轴区域起始 y
  const 轴起始Y = 标题区高
  const 刻度间隔帧 = 获取刻度间隔帧(总时间, 时间轴宽)

  // 刻度行
  ctx.strokeStyle = '#e5e5e5'
  ctx.beginPath()
  ctx.moveTo(标签列宽, 轴起始Y + 刻度行高)
  ctx.lineTo(画布宽, 轴起始Y + 刻度行高)
  ctx.stroke()

  ctx.fillStyle = '#999'
  ctx.font = '11px sans-serif'
  for (let 帧 = 0; 帧 <= 总时间; 帧 = 帧 + 刻度间隔帧) {
    const x = 标签列宽 + 帧 * 像素每帧
    ctx.strokeStyle = '#d9d9d9'
    ctx.beginPath()
    ctx.moveTo(x, 轴起始Y + 刻度行高 - 6)
    ctx.lineTo(x, 轴起始Y + 刻度行高)
    ctx.stroke()
    ctx.fillStyle = '#999'
    ctx.fillText(帧转分秒帧(帧).文本, x + 3, 轴起始Y + 刻度行高 - 12)
  }

  // 预加载所有图标
  const 图标映射: { [key: string]: HTMLImageElement | null } = {}
  for (const 行 of 行列表) {
    if (行.图标 && 图标映射[行.事件名称] === undefined) {
      图标映射[行.事件名称] = await 预加载图片(行.图标)
    }
  }

  // 事件行
  行列表.forEach((行, 行索引) => {
    const y = 轴起始Y + 刻度行高 + 行索引 * 行高
    const 颜色 = 行.颜色

    // 行背景间隔
    if (行索引 % 2 === 1) {
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(标签列宽, y, 时间轴宽, 行高)
    }
    // 分隔线
    ctx.strokeStyle = '#f0f0f0'
    ctx.beginPath()
    ctx.moveTo(0, y + 行高)
    ctx.lineTo(画布宽, y + 行高)
    ctx.stroke()

    // 标签列
    ctx.fillStyle = '#1f1f1f'
    ctx.font = '13px sans-serif'
    ctx.textBaseline = 'middle'
    const 图标 = 图标映射[行.事件名称]
    if (图标) {
      ctx.drawImage(图标, 10, y + 10, 24, 24)
      ctx.fillText(行.事件名称, 42, y + 行高 / 2)
    } else {
      ctx.fillStyle = 颜色
      ctx.fillRect(10, y + 10, 24, 24)
      ctx.fillStyle = '#1f1f1f'
      ctx.fillText(行.事件名称, 42, y + 行高 / 2)
    }

    // 实例块
    const 该行实例 = 实例列表.filter((实例) => 实例?.事件名称 === 行.事件名称)
    该行实例.forEach((实例) => {
      const 总持续时间 = 获取实例总持续时间(实例)
      const 是多阶段 = (实例.阶段列表 || []).length > 1
      const x = 标签列宽 + 实例.释放时间 * 像素每帧
      // 截断：滑块右边缘不超过时间轴右边界（画布宽）；完全超出右边界的滑块跳过
      const 时间轴右边界 = 画布宽
      if (x >= 时间轴右边界) {
        return
      }
      const w = Math.max(4, Math.min(总持续时间 * 像素每帧, 时间轴右边界 - x))
      ctx.fillStyle = 颜色
      ctx.fillRect(x, y + 6, w, 行高 - 12)

      ctx.font = '11px sans-serif'
      ctx.textBaseline = 'middle'

      if (是多阶段) {
        // 多阶段：每个阶段起始处显示该阶段起始时间，最后一阶段额外显示结束时间（右对齐）
        let 累计 = 0
        实例.阶段列表.forEach((阶段, index) => {
          const 阶段起始帧 = 实例.释放时间 + 累计
          const 阶段x = x + (累计 / 总持续时间) * w
          const 阶段宽 = (阶段.持续时间 / 总持续时间) * w
          const 起始文本 = 帧转分秒帧(阶段起始帧).文本
          ctx.save()
          ctx.beginPath()
          ctx.rect(阶段x + 2, y + 6, Math.max(0, 阶段宽 - 4), 行高 - 12)
          ctx.clip()
          ctx.fillStyle = '#ffffff'
          ctx.fillText(起始文本, 阶段x + 4, y + 行高 / 2)
          if (index === 实例.阶段列表.length - 1) {
            const 结束文本 = 帧转分秒帧(实例.释放时间 + 总持续时间).文本
            const 结束文本宽 = ctx.measureText(结束文本).width
            ctx.fillText(结束文本, x + w - 4 - 结束文本宽, y + 行高 / 2)
          }
          ctx.restore()
          累计 = 累计 + 阶段.持续时间
        })
      } else {
        // 单阶段：显示起止时间；宽度足够放块内，否则放滑块后面（文字用事件颜色）
        const 起止文本 = `${帧转分秒帧(实例.释放时间).文本}~${帧转分秒帧(实例.释放时间 + 总持续时间).文本}`
        const 文本宽 = ctx.measureText(起止文本).width
        if (w >= 文本宽 + 8) {
          ctx.fillStyle = '#ffffff'
          ctx.fillText(起止文本, x + 4, y + 行高 / 2)
        } else {
          ctx.fillStyle = 颜色
          ctx.fillText(起止文本, x + w + 4, y + 行高 / 2)
        }
      }

      // 阶段分隔线
      if (是多阶段) {
        let 累计 = 0
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'
        实例.阶段列表.forEach((阶段, index) => {
          累计 = 累计 + 阶段.持续时间
          if (index < 实例.阶段列表.length - 1) {
            const 分隔x = x + (累计 / 总持续时间) * w
            ctx.beginPath()
            ctx.moveTo(分隔x, y + 6)
            ctx.lineTo(分隔x, y + 行高 - 6)
            ctx.stroke()
          }
        })
      }
    })
  })

  // 图例
  const 图例Y = 画布高 - 图例区高 + 20
  ctx.fillStyle = '#666'
  ctx.font = '12px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('图例：', 20, 图例Y)
  let 图例x = 76
  行列表.forEach((行) => {
    const 颜色 = 行.颜色
    const 文本 = 行.事件名称
    const 文本宽 = ctx.measureText(文本).width
    ctx.fillStyle = 颜色
    ctx.fillRect(图例x, 图例Y - 6, 12, 12)
    ctx.fillStyle = '#1f1f1f'
    ctx.fillText(文本, 图例x + 16, 图例Y)
    图例x = 图例x + 16 + 文本宽 + 20
  })

  return canvas
}

export const 导出时间轴图片 = async (props: 导出图片入参) => {
  const canvas = await 渲染时间轴图片(props)
  const 名称 = `${props?.方案?.方案名称 || '副本事件方案'}-${副本事件方案版本}.png`
  canvas.toBlob((blob) => {
    if (!blob) {
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 名称
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}
