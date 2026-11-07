import type { 登阶文案 } from '../../文案'

const 图片地址 = /url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g
export class 背景加载异常 extends Error {}

function 检查取消(信号: AbortSignal) {
  if (信号.aborted) throw 信号.reason || new DOMException('Aborted', 'AbortError')
}

async function 等待画面(画面: HTMLElement, 信号: AbortSignal, 文案: 登阶文案) {
  await document.fonts.ready
  while (画面.querySelector('[aria-busy="true"], [data-share-ready="false"]')) {
    检查取消(信号)
    if (画面.querySelector('[data-share-error="true"]')) throw new Error(文案['分享.素材失败'])
    await new Promise((完成) => window.setTimeout(完成, 60))
  }
  await Promise.all(Array.from(画面.querySelectorAll('img')).map((图) => 图.decode()))
  检查取消(信号)
}

function 复制样式(样式: CSSStyleDeclaration, 目标: HTMLElement | SVGElement) {
  for (const 属性 of Array.from(样式)) 目标.style.setProperty(属性, 样式.getPropertyValue(属性))
  目标.style.animation = 'none'
  目标.style.transition = 'none'
  目标.style.caretColor = 'transparent'
}

function 克隆节点(原节点: Node): Node {
  if (!(原节点 instanceof Element)) return 原节点.cloneNode()
  const 节点 =
    原节点 instanceof HTMLCanvasElement
      ? document.createElement('img')
      : (原节点.cloneNode(false) as Element)
  if (!(节点 instanceof HTMLElement || 节点 instanceof SVGElement)) return 节点
  复制样式(getComputedStyle(原节点), 节点)
  if (原节点 instanceof HTMLCanvasElement) {
    ;(节点 as HTMLImageElement).src = 原节点.toDataURL('image/png')
    return 节点
  }
  if (节点 instanceof HTMLImageElement) {
    节点.src = (原节点 as HTMLImageElement).currentSrc || (原节点 as HTMLImageElement).src
    节点.removeAttribute('srcset')
    节点.removeAttribute('crossorigin')
    节点.loading = 'eager'
  }
  for (const 子节点 of Array.from(原节点.childNodes)) 节点.appendChild(克隆节点(子节点))
  if (原节点 instanceof HTMLElement) {
    for (const 位置 of ['::before', '::after']) {
      const 样式 = getComputedStyle(原节点, 位置)
      if (!样式.content || ['none', 'normal'].includes(样式.content) || 样式.display === 'none')
        continue
      const 伪节点 = document.createElement('span')
      复制样式(样式, 伪节点)
      伪节点.textContent = 样式.content.replace(/^["']|["']$/g, '')
      if (位置 === '::before') 节点.prepend(伪节点)
      else 节点.append(伪节点)
    }
  }
  return 节点
}

async function 内嵌资源(根: HTMLElement, 信号: AbortSignal, 文案: 登阶文案) {
  const 缓存 = new Map<string, Promise<string>>()
  const 获取图片 = (地址: string): Promise<string> => {
    if (地址.startsWith('data:') || 地址.startsWith('#')) return Promise.resolve(地址)
    const 链接 = new URL(地址, document.baseURI)
    if (链接.hash && 链接.href.split('#')[0] === location.href.split('#')[0])
      return Promise.resolve(链接.hash)
    if (!缓存.has(链接.href)) {
      缓存.set(
        链接.href,
        (async () => {
          const 响应 = await fetch(链接.href, { signal: 信号, credentials: 'omit' })
          if (!响应.ok) throw new Error(`图片加载失败 (${响应.status})`)
          const 数据 = await 响应.blob()
          return new Promise<string>((完成, 失败) => {
            const 读取器 = new FileReader()
            读取器.onload = () => 完成(读取器.result as string)
            读取器.onerror = () => 失败(读取器.error)
            读取器.readAsDataURL(数据)
          })
        })(),
      )
    }
    return 缓存.get(链接.href)!
  }
  await Promise.all(
    [根, ...Array.from(根.querySelectorAll('*'))].map(async (节点) => {
      if (!(节点 instanceof HTMLElement || 节点 instanceof SVGElement)) return
      const 属性任务 = Array.from(节点.attributes).map(async (属性) => {
        if (['src', 'href', 'xlink:href'].includes(属性.name) && 属性.value) {
          try {
            节点.setAttributeNS(属性.namespaceURI, 属性.name, await 获取图片(属性.value))
          } catch (异常) {
            if (节点.hasAttribute('data-share-background') && !信号.aborted)
              throw new 背景加载异常(文案['分享.背景重试'])
            throw 异常
          }
        }
      })
      const 原样式 = 节点.style.cssText
      const 匹配 = Array.from(原样式.matchAll(图片地址))
      const 替换 = await Promise.all(
        匹配.map(async (项) => [项[0], `url("${await 获取图片(项[1] || 项[2] || 项[3])}")`]),
      )
      let 新样式 = 原样式
      for (const [原值, 新值] of 替换) 新样式 = 新样式.split(原值).join(新值)
      节点.style.cssText = 新样式
      await Promise.all(属性任务)
    }),
  )
}

export async function 生成分享图片(
  画面: HTMLElement,
  倍数: number,
  信号: AbortSignal,
  文案: 登阶文案,
) {
  const 控制器 = new AbortController()
  const 取消 = () => 控制器.abort(信号.reason)
  信号.addEventListener('abort', 取消, { once: true })
  const 超时 = window.setTimeout(() => 控制器.abort(new Error(文案['分享.素材超时'])), 25000)
  const 工作 = async () => {
    await 等待画面(画面, 控制器.signal, 文案)
    const 宽 = 画面.offsetWidth
    const 高 = 画面.offsetHeight
    const 克隆 = 克隆节点(画面) as HTMLElement
    克隆.style.transform = 'none'
    克隆.style.margin = '0'
    克隆.style.position = 'relative'
    克隆.style.width = `${宽}px`
    克隆.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
    await 内嵌资源(克隆, 控制器.signal, 文案)
    检查取消(控制器.signal)
    const 内容 = new XMLSerializer().serializeToString(克隆)
    const 图 = new Image()
    图.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${宽 * 倍数}" height="${高 * 倍数}" viewBox="0 0 ${宽} ${高}"><foreignObject width="100%" height="100%">${内容}</foreignObject></svg>`)}`
    await 图.decode()
    检查取消(控制器.signal)
    const 画布 = document.createElement('canvas')
    画布.width = 宽 * 倍数
    画布.height = 高 * 倍数
    const 画笔 = 画布.getContext('2d')
    if (!画笔) throw new Error(文案['分享.内存不足'])
    画笔.drawImage(图, 0, 0)
    return new Promise<Blob>((完成, 失败) => {
      画布.toBlob((数据) => {
        画布.width = 画布.height = 0
        数据 ? 完成(数据) : 失败(new Error(文案['分享.内存不足']))
      }, 'image/png')
    })
  }
  let 终止: (() => void) | undefined
  try {
    if (信号.aborted) 取消()
    检查取消(控制器.signal)
    return await Promise.race([
      工作(),
      new Promise<never>((_, 失败) => {
        终止 = () => 失败(控制器.signal.reason)
        控制器.signal.addEventListener('abort', 终止, { once: true })
      }),
    ])
  } finally {
    clearTimeout(超时)
    信号.removeEventListener('abort', 取消)
    if (终止) 控制器.signal.removeEventListener('abort', 终止)
    控制器.abort()
  }
}

export function 保存分享图片(图片: Blob, 文件名: string) {
  const 地址 = URL.createObjectURL(图片)
  const 链接 = document.createElement('a')
  链接.href = 地址
  链接.download = `${文件名.replace(/[\\/:*?"<>|]/g, '_')}.png`
  document.body.append(链接)
  链接.click()
  链接.remove()
  setTimeout(() => URL.revokeObjectURL(地址), 1000)
}
