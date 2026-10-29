export const 烟雾区域 = [
  {
    名称: '悬偶',
    路径: 'M158 227C126 232 95 221 85 206S93 177 103 164C88 161 80 151 88 137S126 128 156 122C174 118 192 108 221 101L232 119C212 127 186 135 160 137S115 138 112 147C120 153 133 158 127 174S100 191 105 202C116 213 142 204 165 211Z',
    中心: '24.166667% 60%',
    横移: '-2.666667%',
    纵移: '-6.666667%',
    缩放: 1.12,
    旋转: '-3deg',
    周期: 4.6,
    延迟: -1,
  },
  {
    名称: '器首',
    路径: 'M219 104C211 80 230 42 247 32S299 16 318 24L321 49C300 45 290 51 294 66C313 83 321 104 305 119L291 128C273 123 240 125 226 114Z',
    中心: '45.166667% 30%',
    横移: '1.333333%',
    纵移: '-6%',
    缩放: 1.16,
    旋转: '3deg',
    周期: 5.2,
    延迟: -2.4,
  },
  {
    名称: '器身',
    路径: 'M333 117C346 99 351 76 374 66S410 65 418 82C428 101 405 115 423 122S463 128 485 128L486 142C457 149 430 144 412 135S397 109 399 93C402 81 393 78 384 82S364 108 346 124Z',
    中心: '66.333333% 34.333333%',
    横移: '3%',
    纵移: '-4%',
    缩放: 1.12,
    旋转: '3deg',
    周期: 5.8,
    延迟: -3.2,
  },
]

let 烟雾素材缓存: string[] | undefined

export function 获取烟雾素材(图像: HTMLImageElement): string[] {
  if (烟雾素材缓存) return 烟雾素材缓存

  const 提取画布 = document.createElement('canvas')
  const 遮罩画布 = document.createElement('canvas')
  const 合成画布 = document.createElement('canvas')
  const 柔化画布 = document.createElement('canvas')
  for (const 画布 of [提取画布, 遮罩画布, 合成画布, 柔化画布]) {
    画布.width = 600
    画布.height = 300
  }
  const 提取上下文 = 提取画布.getContext('2d')!
  const 遮罩上下文 = 遮罩画布.getContext('2d')!
  const 合成上下文 = 合成画布.getContext('2d')!
  const 柔化上下文 = 柔化画布.getContext('2d')!
  提取上下文.drawImage(图像, 0, 0, 1200, 400)
  const 图像数据 = 提取上下文.getImageData(0, 0, 600, 300)
  const 像素 = 图像数据.data
  for (let 索引 = 0; 索引 < 像素.length; 索引 += 4) {
    const 青色差 = (-3 * 像素[索引] + 1.5 * 像素[索引 + 1] + 1.5 * 像素[索引 + 2]) / 255 - 0.3
    像素[索引 + 3] *= Math.max(0, Math.min(1, 青色差))
  }
  提取上下文.putImageData(图像数据, 0, 0)
  遮罩上下文.fillStyle = '#fff'
  遮罩上下文.strokeStyle = '#fff'
  遮罩上下文.lineWidth = 6
  柔化上下文.filter = 'blur(1px)'

  烟雾素材缓存 = 烟雾区域.map((区域) => {
    遮罩上下文.clearRect(0, 0, 600, 300)
    遮罩上下文.filter = 'blur(3px)'
    const 轮廓 = new Path2D(区域.路径)
    遮罩上下文.fill(轮廓)
    遮罩上下文.stroke(轮廓)
    遮罩上下文.filter = 'none'
    遮罩上下文.clearRect(235, 123, 133, 43)

    合成上下文.clearRect(0, 0, 600, 300)
    合成上下文.globalCompositeOperation = 'source-over'
    合成上下文.drawImage(提取画布, 0, 0)
    合成上下文.globalCompositeOperation = 'destination-in'
    合成上下文.drawImage(遮罩画布, 0, 0)

    柔化上下文.clearRect(0, 0, 600, 300)
    柔化上下文.drawImage(合成画布, 0, 0)
    return 柔化画布.toDataURL('image/png')
  })
  return 烟雾素材缓存
}
