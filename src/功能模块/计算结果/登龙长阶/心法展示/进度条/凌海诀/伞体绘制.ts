type 顶点 = { x: number; y: number; 深度: number; u: number; v: number }
type 布片 = { 顶点: [顶点, 顶点, 顶点]; 深度: number; 明暗: number }

function 绘制布片(
  画笔: CanvasRenderingContext2D,
  纹理: HTMLImageElement,
  布片: 布片,
  龙纹?: HTMLCanvasElement,
) {
  const [甲, 乙, 丙] = 布片.顶点
  const 横一 = 乙.u - 甲.u
  const 纵一 = 乙.v - 甲.v
  const 横二 = 丙.u - 甲.u
  const 纵二 = 丙.v - 甲.v
  const 行列式 = 横一 * 纵二 - 横二 * 纵一
  const a = ((乙.x - 甲.x) * 纵二 - (丙.x - 甲.x) * 纵一) / 行列式
  const b = ((乙.y - 甲.y) * 纵二 - (丙.y - 甲.y) * 纵一) / 行列式
  const c = ((丙.x - 甲.x) * 横一 - (乙.x - 甲.x) * 横二) / 行列式
  const d = ((丙.y - 甲.y) * 横一 - (乙.y - 甲.y) * 横二) / 行列式
  const 中心横 = (甲.x + 乙.x + 丙.x) / 3
  const 中心纵 = (甲.y + 乙.y + 丙.y) / 3
  画笔.save()
  画笔.beginPath()
  布片.顶点.forEach((点, 序号) => {
    const 距离 = Math.hypot(点.x - 中心横, 点.y - 中心纵)
    const 横 = 点.x + ((点.x - 中心横) * 0.35) / Math.max(距离, 1)
    const 纵 = 点.y + ((点.y - 中心纵) * 0.35) / Math.max(距离, 1)
    if (序号 === 0) 画笔.moveTo(横, 纵)
    else 画笔.lineTo(横, 纵)
  })
  画笔.closePath()
  画笔.clip()
  画笔.fillStyle = '#d8e6df'
  画笔.fillRect(240, 0, 680, 220)
  画笔.save()
  画笔.globalAlpha = 0.52
  画笔.transform(a, b, c, d, 甲.x - a * 甲.u - c * 甲.v, 甲.y - b * 甲.u - d * 甲.v)
  画笔.drawImage(纹理, 0, 0)
  画笔.restore()
  画笔.fillStyle = `rgba(24,45,57,${布片.明暗 + (布片.深度 < 0 ? 0.14 : 0)})`
  画笔.fillRect(240, 0, 680, 220)
  if (龙纹) {
    画笔.transform(a, b, c, d, 甲.x - a * 甲.u - c * 甲.v, 甲.y - b * 甲.u - d * 甲.v)
    画笔.drawImage(龙纹, 0, 0, 纹理.width, 纹理.height)
  }
  画笔.restore()
}

