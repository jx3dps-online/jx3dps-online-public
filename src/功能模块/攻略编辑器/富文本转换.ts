import type { 内容节点 } from './类型'

export function 安全地址(值: unknown): string {
  const 地址 = String(值 || '').trim()
  if (!地址) return ''
  const 解析 = new URL(地址)
  if (!['http:', 'https:'].includes(解析.protocol)) throw new Error('地址仅支持 http 或 https')
  return 解析.href
}
export function 视频地址(类型: string, 值: unknown): string {
  const 地址 = String(值 || '').trim()
  if (类型 !== 'bilibili' || !地址) return 安全地址(地址)
  const 编号 = 地址.match(/BV[\da-z]+/i)?.[0]
  if (!编号) throw new Error('请输入 BV 号或包含 BV 号的 B 站链接')
  return 编号
}
const 标签表 = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'del',
  'mark',
  'code',
  'span',
  'a',
  'br',
  'p',
  'div',
  'ul',
  'ol',
  'li',
])
const 禁止标签 = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'svg',
  'math',
  'form',
  'input',
  'button',
])
export function 富文本节点(内容: unknown): (内容节点 | string)[] {
  const 文本 = String(内容 || '')
  if (文本.length > 102400) throw new Error('单个富文本字段超过 100 KiB')
  const 文档 = new DOMParser().parseFromString(文本, 'text/html')
  const 转换 = (节点: Node, 深度: number): (内容节点 | string)[] => {
    if (深度 > 50) throw new Error('富文本嵌套过深')
    if (节点.nodeType === Node.TEXT_NODE) return [节点.textContent || '']
    if (!(节点 instanceof Element)) return []
    const 标签 = 节点.tagName.toLowerCase()
    if (禁止标签.has(标签)) throw new Error(`富文本不支持 ${标签}`)
    const 子 = Array.from(节点.childNodes).flatMap((项) => 转换(项, 深度 + 1))
    if (标签 === 'img') {
      const 原宽度 = 节点.getAttribute('width') || (节点 as HTMLElement).style.width
      const width = /^\d+(\.\d+)?(px)?$/.test(原宽度) ? Number.parseFloat(原宽度) : 0
      return [
        {
          标签: '图片',
          属性: {
            src: 安全地址(节点.getAttribute('src')),
            alt: 节点.getAttribute('alt') || '',
            ...(width > 0 ? { width } : {}),
          },
        },
      ]
    }
    if (!标签表.has(标签)) return 子
    const 属性: Record<string, unknown> = {}
    if (标签 === 'a')
      Object.assign(属性, {
        href: 安全地址(节点.getAttribute('href')),
        target: '_blank',
        rel: 'noopener noreferrer',
      })
    const style: Record<string, string> = {}
    for (const [原名, 名] of [
      ['color', 'color'],
      ['background-color', 'backgroundColor'],
      ['font-size', 'fontSize'],
      ['font-weight', 'fontWeight'],
      ['font-style', 'fontStyle'],
      ['text-decoration', 'textDecoration'],
    ]) {
      const 值 = (节点 as HTMLElement).style.getPropertyValue(原名)
      if (值 && !/url|var|expression/i.test(值)) style[名] = 值
    }
    if (Object.keys(style).length) 属性.style = style
    return [{ 标签: 标签 === 'strike' ? 's' : 标签, 属性, 子 }]
  }
  return Array.from(文档.body.childNodes).flatMap((项) => 转换(项, 0))
}
export function 清洗富文本(内容: string): string {
  const 容器 = document.createElement('div')
  const 创建 = (项: 内容节点 | string): Node => {
    if (typeof 项 === 'string') return document.createTextNode(项)
    const 元素 = document.createElement(项.标签 === '图片' ? 'img' : 项.标签)
    Object.entries(项.属性 || {}).forEach(([名, 值]) => {
      if (名 === 'style') Object.assign(元素.style, 值)
      else 元素.setAttribute(名, String(值))
    })
    项.子?.forEach((子) => 元素.appendChild(创建(子)))
    return 元素
  }
  富文本节点(内容).forEach((项) => 容器.appendChild(创建(项)))
  return 容器.innerHTML
}
