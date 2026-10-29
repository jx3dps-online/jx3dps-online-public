type 点 = { x: number; y: number; z: number; u?: number; v?: number }
type 片 = { 点: 点[]; 深度: number; 纹理?: boolean; 明度?: number }

function 绘制雪花(画笔: CanvasRenderingContext2D, 半径: number) {
  画笔.beginPath()
  for (let i = 0; i < 6; i++) {
    const 角 = (i * Math.PI) / 3
    const x = Math.cos(角),
      y = Math.sin(角)
    画笔.moveTo(0, 0)
    画笔.lineTo(x * 半径, y * 半径)
    for (const 侧 of [-1, 1]) {
      画笔.moveTo(x * 半径 * 0.58, y * 半径 * 0.58)
      画笔.lineTo((x * 0.79 - y * 侧 * 0.21) * 半径, (y * 0.79 + x * 侧 * 0.21) * 半径)
    }
  }
  画笔.stroke()
}

export default function 绘制雪晶伞(
  画笔: CanvasRenderingContext2D,
  冰叶: HTMLImageElement,
  进度: number,
  转角: number,
) {
  const 骨长 = 650
  const 外径 = 20 + 64 * 进度
  const 片组: 片[] = []
  const 投影 = (长: number, 角: number, 侧 = 0): 点 => {
    const 半径 = 8 + (长 / 骨长) * (外径 - 8)
    const 轴 = -Math.sqrt(长 * 长 - (半径 - 8) ** 2)
    const 方位 = 角 + 转角
    const 纵 = 半径 * Math.cos(方位) - 侧 * Math.sin(方位)
    const 深 = 半径 * Math.sin(方位) + 侧 * Math.cos(方位)
    return {
      x: 900 + 轴 * Math.cos(Math.PI / 7) + 深 * Math.sin(Math.PI / 7),
      y: 110 + 纵,
      z: 深,
    }
  }
  const 入列 = (点组: 点[], 纹理 = false, 明度 = 0) => {
    片组.push({
      点: 点组,
      深度: 点组.reduce((和, 点) => 和 + 点.z, 0) / 点组.length,
      纹理,
      明度,
    })
  }
  const 路径 = (点组: 点[]) => {
    画笔.beginPath()
    点组.forEach((点, i) => (i ? 画笔.lineTo(点.x, 点.y) : 画笔.moveTo(点.x, 点.y)))
    画笔.closePath()
  }
  for (let i = 0; i < 6; i++) {
    const 角 = (i * Math.PI) / 3
    const 明度 = (Math.sin(角 + 转角) + 1) / 2
    // 中段六块切角冰面围成六棱环，外段留空，露出雪晶分枝。
    入列(
      [
        投影(骨长 * 0.24, 角 + 0.17),
        投影(骨长 * 0.19, 角 + 0.52),
        投影(骨长 * 0.24, 角 + 0.88),
        投影(骨长 * 0.6, 角 + 0.88),
        投影(骨长 * 0.68, 角 + 0.52),
        投影(骨长 * 0.6, 角 + 0.17),
      ],
      false,
      明度,
    )
    // 冰叶是透明平面素材，沿六根等长伞骨分片投影，随开度与轴向转角一起移动。
    for (let 段 = 0; 段 < 12; 段++) {
      const 端点 = [段 / 12, (段 + 1) / 12].map((t) => {
        const 径向 = 0.32 + t * 0.68
        const 长 = 径向 * 骨长
        const 宽 = (8 + 径向 * (外径 - 8)) * 0.76
        return [-1, 1].map((侧) => ({
          ...投影(长, 角, 侧 * 宽),
          u: t * 冰叶.width,
          v: ((侧 + 1) / 2) * 冰叶.height,
        }))
      })
      入列([端点[0][0], 端点[1][0], 端点[1][1]], true)
      入列([端点[0][0], 端点[1][1], 端点[0][1]], true)
    }
  }
  const 绘制片 = (片: 片) => {
    画笔.save()
    if (片.纹理) {
      const [甲, 乙, 丙] = 片.点
      const u1 = 乙.u! - 甲.u!,
        v1 = 乙.v! - 甲.v!,
        u2 = 丙.u! - 甲.u!,
        v2 = 丙.v! - 甲.v!
      const det = u1 * v2 - u2 * v1
      const a = ((乙.x - 甲.x) * v2 - (丙.x - 甲.x) * v1) / det
      const b = ((乙.y - 甲.y) * v2 - (丙.y - 甲.y) * v1) / det
      const c = ((丙.x - 甲.x) * u1 - (乙.x - 甲.x) * u2) / det
      const d = ((丙.y - 甲.y) * u1 - (乙.y - 甲.y) * u2) / det
      const 中心 = { x: (甲.x + 乙.x + 丙.x) / 3, y: (甲.y + 乙.y + 丙.y) / 3 }
      路径(
        片.点.map((点) => {
          const 距离 = Math.max(1, Math.hypot(点.x - 中心.x, 点.y - 中心.y))
          return {
            ...点,
            x: 点.x + ((点.x - 中心.x) / 距离) * 0.25,
            y: 点.y + ((点.y - 中心.y) / 距离) * 0.25,
          }
        }),
      )
      画笔.clip()
      画笔.globalAlpha = 片.深度 < 0 ? 0.66 : 0.97
      画笔.transform(a, b, c, d, 甲.x - a * 甲.u! - c * 甲.v!, 甲.y - b * 甲.u! - d * 甲.v!)
      画笔.drawImage(冰叶, 0, 0)
    } else {
      const 点组 = 片.点
      路径(点组)
      const 冰色 = 画笔.createLinearGradient(点组[0].x, 点组[0].y, 点组[4].x, 点组[4].y)
      冰色.addColorStop(0, '#a8dce66b')
      冰色.addColorStop(0.4, '#cbeef0c4')
      冰色.addColorStop(0.72, '#77bbd1a8')
      冰色.addColorStop(1, '#b9e3edc4')
      画笔.globalAlpha = 0.72 + 片.明度! * 0.23
      画笔.fillStyle = 冰色
      画笔.fill()
      画笔.strokeStyle = '#95cadce6'
      画笔.lineWidth = 1.8
      画笔.stroke()
      路径([点组[0], 点组[1], 点组[4]])
      画笔.fillStyle = '#e2faff2b'
      画笔.fill()
      画笔.beginPath()
      画笔.moveTo(点组[1].x, 点组[1].y)
      画笔.lineTo((点组[2].x + 点组[4].x) / 2, (点组[2].y + 点组[4].y) / 2)
      画笔.lineTo(点组[4].x, 点组[4].y)
      画笔.strokeStyle = '#e9faff78'
      画笔.lineWidth = 0.7
      画笔.stroke()
    }
    画笔.restore()
  }
  画笔.clearRect(0, 0, 1000, 220)
  片组.sort((甲, 乙) => 甲.深度 - 乙.深度)
  片组.filter((片) => 片.深度 < 0).forEach(绘制片)
  画笔.beginPath()
  画笔.moveTo(270, 110)
  画笔.lineTo(910, 110)
  画笔.strokeStyle = '#b8d9e3'
  画笔.lineWidth = 4
  画笔.stroke()
  片组.filter((片) => 片.深度 >= 0).forEach(绘制片)
  画笔.lineCap = 'round'
  for (let i = 0; i < 6; i++) {
    const 角 = (i * Math.PI) / 3
    const 根 = 投影(5, 角),
      尖 = 投影(骨长, 角)
    if (尖.z < 0) continue
    画笔.beginPath()
    画笔.moveTo(根.x, 根.y)
    画笔.lineTo(尖.x, 尖.y)
    画笔.strokeStyle = '#d8f3fa75'
    画笔.lineWidth = 1.1
    画笔.stroke()
    // 霜枝和小雪晶附着在伞骨外缘，跟随伞体投影，不另行挤压伞面。
    if (进度 > 0.12) {
      画笔.save()
      画笔.globalAlpha = ((进度 - 0.12) / 0.88) * (0.4 + (尖.z / 外径) * 0.4)
      画笔.strokeStyle = '#eafaff'
      画笔.lineWidth = 1.3
      for (let j = 0; j < 3; j++) {
        const 长 = 骨长 * (0.73 + j * 0.085)
        const 宽 = (8 + (长 / 骨长) * (外径 - 8)) * 0.58
        for (const 侧 of [-1, 1]) {
          const 起 = 投影(长 - 18, 角, 侧 * 宽 * 0.24)
          const 末 = 投影(长 + 20, 角, 侧 * 宽)
          画笔.beginPath()
          画笔.moveTo(起.x, 起.y)
          画笔.lineTo(末.x, 末.y)
          画笔.stroke()
        }
      }
      const 雪晶 = 投影(骨长 * 0.88, 角)
      画笔.translate(雪晶.x, 雪晶.y)
      画笔.rotate(角 + 转角 * 0.3)
      绘制雪花(画笔, 5 + 3 * 进度)
      画笔.restore()
    }
    if (进度 > 0.25) {
      const 相位 = (((-转角 * 0.9 + i / 6) % 1) + 1) % 1
      const 光点 = 投影(骨长 * (0.18 + 相位 * 0.75), 角)
      画笔.save()
      画笔.globalAlpha = ((进度 - 0.25) / 0.75) * Math.sin(相位 * Math.PI) * 0.85
      画笔.fillStyle = '#edfdff'
      画笔.shadowColor = '#b9e9ff'
      画笔.shadowBlur = 5
      路径([
        { x: 光点.x - 4, y: 光点.y, z: 0 },
        { x: 光点.x, y: 光点.y - 2, z: 0 },
        { x: 光点.x + 4, y: 光点.y, z: 0 },
        { x: 光点.x, y: 光点.y + 2, z: 0 },
      ])
      画笔.fill()
      画笔.restore()
    }
  }
  // 两层雪沿伞缘飘散；进出场与画布边缘均渐隐，复用伞体时钟和暂停逻辑。
  if (进度 > 0.2) {
    const 强度 = (进度 - 0.2) / 0.8
    for (let i = 0; i < 42; i++) {
      const 大雪花 = i < 14
      const 相位 = (((-转角 * (大雪花 ? 0.3125 : 0.475) + i * 0.618) % 1) + 1) % 1
      const x = 300 + ((i * 83) % 535) - 相位 * (大雪花 ? 44 : 68)
      const y = (i % 2 ? 145 : 24) + ((i * 17) % 31) + 相位 * 30
      const 尺寸 = 大雪花 ? 5.5 + (i % 4) * 1.5 : 0.7 + (i % 3) * 0.45
      const 淡出 = Math.min(1, (210 - y) / 18, (y - 10) / 12)
      画笔.save()
      画笔.globalAlpha = 强度 * Math.sin(相位 * Math.PI) * 淡出 * (大雪花 ? 0.8 : 0.66)
      画笔.translate(x, y)
      画笔.rotate(i + 相位 * 0.8)
      if (大雪花) {
        画笔.strokeStyle = i % 3 ? '#e6f6ff' : '#b9e5f5'
        画笔.lineWidth = i % 3 ? 1.1 : 1.4
        绘制雪花(画笔, 尺寸)
      } else {
        画笔.fillStyle = '#e4f6ff'
        画笔.beginPath()
        画笔.arc(0, 0, 尺寸, 0, Math.PI * 2)
        画笔.fill()
      }
      画笔.restore()
    }
  }
  画笔.fillStyle = '#a6d4e1'
  画笔.beginPath()
  画笔.ellipse(898, 110, 3.2, 8, 0, 0, Math.PI * 2)
  画笔.fill()
}
