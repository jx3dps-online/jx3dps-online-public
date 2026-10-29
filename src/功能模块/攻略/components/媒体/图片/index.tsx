import React from 'react'
import { Image } from 'antd'
import { 兜底图片 } from '../../../工具'

interface 图片类型 {
  src: string
  alt?: string
  /** 展示宽度，支持数字（px）或字符串（如 '50%'、'320px'）；只传宽度时高度按比例自适应 */
  width?: number | string
  /** 展示高度，支持数字（px）或字符串（如 '200px'）；只传高度时宽度按比例自适应 */
  高度?: number | string
}

function 图片(props: 图片类型) {
  const { src, alt, width, 高度 } = props
  // 尺寸规则：
  // - 不传尺寸：按**原图像素**显示，最多撑满正文列宽（maxWidth:100%）。
  //   上一版卡死 maxWidth:560px，把 980px 宽的循环图硬缩到 560，4K 下更显小；
  //   而 440×59 这类窄条本来就不传 width、走自然尺寸，不会被拉满，不需要那个上限。
  // - 传了尺寸：按传入值（px / 百分比都行），只保证不超出容器。
  // 注意：位图不会因为屏幕大就更清晰，想真正更大只能提高图源分辨率。
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={高度}
      fallback={兜底图片}
      style={{ borderRadius: 6, maxWidth: '100%' }}
    />
  )
}

export default 图片
