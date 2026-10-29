export function 创建元素<名称 extends keyof SVGElementTagNameMap>(
  名称: 名称,
  属性: Record<string, string | number>,
  父节点: SVGElement,
) {
  const 节点 = document.createElementNS('http://www.w3.org/2000/svg', 名称)
  Object.entries(属性).forEach(([键, 值]) => 节点.setAttribute(键, String(值)))
  父节点.appendChild(节点)
  return 节点
}
export default function 创建遮罩(画布: SVGSVGElement, 前缀: string) {
  const 定义 = 创建元素('defs', {}, 画布)
  const 揭示渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-reveal', gradientUnits: 'userSpaceOnUse', x1: 10, x2: 80, y1: 0, y2: 0 },
    定义,
  )
  for (const [偏移, 不透明度] of [
    [0, 1],
    [0.5, 0.5],
    [1, 0],
  ])
    创建元素('stop', { offset: 偏移, 'stop-color': 'white', 'stop-opacity': 不透明度 }, 揭示渐变)
  const 揭示遮罩 = 创建元素(
    'mask',
    {
      id: 前缀 + '-reveal-mask',
      maskUnits: 'userSpaceOnUse',
      x: 0,
      y: -20,
      width: 1000,
      height: 200,
    },
    定义,
  )
  创建元素(
    'rect',
    { x: 0, y: -20, width: 1000, height: 200, fill: 'url(#' + 前缀 + '-reveal)' },
    揭示遮罩,
  )
  const 人物揭示渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-puppet-reveal', gradientUnits: 'userSpaceOnUse', x1: 0, x2: 1000, y1: 0, y2: 0 },
    定义,
  )
  const 人物揭示节点 = Array.from({ length: 8 }, (_, 序号) =>
    创建元素('stop', { offset: 序号 / 7, 'stop-color': 'white', 'stop-opacity': 0 }, 人物揭示渐变),
  )
  const 人物揭示遮罩 = 创建元素(
    'mask',
    {
      id: 前缀 + '-puppet-reveal-mask',
      maskUnits: 'userSpaceOnUse',
      x: 0,
      y: -20,
      width: 1000,
      height: 200,
    },
    定义,
  )
  创建元素(
    'rect',
    { x: 0, y: -20, width: 1000, height: 200, fill: 'url(#' + 前缀 + '-puppet-reveal)' },
    人物揭示遮罩,
  )
  const 光晕滤镜 = 创建元素(
    'filter',
    {
      id: 前缀 + '-glow',
      x: '-80%',
      y: '-80%',
      width: '260%',
      height: '260%',
      'color-interpolation-filters': 'sRGB',
    },
    定义,
  )
  创建元素('feGaussianBlur', { stdDeviation: '2' }, 光晕滤镜)
  const 柔光渐变 = 创建元素('radialGradient', { id: 前缀 + '-aura' }, 定义)
  创建元素('stop', { offset: 0, 'stop-color': '#bca5dd', 'stop-opacity': '.34' }, 柔光渐变)
  创建元素('stop', { offset: 1, 'stop-color': '#9e9ed8', 'stop-opacity': '0' }, 柔光渐变)
  const 丝线渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-sheen', x1: 0, x2: 1, y1: 0, y2: 0 },
    定义,
  )
  创建元素('stop', { offset: 0, 'stop-color': '#8aa5b9' }, 丝线渐变)
  创建元素('stop', { offset: '.55', 'stop-color': '#c6b6e4' }, 丝线渐变)
  创建元素('stop', { offset: 1, 'stop-color': '#f0d9a8' }, 丝线渐变)
  const 绢面渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-fabric', x1: 0, x2: 1, y1: 0, y2: 0 },
    定义,
  )
  创建元素('stop', { offset: 0, 'stop-color': 'white', 'stop-opacity': '.42' }, 绢面渐变)
  创建元素('stop', { offset: '.48', 'stop-color': 'white', 'stop-opacity': '.64' }, 绢面渐变)
  创建元素('stop', { offset: '.76', 'stop-color': 'white', 'stop-opacity': '1' }, 绢面渐变)
  const 绢面遮罩 = 创建元素(
    'mask',
    {
      id: 前缀 + '-fabric-mask',
      maskUnits: 'userSpaceOnUse',
      x: 300,
      y: 0,
      width: 660,
      height: 160,
    },
    定义,
  )
  创建元素(
    'rect',
    { x: 300, y: 0, width: 660, height: 160, fill: 'url(#' + 前缀 + '-fabric)' },
    绢面遮罩,
  )
  const 水袖渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-sleeve-fade', x1: 0, x2: 1, y1: 0, y2: 0 },
    定义,
  )
  const 水袖节点 = [0, 0.38, 0.45, 0.5, 0.56, 1].map((偏移) =>
    创建元素('stop', { offset: 偏移, 'stop-color': 'white', 'stop-opacity': 1 }, 水袖渐变),
  )
  const 水袖遮罩 = 创建元素(
    'mask',
    {
      id: 前缀 + '-sleeve-mask',
      maskUnits: 'userSpaceOnUse',
      x: 300,
      y: 0,
      width: 660,
      height: 160,
    },
    定义,
  )
  创建元素(
    'rect',
    { x: 300, y: 0, width: 660, height: 160, fill: 'url(#' + 前缀 + '-sleeve-fade)' },
    水袖遮罩,
  )
  const 薄纱边缘 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-gauze-fade', x1: 0, x2: 1, y1: 0, y2: 0 },
    定义,
  )
  for (const [偏移, 不透明度] of [
    [0, 0],
    [0.12, 1],
    [0.72, 0.85],
    [1, 0],
  ])
    创建元素('stop', { offset: 偏移, 'stop-color': 'white', 'stop-opacity': 不透明度 }, 薄纱边缘)
  const 薄纱遮罩 = 创建元素(
    'mask',
    { id: 前缀 + '-gauze-mask', maskUnits: 'userSpaceOnUse', x: 55, y: 0, width: 730, height: 160 },
    定义,
  )
  创建元素(
    'rect',
    { x: 55, y: 0, width: 730, height: 160, fill: 'url(#' + 前缀 + '-gauze-fade)' },
    薄纱遮罩,
  )
  const 薄纱渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-gauze-fill', x1: 0, x2: 0, y1: 0, y2: 1 },
    定义,
  )
  for (const [偏移, 颜色, 不透明度] of [
    [0, '#9eb4c9', 0.15],
    [0.25, '#9c94c5', 0.85],
    [0.65, '#b6bfd7', 0.65],
    [1, '#7d8ead', 0.08],
  ])
    创建元素('stop', { offset: 偏移, 'stop-color': 颜色, 'stop-opacity': 不透明度 }, 薄纱渐变)
  const 绢纹图案 = 创建元素(
    'pattern',
    { id: 前缀 + '-gauze-texture', width: 18, height: 12, patternUnits: 'userSpaceOnUse' },
    定义,
  )
  创建元素(
    'path',
    {
      d: 'M -6 12 L 6 0 M 3 12 L 15 0 M 12 12 L 24 0 M -6 0 L 6 12 M 3 0 L 15 12 M 12 0 L 24 12',
      fill: 'none',
      stroke: '#ded4ba',
      'stroke-width': '.45',
      opacity: '.48',
    },
    绢纹图案,
  )
  const 薄纱裁切 = 创建元素('clipPath', { id: 前缀 + '-veil-clip' }, 定义)
  const 薄纱轮廓 = 创建元素('path', {}, 薄纱裁切)
  const 穿行渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-passing-light', gradientUnits: 'userSpaceOnUse', x1: 0, x2: 180, y1: 0, y2: 0 },
    定义,
  )
  for (const [偏移, 不透明度] of [
    [0, 0],
    [0.42, 0.08],
    [0.55, 0.75],
    [0.7, 0.18],
    [1, 0],
  ])
    创建元素('stop', { offset: 偏移, 'stop-color': '#efe2c9', 'stop-opacity': 不透明度 }, 穿行渐变)
  const 莲瓣渐变 = 创建元素(
    'linearGradient',
    { id: 前缀 + '-petal-fill', x1: 0, x2: 0, y1: 1, y2: 0 },
    定义,
  )
  创建元素('stop', { offset: 0, 'stop-color': '#aab8d8', 'stop-opacity': '.12' }, 莲瓣渐变)
  创建元素('stop', { offset: 1, 'stop-color': '#c6e0df', 'stop-opacity': '.48' }, 莲瓣渐变)
  const 虚影渐变 = 创建元素('radialGradient', { id: 前缀 + '-ghost-fade' }, 定义)
  for (const [偏移, 不透明度] of [
    [0, 1],
    [0.45, 1],
    [0.78, 0.55],
    [1, 0],
  ])
    创建元素('stop', { offset: 偏移, 'stop-color': 'white', 'stop-opacity': 不透明度 }, 虚影渐变)
  const 虚影遮罩 = 创建元素(
    'mask',
    { id: 前缀 + '-ghost-mask', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 270, height: 160 },
    定义,
  )
  创建元素(
    'rect',
    { x: 0, y: 0, width: 270, height: 160, fill: 'url(#' + 前缀 + '-ghost-fade)' },
    虚影遮罩,
  )
  return { 揭示渐变, 人物揭示节点, 水袖节点, 薄纱轮廓, 穿行渐变 }
}
