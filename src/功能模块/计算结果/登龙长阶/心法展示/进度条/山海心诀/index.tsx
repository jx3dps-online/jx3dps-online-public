import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 样式 from './index.module.less'
const 素囊 = `${GLOBAL_CDN_PREFIX}/20261025/jinwuhuishou-sunang.png`
const 成品 = `${GLOBAL_CDN_PREFIX}/20261025/jinwuhuishou-chengpin.png`

const 阶段名称 = ['素囊初备', '金纹初醒', '流矢生辉', '金乌映日', '此愿已成']

export default function 山海心诀进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 显示百分比 = 是否达成 ? 100 : Math.min(99, Math.round(百分比))
  const 比例 = 显示百分比 / 100
  const 阶段 = 是否达成 ? 4 : Math.floor(显示百分比 / 25)
  const 进度样式 = {
    '--shxj-progress': `${显示百分比}%`,
    '--shxj-opacity': 0.8 + 0.1 * 比例,
    '--shxj-awaken': Math.max(0, (比例 - 0.25) / 0.75),
    '--shxj-feathers': Math.max(0, (比例 - 0.5) / 0.5),
    '--shxj-tail': Math.max(0, (比例 - 0.75) / 0.25),
  } as CSSProperties

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='山海心诀 · 目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={显示百分比}
        aria-valuetext={忙碌 ? '正在评估' : `${显示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={进度样式}
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
        <div className={样式.武器区域} aria-hidden='true'>
          <div className={样式.画布}>
            <div className={`${样式.特效} ${样式.背景光}`}>
              <i />
            </div>
            <div className={样式.素囊}>
              <img src={素囊} alt='' decoding='async' />
            </div>
            <img className={`${样式.揭示} ${样式.成品}`} src={成品} alt='' decoding='async' />
            {阶段 >= 1 && !忙碌 && (
              <div className={`${样式.揭示} ${样式.流光}`}>
                <div
                  className={样式.羽甲}
                  style={{ WebkitMaskImage: `url(${成品})`, maskImage: `url(${成品})` }}
                >
                  <i />
                </div>
              </div>
            )}
            <div className={`${样式.特效} ${样式.金纹}`}>
              <i />
            </div>
            <div className={`${样式.特效} ${样式.箭羽}`}>
              <i />
            </div>
            {阶段 >= 2 && !忙碌 && (
              <div className={`${样式.特效} ${样式.羽屑}`}>
                {Array.from({ length: 10 }, (_, 序号) => (
                  <i key={序号} style={{ '--shxj-feather': 序号 } as CSSProperties} />
                ))}
              </div>
            )}
            {是否达成 && !忙碌 && (
              <div className={`${样式.特效} ${样式.掠光}`}>
                <i />
                <i />
              </div>
            )}
          </div>
        </div>
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
