import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import 创建遮罩, { 创建元素 } from './遮罩'
const 执轮手图片 = `${GLOBAL_CDN_PREFIX}/20261025/zhilunshou-gongbi.png`
const 伶影图片 = `${GLOBAL_CDN_PREFIX}/20261025/lingying-qianqing.png`
export function 获取人物布局() {
  const 比例 = 136 / 543,
    横坐标 = 950 - 2172 * 比例,
    纵坐标 = 12 - 102 * 比例
  return {
    x: 横坐标,
    y: 纵坐标,
    width: 2172 * 比例,
    height: 724 * 比例,
    显色起点: 980,
    显色终点: 1160,
    连接点: [
      [1015, 266],
      [1673, 252],
      [1029, 278],
      [1660, 266],
      [1323, 385],
    ],
    星屑: [
      [1280, 128],
      [1425, 338],
      [1090, 321],
      [1830, 444],
      [1550, 475],
    ],
    人物轴心: [1540, 420],
    映射坐标: ([横, 纵]: number[]) => [横坐标 + 横 * 比例, 纵坐标 + 纵 * 比例],
  }
}
export default function 创建画面(画布: SVGSVGElement, 前缀: string) {
  const { 揭示渐变, 人物揭示节点, 水袖节点, 薄纱轮廓, 穿行渐变 } = 创建遮罩(画布, 前缀)
  const 背景 = 创建元素('g', {}, 画布)
  const 薄纱 = 创建元素('g', { mask: 'url(#' + 前缀 + '-gauze-mask)' }, 背景)
  const 后纱 = 创建元素('path', { fill: 'url(#' + 前缀 + '-gauze-fill)' }, 薄纱)
  const 前纱 = 创建元素('path', { fill: 'url(#' + 前缀 + '-gauze-fill)', opacity: '.7' }, 薄纱)
  const 纱纹 = 创建元素(
    'path',
    {
      fill: 'url(#' + 前缀 + '-gauze-texture)',
      opacity: '.6',
      mask: 'url(#' + 前缀 + '-reveal-mask)',
    },
    薄纱,
  )
  const 纱缘 = 创建元素(
    'path',
    {
      fill: 'none',
      stroke: '#d7cba9',
      'stroke-width': '.7',
      opacity: '.68',
      mask: 'url(#' + 前缀 + '-reveal-mask)',
    },
    薄纱,
  )
  const 穿行层 = 创建元素('g', { 'clip-path': 'url(#' + 前缀 + '-veil-clip)' }, 薄纱)
  const 纱光 = 创建元素(
    'rect',
    { x: 55, y: 0, width: 730, height: 160, fill: 'url(#' + 前缀 + '-passing-light)' },
    穿行层,
  )
  const 虚影层 = 创建元素('g', { mask: 'url(#' + 前缀 + '-ghost-mask)' }, 背景)
  const 手部虚影 = 创建元素(
    'image',
    {
      href: 执轮手图片,
      x: -110,
      y: -25,
      width: 345,
      height: 172.5,
      style: 'filter:grayscale(.72) saturate(.6) brightness(1.12) blur(.45px)',
    },
    虚影层,
  )
  const 青莲 = 创建元素('g', { transform: 'translate(248 102)' }, 背景)
  const 莲瓣 = [-96, -64, -32, 0, 32, 64, 96, 145, 180, 215].map((角度, 序号) => {
    const 组 = 创建元素('g', { transform: `rotate(${角度}) scale(${序号 > 6 ? 0.64 : 1})` }, 青莲)
    创建元素(
      'path',
      {
        d: 'M 0 13 C -22 -3 -20 -35 0 -56 C 20 -35 22 -3 0 13 Z',
        fill: 'url(#' + 前缀 + '-petal-fill)',
        stroke: 序号 % 2 ? '#cbdde1' : '#d6c9ac',
        'stroke-width': '.95',
      },
      组,
    )
    创建元素(
      'path',
      {
        d: 'M 0 9 Q -3 -20 0 -49 M 0 -14 Q -8 -22 -12 -27 M 0 -6 Q 9 -12 13 -19',
        fill: 'none',
        stroke: '#c1d1dc',
        'stroke-width': '.6',
        opacity: '.6',
      },
      组,
    )
    return 组
  })
  const 人物柔光 = 创建元素(
    'ellipse',
    { cx: 800, cy: 85, rx: 105, ry: 55, fill: 'url(#' + 前缀 + '-aura)' },
    背景,
  )
  const 涟漪层 = 创建元素('g', {}, 背景)
  const 涟漪 = Array.from({ length: 3 }, () =>
    创建元素(
      'ellipse',
      {
        cx: 235,
        cy: 106,
        rx: 30,
        ry: 14,
        fill: 'none',
        stroke: '#abd7df',
        'stroke-width': '.7',
        transform: 'rotate(-18 235 106)',
      },
      涟漪层,
    ),
  )
  const 人物 = 创建元素('g', {}, 画布)
  const 水袖层 = 创建元素('g', { mask: 'url(#' + 前缀 + '-sleeve-mask)' }, 人物)
  const 人物素底 = 创建元素(
    'image',
    {
      mask: 'url(#' + 前缀 + '-fabric-mask)',
      style: 'filter:grayscale(1) brightness(.65)',
      opacity: '.17',
    },
    水袖层,
  )
  const 人物显色层 = 创建元素('g', { mask: 'url(#' + 前缀 + '-puppet-reveal-mask)' }, 水袖层)
  const 人物成品 = 创建元素('image', { mask: 'url(#' + 前缀 + '-fabric-mask)' }, 人物显色层)
  const 牵丝层 = 创建元素('g', { fill: 'none', 'stroke-linecap': 'round' }, 画布)
  const 牵丝 = Array.from({ length: 5 }, (_, 序号) => {
    const 素线 = 创建元素(
      'path',
      { stroke: '#b4bbc7', 'stroke-width': '.6', opacity: '.14' },
      牵丝层,
    )
    const 亮线层 = 创建元素('g', { mask: 'url(#' + 前缀 + '-reveal-mask)' }, 牵丝层)
    const 线晕 = 创建元素(
      'path',
      {
        stroke: 序号 % 2 ? '#e2cba5' : '#b3b9eb',
        'stroke-width': '2.4',
        filter: 'url(#' + 前缀 + '-glow)',
        pathLength: 100,
      },
      亮线层,
    )
    const 亮线 = 创建元素(
      'path',
      { stroke: 'url(#' + 前缀 + '-sheen)', 'stroke-width': '.8', pathLength: 100 },
      亮线层,
    )
    const 游光 = 创建元素(
      'path',
      { stroke: 序号 % 2 ? '#f0dfba' : '#d5d9f7', 'stroke-width': '1.3', pathLength: 100 },
      亮线层,
    )
    const 光点 = 创建元素('circle', { r: 1.3, fill: 序号 % 2 ? '#f6dfad' : '#dcebf5' }, 亮线层)
    const 端点 = 创建元素('circle', { r: 1, fill: '#ddd3b9' }, 亮线层)
    return { 素线, 线晕, 亮线, 游光, 光点, 端点 }
  })
  const 织光层 = 创建元素(
    'g',
    { fill: 'none', 'stroke-linecap': 'round', mask: 'url(#' + 前缀 + '-reveal-mask)' },
    画布,
  )
  const 织光 = Array.from({ length: 22 }, (_, 序号) => ({
    织线: 创建元素(
      'path',
      { stroke: 序号 % 3 ? '#d4c6a6' : '#c8dce2', 'stroke-width': '.7' },
      织光层,
    ),
    织光点: 创建元素(
      'circle',
      { r: 序号 % 4 === 0 ? 1.35 : 0.8, fill: '#ece0bf', stroke: 'none' },
      织光层,
    ),
  }))
  const 执轮手 = 创建元素('g', {}, 画布)
  创建元素(
    'image',
    {
      href: 执轮手图片,
      x: 82,
      y: 24,
      width: 230,
      height: 115,
      style: 'filter:grayscale(1) brightness(.65)',
      opacity: '.16',
    },
    执轮手,
  )
  const 手部成品 = 创建元素(
    'image',
    {
      href: 执轮手图片,
      x: 82,
      y: 24,
      width: 230,
      height: 115,
      mask: 'url(#' + 前缀 + '-reveal-mask)',
    },
    执轮手,
  )
  const 星屑层 = 创建元素('g', {}, 画布)
  const 星屑 = Array.from({ length: 9 }, (_, 序号) =>
    创建元素(
      'path',
      {
        d: 'M -3 0 L 3 0 M 0 -3 L 0 3',
        fill: 'none',
        stroke: 序号 % 2 ? '#e4d5af' : '#c8e2ee',
        'stroke-width': '.8',
      },
      星屑层,
    ),
  )
  const 亮相光环 = 创建元素(
    'ellipse',
    {
      cx: 807,
      cy: 85,
      rx: 26,
      ry: 55,
      fill: 'none',
      stroke: '#d5c5e6',
      'stroke-width': '.7',
      opacity: 0,
    },
    画布,
  )
  const 布局 = 获取人物布局()
  水袖节点.forEach((节点, 序号) =>
    节点.setAttribute('stop-opacity', String([0.4, 0.4, 0.48, 0.72, 1, 1][序号])),
  )
  for (const 图片 of [人物素底, 人物成品]) {
    图片.setAttribute('href', 伶影图片)
    for (const 属性 of ['x', 'y', 'width', 'height'] as const)
      图片.setAttribute(属性, String(布局[属性]))
  }
  const 中心 = 布局.映射坐标(布局.人物轴心)
  人物柔光.setAttribute('cx', String(中心[0]))
  亮相光环.setAttribute('cx', String(中心[0]))
  return {
    画布,
    揭示渐变,
    人物揭示节点,
    牵丝,
    执轮手,
    手部成品,
    虚影层,
    手部虚影,
    人物,
    人物素底,
    人物成品,
    水袖节点,
    人物柔光,
    涟漪,
    星屑,
    亮相光环,
    薄纱,
    后纱,
    前纱,
    纱纹,
    纱缘,
    薄纱轮廓,
    穿行渐变,
    纱光,
    青莲,
    莲瓣,
    织光层,
    织光,
  }
}
