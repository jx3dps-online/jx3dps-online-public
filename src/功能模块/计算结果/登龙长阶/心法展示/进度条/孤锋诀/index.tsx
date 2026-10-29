import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useId, type CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 流光 from './流光'
import 样式 from './index.module.less'
import './横刀.less'
const 素刃 = `${GLOBAL_CDN_PREFIX}/20261025/yixijianhan-suren.png`
const 成品 = `${GLOBAL_CDN_PREFIX}/20261025/yixijianhan-chengpin.png`
const 星河 = `${GLOBAL_CDN_PREFIX}/20261025/yixijianhan-xinghe.png`

const 阶段名称 = ['素刃初成', '微隙初明', '星河渐现', '一隙见瀚', '此愿已成']

function 环绕星带({ 前方 }: { 前方: boolean }) {
  const 遮罩编号 = useId()
  const 弧线 = 前方
    ? 'M 0 80 C 30 142 90 142 120 80 M 240 80 C 270 142 330 142 360 80 M 480 80 C 510 142 570 142 600 80'
    : 'M 120 80 C 150 18 210 18 240 80 M 360 80 C 390 18 450 18 480 80 M 600 80 C 630 18 690 18 720 80'
  return (
    <div className={`${样式.特效} ${样式.环绕} ${前方 ? 样式.前带 : 样式.后带}`}>
      <div className={样式.缠绕范围}>
        <div className={样式.星带}>
          {[0, 1].map((序号) => (
            <svg key={序号} viewBox='0 0 720 160' preserveAspectRatio='none' focusable='false'>
              <defs>
                <mask
                  id={`${遮罩编号}-${序号}`}
                  maskUnits='userSpaceOnUse'
                  x='0'
                  y='0'
                  width='720'
                  height='160'
                >
                  <path d={弧线} fill='none' stroke='white' strokeWidth='18' />
                </mask>
              </defs>
              <path className={样式.星带雾} d={弧线} fill='none' />
              <image
                className={样式.星带纹理}
                href={星河}
                width='720'
                height='160'
                preserveAspectRatio='none'
                mask={`url(#${遮罩编号}-${序号})`}
              />
              <path className={样式.星带芯} d={弧线} fill='none' />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function 孤锋诀进度({
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
    '--gfj-progress': `${显示百分比}%`,
    '--gfj-opacity': 0.8 + 比例 * 0.1,
    '--gfj-flow': Math.max(0, (比例 - 0.25) / 0.75),
    '--gfj-orbit': Math.max(0, (比例 - 0.5) / 0.5),
    '--gfj-ember': Math.max(0, (比例 - 0.75) / 0.25),
  } as CSSProperties
  const 实体遮罩 = { WebkitMaskImage: `url(${成品})`, maskImage: `url(${成品})` }

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、职业强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 ? 样式.已达成 : ''}`}
        role='progressbar'
        aria-label='个人目标完成度'
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
            <div className={`${样式.特效} ${样式.柔光}`}>
              <i />
            </div>
            {阶段 >= 2 && !忙碌 && <环绕星带 前方={false} />}
            <div className={样式.素刃}>
              <img src={素刃} alt='' decoding='async' />
            </div>
            <img className={`${样式.揭示} ${样式.成品}`} src={成品} alt='' decoding='async' />
            {阶段 >= 1 && !忙碌 && (
              <div className={`${样式.揭示} ${样式.刃内}`}>
                <div className={样式.实体} style={实体遮罩}>
                  <div className={样式.刃面}>
                    <div className={样式.星河带}>
                      {[0, 1, 2].map((序号) => (
                        <img
                          key={序号}
                          src={星河}
                          alt=''
                          decoding='async'
                          style={{ '--gfj-tile': 序号 } as CSSProperties}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={`${样式.特效} ${样式.裂隙}`}>
              <div className={样式.实体} style={实体遮罩}>
                <i />
              </div>
            </div>
            <div className={`${样式.特效} ${样式.光核}`}>
              <i />
            </div>
            <div className={样式.特效}>
              <流光 百分比={显示百分比} 是否达成={是否达成} 忙碌={忙碌} />
            </div>
            {阶段 >= 2 && !忙碌 && <环绕星带 前方 />}
            {阶段 >= 2 && !忙碌 && (
              <div className={`${样式.特效} ${样式.星屑}`}>
                {Array.from({ length: 12 }, (_, 序号) => (
                  <i key={序号} style={{ '--gfj-star': 序号 } as CSSProperties} />
                ))}
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
