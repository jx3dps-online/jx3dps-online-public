export default function 创建龙纹流光(图片: HTMLImageElement) {
  const 纹样 = document.createElement('canvas')
  纹样.width = 1024
  纹样.height = 512
  const 纹笔 = 纹样.getContext('2d')
  const 光带 = document.createElement('canvas')
  光带.width = 纹样.width
  光带.height = 纹样.height
  const 光笔 = 光带.getContext('2d')
  const 成品 = document.createElement('canvas')
  成品.width = 纹样.width
  成品.height = 纹样.height
  const 画笔 = 成品.getContext('2d')
  if (!纹笔 || !光笔 || !画笔) return

  纹笔.translate(1024, 0)
  纹笔.scale(-1, 1)
  for (let 序号 = 0; 序号 < 2; 序号++) {
    纹笔.drawImage(图片, 128, 序号 * 256, 768, 256)
  }
  纹笔.setTransform(1, 0, 0, 1, 0, 0)
  纹笔.globalCompositeOperation = 'source-in'
  const 底色 = 纹笔.createLinearGradient(0, 0, 1024, 0)
  底色.addColorStop(0, '#c1cbce')
  底色.addColorStop(0.45, '#d4dcde')
  底色.addColorStop(0.72, '#dbe1e2')
  底色.addColorStop(1, '#c5ced0')
  纹笔.fillStyle = 底色
  纹笔.fillRect(0, 0, 1024, 512)

  return (进度: number, 时间: number) => {
    const 亮度 = Math.max(0, (进度 - 0.12) / 0.88)
    画笔.clearRect(0, 0, 1024, 512)
    if (!亮度) return 成品
    画笔.globalAlpha = 亮度 * 0.58
    画笔.drawImage(纹样, 0, 0)
    const 中心 = ((时间 % 7200) / 7200) * 1664 - 320
    光笔.clearRect(0, 0, 1024, 512)
    光笔.globalCompositeOperation = 'source-over'
    光笔.drawImage(纹样, 0, 0)
    光笔.globalCompositeOperation = 'source-in'
    const 光色 = 光笔.createLinearGradient(中心 - 280, 0, 中心 + 280, 0)
    for (const [位置, 颜色] of [
      [0, '#d7dfe100'],
      [0.25, '#dce4e6'],
      [0.45, '#f0f4f4'],
      [0.62, '#f5f7f7'],
      [0.8, '#e1e7e8'],
      [1, '#d7dfe100'],
    ] as const)
      光色.addColorStop(位置, 颜色)
    光笔.fillStyle = 光色
    光笔.fillRect(0, 0, 1024, 512)
    画笔.globalAlpha = 亮度 * 0.62
    画笔.drawImage(光带, 0, 0)
    return 成品
  }
}
