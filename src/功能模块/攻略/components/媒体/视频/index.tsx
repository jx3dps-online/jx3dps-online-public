import React, { useState } from 'react'
import { CaretRightOutlined } from '@ant-design/icons'
import styles from './index.module.less'

interface 视频类型 {
  限制嵌入?: boolean
  /** 视频类型 */
  类型: 'bilibili' | 'iframe' | 'mp4'
  /** bilibili 的 BV 号 / iframe 的完整 src / mp4 地址 */
  地址: string
  标题?: string
  /** 自定义宽度，支持数字（px）或字符串（如 '50%'、'320px'）；只传宽度时高度按比例自适应 */
  宽度?: number | string
  /** 自定义高度，支持数字（px）或字符串（如 '315px'）；只传高度时宽度按比例自适应 */
  高度?: number | string
}

function 视频(props: 视频类型) {
  const { 类型, 地址, 标题, 宽度, 高度, 限制嵌入 } = props
  // 默认只展示封面，点击后才挂载播放器：避免页面打开时自动播放与提前加载。
  const [已启动, 设置已启动] = useState(false)

  let 嵌入地址 = 地址
  if (类型 === 'bilibili') {
    const bvid = 地址?.replace(/^BV/i, '') ? `BV${地址?.replace(/^BV/i, '')}` : 地址
    嵌入地址 = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1`
    if (已启动) 嵌入地址 += '&autoplay=1'
  }

  // 只传宽度或高度时，另一方按原始比例自适应；
  // 都没传时铺满容器，但上限跟着字号走（45em）——1080p 约 820px、4K 约 1250px。
  // 之前写死 560px，4K 下 16:9 只剩一小块；写死更大的 px 又会在 1080p 上占掉大半屏。
  // 想精确控制就显式传 宽度（如 宽度={760}），显式值不受这个上限影响。
  const 尺寸样式: React.CSSProperties = {}
  if (宽度 !== undefined) 尺寸样式.width = 宽度
  if (高度 !== undefined) 尺寸样式.height = 高度
  if (宽度 === undefined && 高度 === undefined) {
    尺寸样式.width = '100%'
    尺寸样式.maxWidth = 'min(100%, calc(var(--guide-font, 15px) * 45))'
  }

  const 渲染封面 = (样式?: React.CSSProperties) => (
    <button
      type='button'
      className={styles['guide-video-cover']}
      style={样式}
      onClick={() => 设置已启动(true)}
      aria-label={`播放${标题 || '视频'}`}
    >
      <span className={styles['guide-video-play']} aria-hidden='true'>
        <CaretRightOutlined />
      </span>
      <span className={styles['guide-video-hint']}>点击播放</span>
    </button>
  )

  if (类型 === 'mp4') {
    return (
      <div className={styles['guide-video']}>
        {标题 ? <div className={styles['guide-video-title']}>{标题}</div> : null}
        {已启动 ? (
          <video
            className={styles['guide-video-player']}
            src={地址}
            controls
            autoPlay
            style={尺寸样式}
          />
        ) : (
          渲染封面({ ...尺寸样式, ...(高度 === undefined ? { aspectRatio: '16 / 9' } : {}) })
        )}
      </div>
    )
  }

  return (
    <div className={styles['guide-video']}>
      {标题 ? <div className={styles['guide-video-title']}>{标题}</div> : null}
      <div className={styles['guide-video-wrap']} style={尺寸样式}>
        {已启动 ? (
          <iframe
            sandbox={
              限制嵌入
                ? 类型 === 'bilibili'
                  ? 'allow-scripts allow-same-origin allow-presentation'
                  : 'allow-scripts allow-presentation'
                : undefined
            }
            className={styles['guide-video-iframe']}
            src={嵌入地址}
            title={标题 || '视频'}
            scrolling='no'
            frameBorder='no'
            allow='autoplay; fullscreen; picture-in-picture; encrypted-media'
            allowFullScreen
          />
        ) : (
          渲染封面()
        )}
      </div>
    </div>
  )
}

export default 视频
