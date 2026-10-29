import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useId } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 样式 from './卷轴.module.less'
const 卷轴 = `${GLOBAL_CDN_PREFIX}/20261025/xinghe-juanzhou.png`
const 双轴 = `${GLOBAL_CDN_PREFIX}/20261025/juanzhou-shuangzhou.png`

// 按 2048×768 原图标定各阶段的卷面上、下连接点；轴与切口共用这组坐标。
const 连接点 = [
  [1770, 260, 1748, 500],
  [1391.5, 338, 1386, 578],
  [1013, 345, 1024, 568],
  [634.5, 352, 662, 575],
  [256, 370, 300, 620],
]

export default function 无方进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 比例 = (是否达成 ? 100 : 百分比) / 100
  const 裁切标识 = useId()
  const 段 = Math.min(3, Math.floor(比例 * 4))
  const 段内比例 = 比例 * 4 - 段
  const [上横, 上纵, 下横, 下纵] = 连接点[段].map(
    (值, 索引) => 值 + (连接点[段 + 1][索引] - 值) * 段内比例,
  )
  const 横差 = 下横 - 上横
  const 纵差 = 下纵 - 上纵
  // 相似变换将原图的 (256,370)、(300,620) 同时映射到当前连接点。
  const 缩放余弦 = (44 * 横差 + 250 * 纵差) / (44 * 44 + 250 * 250)
  const 缩放正弦 = (44 * 纵差 - 250 * 横差) / (44 * 44 + 250 * 250)
  const 位移横 = 上横 - 缩放余弦 * 256 + 缩放正弦 * 370
  const 位移纵 = 上纵 - 缩放正弦 * 256 - 缩放余弦 * 370
  const 切口上 = ((上横 - (上纵 * 横差) / 纵差) / 2048) * 100
  const 切口下 = ((下横 + ((768 - 下纵) * 横差) / 纵差) / 2048) * 100

  return (
    <Tooltip title={`已完成 ${完成数} / ${总数} 项配装目标。卷轴展开程度表示目标完成度。`}>
      <div
        className={样式.进度}
        role='progressbar'
        aria-label='无方 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
      >
        <div className={样式.标题}>
          <span>{是否达成 ? '此愿已成' : '本程目标'}</span>
          <div>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <div className={样式.画面} aria-hidden='true'>
          <svg viewBox='180 60 1868 640' focusable='false'>
            <svg width='2048' height='768' viewBox='0 0 2048 768' overflow='visible'>
              <defs>
                <linearGradient id={`${裁切标识}-星系颜色`} x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0' stopColor='#88cfff' stopOpacity='0.25' />
                  <stop offset='0.32' stopColor='#b9a0ff' />
                  <stop offset='0.65' stopColor='#78baff' stopOpacity='0.5' />
                  <stop offset='1' stopColor='#d4eaff' />
                </linearGradient>
                <path
                  id={`${裁切标识}-星系路径`}
                  pathLength='100'
                  d='M 1655 172 C 1655 120 1800 130 1895 178 S 1950 263 1825 235 S 1660 213 1655 172 Z'
                />
                <clipPath id={`${裁切标识}-前景星系`}>
                  <path d='M 1620 182 L 1980 210 L 1980 290 L 1620 270 Z' />
                </clipPath>
                <clipPath id={`${裁切标识}-左轴`}>
                  <rect width='820' height='768' />
                </clipPath>
                <clipPath id={`${裁切标识}-主轴`}>
                  <rect x='1228' width='820' height='768' />
                </clipPath>
                <clipPath id={`${裁切标识}-卷面`}>
                  <polygon points='260,370 350,372 500,367 700,347 900,344 1100,347 1350,348 1450,329 1600,291 1770,255 1748,500 1650,547 1450,578 1300,573 1100,565 900,567 700,575 500,598 300,620' />
                </clipPath>
              </defs>
              <g transform='rotate(4.3 1770 380)'>
                <g className={样式.后景星系}>
                  <use
                    className={样式.星系辉光}
                    href={`#${裁切标识}-星系路径`}
                    stroke={`url(#${裁切标识}-星系颜色)`}
                  />
                  <use className={样式.星系星尘} href={`#${裁切标识}-星系路径`} />
                </g>
                <g className={样式.分层} style={{ opacity: 是否达成 ? 0 : 1 }}>
                  <g
                    className={样式.卷面}
                    style={{
                      clipPath: `polygon(0 0, ${切口上}% 0, ${切口下}% 100%, 0 100%) view-box`,
                    }}
                  >
                    <rect
                      width='2048'
                      height='768'
                      fill='#aeb9c9'
                      opacity={0.16}
                      clipPath={`url(#${裁切标识}-卷面)`}
                    />
                  </g>
                  <g
                    className={样式.卷面}
                    style={{
                      clipPath: `polygon(${切口上}% 0, 100% 0, 100% 100%, ${切口下}% 100%) view-box`,
                    }}
                  >
                    <image
                      href={卷轴}
                      width='2048'
                      height='768'
                      clipPath={`url(#${裁切标识}-卷面)`}
                    />
                  </g>
                  <g
                    className={样式.左轴}
                    style={{
                      transform: `matrix(${缩放余弦}, ${缩放正弦}, ${-缩放正弦}, ${缩放余弦}, ${位移横}, ${位移纵})`,
                      opacity: Math.min(1, 比例 / 0.08),
                    }}
                  >
                    <image
                      href={双轴}
                      width='2048'
                      height='768'
                      clipPath={`url(#${裁切标识}-左轴)`}
                    />
                  </g>
                  <image
                    href={双轴}
                    width='2048'
                    height='768'
                    clipPath={`url(#${裁切标识}-主轴)`}
                  />
                </g>
                <image
                  className={样式.完整}
                  href={卷轴}
                  width='2048'
                  height='768'
                  style={{ opacity: 是否达成 ? 1 : 0 }}
                />
                <g className={样式.主轴发光}>
                  <path className={样式.主轴柔光} d='M 1803 258 L 1772 493' />
                  <path className={样式.主轴亮边} d='M 1788 270 L 1759 483' />
                </g>
                {是否达成 && (
                  <g className={样式.满阶星光}>
                    <path
                      className={样式.满阶流光}
                      pathLength='100'
                      d='M 410 315 Q 565 270 745 295 M 1110 300 Q 1280 255 1460 280 M 570 640 Q 735 605 920 635 M 1240 620 Q 1390 635 1550 575'
                    />
                    {[
                      [380, 315],
                      [570, 280],
                      [820, 300],
                      [1050, 260],
                      [1300, 275],
                      [1535, 295],
                      [465, 640],
                      [740, 620],
                      [1000, 650],
                      [1270, 610],
                      [1510, 585],
                    ].map(([横, 纵], 索引) => (
                      <g key={索引} transform={`translate(${横} ${纵})`}>
                        <path
                          className={样式.星点}
                          d='M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z'
                          style={{
                            animationDelay: `${索引 * -0.57}s`,
                            fill: 索引 % 3 === 0 ? '#ffe7ac' : '#c5e5ff',
                          }}
                        />
                      </g>
                    ))}
                  </g>
                )}
                <g className={样式.轴端星空}>
                  <g clipPath={`url(#${裁切标识}-前景星系)`}>
                    <use
                      className={样式.星系辉光}
                      href={`#${裁切标识}-星系路径`}
                      stroke={`url(#${裁切标识}-星系颜色)`}
                    />
                    <use className={样式.星系星尘} href={`#${裁切标识}-星系路径`} />
                  </g>
                  <ellipse
                    className={样式.轴端星点}
                    cx='1800'
                    cy='200'
                    rx='132'
                    ry='38'
                    transform='rotate(18 1800 200)'
                    pathLength='100'
                  />
                  {[
                    [1660, 145],
                    [1730, 115],
                    [1870, 130],
                    [1935, 210],
                    [1845, 265],
                    [1695, 235],
                  ].map(([横, 纵], 索引) => (
                    <g key={索引} transform={`translate(${横} ${纵})`}>
                      <path
                        className={样式.星点}
                        d='M 0 -9 L 2 -2 L 9 0 L 2 2 L 0 9 L -2 2 L -9 0 L -2 -2 Z'
                        style={{
                          animationDelay: `${索引 * -0.43}s`,
                          animationDuration: `${3.6 + (索引 % 3) * 0.7}s`,
                          fill: 索引 % 3 === 0 ? '#ffe7ac' : '#c5e5ff',
                        }}
                      />
                      <circle
                        cx='26'
                        cy={索引 % 2 === 0 ? 14 : -14}
                        r='3'
                        fill='#bcdcff'
                        opacity='0.55'
                      />
                    </g>
                  ))}
                </g>
              </g>
            </svg>
          </svg>
        </div>
      </div>
    </Tooltip>
  )
}