export default function 绘制伞体(
  画笔: CanvasRenderingContext2D,
  纹理: HTMLImageElement,
  进度: number,
  转角: number,
  龙纹?: HTMLCanvasElement,
) {
  const 骨长 = 650
  const 开度 = ((2.2 + 进度 * 5) * Math.PI) / 180
  const 半径 = 骨长 * Math.sin(开度)
  const 折谷 = 0.4 + 进度 * 0.45
  const 布片列表: 布片[] = []
  // 伞骨等长，固定在半径 10 的伞顶环上；开度决定伞缘，轴向转动改变方位与遮挡。
  const 取顶点 = (长度: number, 方位: number, 凹折: boolean): 顶点 => {
    const 当前半径 = 10 + (长度 / 骨长) * (半径 - 10) * (凹折 ? 折谷 : 1)
    const 横 = -Math.sqrt(长度 * 长度 - (当前半径 - 10) * (当前半径 - 10))
    const 纵 = 当前半径 * Math.cos(方位 + 转角)
    const 深度 = 当前半径 * Math.sin(方位 + 转角)
    return {
      x: 900 + 横 * Math.cos(Math.PI / 7) + 深度 * Math.sin(Math.PI / 7),
      y: 110 + 纵,
      深度,
      u: (长度 / 骨长) * 纹理.width,
      v: (方位 / (Math.PI * 2)) * 纹理.height,
    }
  }

  for (let 序号 = 0; 序号 < 32; 序号++) {
    const 起角 = (序号 / 32) * Math.PI * 2
    const 止角 = ((序号 + 1) / 32) * Math.PI * 2
    const 明暗 = 0.03 + (序号 % 2 ? 0.24 : 0) + (1 - Math.cos(起角 + 转角)) * 0.045
    // 沿骨长分段，避免单个长三角形把龙纹沿对角线拉成碎片。
    for (let 段 = 0; 段 < 4; 段++) {
      const 起长 = 5 + ((骨长 - 5) * 段) / 4
      const 止长 = 5 + ((骨长 - 5) * (段 + 1)) / 4
      const 甲 = 取顶点(起长, 起角, 序号 % 2 === 1)
      const 乙 = 取顶点(止长, 起角, 序号 % 2 === 1)
      const 丙 = 取顶点(止长, 止角, 序号 % 2 === 0)
      const 丁 = 取顶点(起长, 止角, 序号 % 2 === 0)
      for (const 顶点 of [
        [甲, 乙, 丙],
        [甲, 丙, 丁],
      ] as [顶点, 顶点, 顶点][]) {
        布片列表.push({ 顶点, 深度: 顶点.reduce((总和, 点) => 总和 + 点.深度, 0) / 3, 明暗 })
      }
    }
  }

  画笔.clearRect(0, 0, 1000, 220)
  布片列表.sort((甲, 乙) => 甲.深度 - 乙.深度)
  for (const 布片 of 布片列表.filter((片) => 片.深度 < 0)) 绘制布片(画笔, 纹理, 布片, 龙纹)
  画笔.strokeStyle = '#d4e5df'
  画笔.lineWidth = 5.5
  画笔.beginPath()
  画笔.moveTo(270, 110)
  画笔.lineTo(910, 110)
  画笔.stroke()
  for (const 布片 of 布片列表.filter((片) => 片.深度 >= 0)) 绘制布片(画笔, 纹理, 布片, 龙纹)

  for (let 序号 = 0; 序号 < 16; 序号++) {
    const 方位 = (序号 / 16) * Math.PI * 2
    const 末端 = 取顶点(骨长, 方位, false)
    if (末端.深度 < 0) continue
    const 根部 = 取顶点(5, 方位, false)
    const 尖端 = 取顶点(骨长 + 8, 方位, false)
    画笔.beginPath()
    画笔.moveTo(根部.x, 根部.y)
    画笔.lineTo(尖端.x, 尖端.y)
    画笔.strokeStyle = 序号 % 2 ? '#d9e7db99' : '#a9ac82cc'
    画笔.lineWidth = 序号 % 2 ? 0.9 : 1.65
    画笔.stroke()
    if (序号 % 2 === 0 && 进度 > 0.12) {
      画笔.beginPath()
      画笔.moveTo(末端.x - 9, 末端.y)
      画笔.lineTo(末端.x, 末端.y - 5)
      画笔.lineTo(末端.x + 7, 末端.y)
      画笔.lineTo(末端.x, 末端.y + 5)
      画笔.closePath()
      画笔.fillStyle = '#509d9f'
      画笔.fill()
      画笔.strokeStyle = '#c7cba0'
      画笔.lineWidth = 1.2
      画笔.stroke()
      画笔.beginPath()
      画笔.moveTo(末端.x + 4, 末端.y - 4)
      画笔.bezierCurveTo(末端.x + 16, 末端.y - 12, 末端.x + 13, 末端.y - 4, 末端.x + 23, 末端.y)
      画笔.bezierCurveTo(末端.x + 12, 末端.y + 5, 末端.x + 16, 末端.y + 12, 末端.x + 4, 末端.y + 4)
      画笔.strokeStyle = '#dfede0'
      画笔.lineWidth = 1.4
      画笔.stroke()
    }
    const 折角 = 方位 + Math.PI / 16
    const 折点 = 取顶点(骨长, 折角, true)
    const 下一点 = 取顶点(骨长, 方位 + Math.PI / 8, false)
    画笔.beginPath()
    画笔.moveTo(末端.x, 末端.y)
    画笔.lineTo(折点.x, 折点.y)
    画笔.lineTo(下一点.x, 下一点.y)
    画笔.strokeStyle = '#c6d5bc'
    画笔.lineWidth = 1.3
    画笔.stroke()
  }
  画笔.fillStyle = '#b7bea0'
  画笔.beginPath()
  画笔.ellipse(898, 110, 3.2, 10, 0, 0, Math.PI * 2)
  画笔.fill()
}
