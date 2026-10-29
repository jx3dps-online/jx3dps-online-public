import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 样式 from './index.module.less'
const 素刃 = `${GLOBAL_CDN_PREFIX}/20261025/changqiang-suren.png`
const 寒锋凌日 = `${GLOBAL_CDN_PREFIX}/20261025/changqiang-hanfenglingri.png`

const 阶段名称 = ['蓄势待发', '初露锋芒', '寒光渐盛', '寒锋凌日', '此愿已成']

function 枪头电弧() {
  return (
    <svg className={样式.电弧} viewBox='0 0 120 55' preserveAspectRatio='none' focusable='false'>
      <g>
        <path d='M62 27 56 21 48 23 44 14 33 18 27 11 16 13 M44 14 46 7 38 3' />
      </g>
      <g>
        <path d='M63 27 74 29 78 36 89 33 93 41 105 37 M89 33 94 27 102 28' />
      </g>
    </svg>
  )
}

function 长枪({ 阶段, 忙碌 }: { 阶段: number; 忙碌: boolean }) {
  return (
    <div className={样式.武器区域} aria-hidden='true'>
      <div className={样式.画布}>
        {阶段 >= 1 && (
          <div className={样式.背景光} style={{ opacity: 阶段 * 0.22 }}>
            <i />
          </div>
        )}
        <img className={样式.素刃} src={素刃} alt='' decoding='async' />
        <img className={样式.成品} src={寒锋凌日} alt='' decoding='async' />
        <div className={样式.点亮特效} key={阶段}>
          {阶段 >= 1 && !忙碌 && (
            <>
              <div
                className={样式.刃面流光}
                style={{ WebkitMaskImage: `url(${寒锋凌日})`, maskImage: `url(${寒锋凌日})` }}
              >
                <i />
              </div>
              <div className={样式.枪脊流光}>
                <i />
              </div>
            </>
          )}
          {阶段 >= 2 && !忙碌 && (
            <div className={样式.霜屑} style={{ opacity: 0.4 + (阶段 - 2) * 0.3 }}>
              {Array.from({ length: 14 }, (_, 序号) => (
                <i key={序号} style={{ '--axzy-spark': 序号 } as CSSProperties} />
              ))}
            </div>
          )}
          {阶段 >= 3 && (
            <div className={样式.枪锋}>
              <i />
            </div>
          )}
          {阶段 >= 3 && !忙碌 && <枪头电弧 />}
          {阶段 === 4 && !忙碌 && (
            <div className={样式.破阵}>
              <i />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function 傲血战意进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 阶段 = 是否达成 ? 4 : Math.floor(显示百分比 / 25)

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 && !忙碌 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='傲血战意 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={{ '--axzy-progress': `${显示百分比}%` } as CSSProperties}
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
        <长枪 阶段={阶段} 忙碌={忙碌} />
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
