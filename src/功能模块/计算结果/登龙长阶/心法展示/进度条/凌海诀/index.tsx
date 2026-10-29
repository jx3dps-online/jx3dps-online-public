import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 伞面 from './伞面'
import 仙气 from './仙气'
import 样式 from './index.module.less'
const 素伞 = `${GLOBAL_CDN_PREFIX}/20261025/xianyu-susan.png`

const 阶段名称 = ['敛剑作骨', '青云化羽', '蜃影凝神', '乘风蹈海', '墟海引归']

function 仙舆({ 进度, 忙碌 }: { 进度: number; 忙碌: boolean }) {
  const 标识 = useId()
  const [伞面就绪, 设置伞面就绪] = useState(false)
  const 风息 = Math.max(0, (进度 - 0.18) / 0.82)

  return (
    <div className={样式.武器区域} aria-hidden='true'>
      <div className={样式.海光} style={{ opacity: 风息 }}>
        <i />
      </div>
      <svg className={样式.仙舆} viewBox='0 0 1000 220' focusable='false'>
        <defs>
          <clipPath id={`${标识}-shaft`}>
            <path d='M0 0H282V220H0Z' />
          </clipPath>
          <clipPath id={`${标识}-tip`}>
            <path d='M834 0H1000V220H834Z' />
          </clipPath>
          <g id={`${标识}-frame`}>
            <image
              href={素伞}
              x='0'
              y='-52'
              width='1000'
              height='333.333'
              clipPath={`url(#${标识}-shaft)`}
            />
            <g transform='translate(900 110) scale(.6) translate(-834 -110)'>
              <image
                href={素伞}
                x='0'
                y='-52'
                width='1000'
                height='333.333'
                clipPath={`url(#${标识}-tip)`}
              />
            </g>
          </g>
          <linearGradient id={`${标识}-wind`}>
            <stop offset='0' stopColor='#b9dadf' stopOpacity='0' />
            <stop offset='.5' stopColor='#d8eee5' stopOpacity='.65' />
            <stop offset='1' stopColor='#a2c6d5' stopOpacity='0' />
          </linearGradient>
          <mask
            id={`${标识}-shaft-mask`}
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width='1000'
            height='220'
            style={{ maskType: 'alpha' }}
          >
            <use href={`#${标识}-frame`} />
          </mask>
        </defs>
        <仙气 进度={进度} 忙碌={忙碌} />
        <g className={样式.风线} stroke={`url(#${标识}-wind)`} style={{ opacity: 风息 }}>
          <path d='M90 138C270 196 500 22 862 72' />
          <path d='M140 155C380 220 572 142 899 155' />
          <path d='M210 74C425 28 610 188 936 121' />
        </g>
        <g className={样式.伞体} visibility={伞面就绪 ? undefined : 'hidden'}>
          <path className={样式.中轴} d='M270 110H910' />
          <use className={样式.伞柄} href={`#${标识}-frame`} />
          {进度 >= 0.25 && !忙碌 && (
            <g mask={`url(#${标识}-shaft-mask)`}>
              <rect
                className={样式.流光}
                x='0'
                y='0'
                width='140'
                height='220'
                fill={`url(#${标识}-wind)`}
              />
            </g>
          )}
        </g>
        {进度 >= 0.5 && !忙碌 && (
          <g className={样式.海沫} style={{ opacity: 0.3 + 进度 * 0.45 }}>
            {Array.from({ length: 12 }, (_, 序号) => (
              <g key={序号} style={{ '--lhj-mote': 序号 } as CSSProperties}>
                <path d={`M${125 + 序号 * 60} ${序号 % 2 ? 165 : 56}q5 -5 11 -2q-5 6 -11 2Z`} />
              </g>
            ))}
          </g>
        )}
        {进度 === 1 && <ellipse className={样式.涟漪} cx='660' cy='177' rx='205' ry='16' />}
      </svg>
      <伞面 进度={进度} 忙碌={忙碌} 就绪={伞面就绪} 更新就绪={设置伞面就绪} />
    </div>
  )
}

export default function 凌海诀进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 阶段 = 是否达成 ? 4 : Math.floor(显示百分比 / 25)
  const 进度 = 显示百分比 / 100

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='凌海诀 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={
          { '--lhj-progress': `${显示百分比}%`, '--lhj-light': 0.7 + 进度 * 0.3 } as CSSProperties
        }
      >
        <div className={样式.标题}>
          <span>{阶段名称[阶段]}</span>
          <div>
            <b>
              {忙碌 ? '…' : 显示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <仙舆 进度={进度} 忙碌={忙碌} />
        <div className={样式.进度轨} aria-hidden='true'>
          <i />
          {[25, 50, 75].map((节点) => (
            <span
              key={节点}
              style={{ left: `${节点}%` }}
              className={显示百分比 >= 节点 ? 样式.已点亮 : ''}
            />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
