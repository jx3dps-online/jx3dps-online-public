import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Tooltip } from 'antd'
import type { 登阶进度属性 } from '../类型'
import 魂灯特效 from './魂灯特效'
import 螺旋气流 from './螺旋气流'
import 幻狐 from './幻狐'
import { 悬挂样式 } from './悬挂配置'
import 样式 from './index.module.less'

const 子不语 = `${GLOBAL_CDN_PREFIX}/20261029/zibuyu.png`

const 阶段名称 = ['灵灯未醒', '初窥星门', '渐悟星运', '星神降世']

export default function 太玄经进度({
  百分比,
  是否达成,
  忙碌 = false,
  完成数 = 0,
  总数 = 0,
}: 登阶进度属性) {
  const 武器容器 = useRef<HTMLDivElement>(null!)
  const 进度百分比 = 是否达成 ? 100 : Math.min(99.9, 百分比)
  const 展示百分比 = 进度百分比.toFixed(2)
  const 阶段名 = 是否达成 ? '镇御苍生' : 阶段名称[Math.floor(进度百分比 / 25)]
  const 比例 = 进度百分比 / 100
  const 进度样式 = {
    '--txj-progress': `${进度百分比}%`,
    '--txj-opacity': 0.82 + 比例 * 0.12,
  } as CSSProperties

  useEffect(() => {
    const 节点 = 武器容器.current
    const 动态偏好 = window.matchMedia('(prefers-reduced-motion: reduce)')
    let 可见 = true
    const 更新播放 = () => {
      节点.dataset.paused = String(动态偏好.matches || document.hidden || !可见)
    }
    const 可见观察 = new IntersectionObserver(([记录]) => {
      可见 = 记录.isIntersecting
      更新播放()
    })
    可见观察.observe(节点)
    更新播放()
    动态偏好.addEventListener('change', 更新播放)
    document.addEventListener('visibilitychange', 更新播放)
    return () => {
      可见观察.disconnect()
      动态偏好.removeEventListener('change', 更新播放)
      document.removeEventListener('visibilitychange', 更新播放)
    }
  }, [])

  return (
    <Tooltip
      title={`已完成 ${完成数} / ${总数} 项配装目标。完成度由部位达成、属性容量与秒伤进度加权得出，与武器品质、心法强度评级无关。`}
    >
      <div
        className={`${样式.进度条} ${是否达成 ? 样式.已达成 : ''} ${忙碌 ? 样式.忙碌 : ''}`}
        role='progressbar'
        aria-label='太玄经目标完成度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(展示百分比)}
        aria-valuetext={忙碌 ? '正在评估' : `${展示百分比}%，${完成数} / ${总数} 项`}
        aria-busy={忙碌}
        style={进度样式}
      >
        <div className={样式.标题}>
          <span className={样式.武器名}>{忙碌 ? '天机推演中' : 阶段名}</span>
          <div className={样式.完成度}>
            <b>
              {忙碌 ? '…' : 展示百分比}
              <small>%</small>
            </b>
            <em>目标完成度</em>
          </div>
        </div>
        <div
          ref={武器容器}
          className={样式.武器区域}
          style={悬挂样式}
          data-playing={是否达成 && !忙碌}
          aria-hidden='true'
        >
          {是否达成 && !忙碌 && (
            <div className={`${样式.画布} ${样式.背面层}`}>
              <螺旋气流 层='后' />
            </div>
          )}
          {[样式.暗态, 样式.亮态].map((状态样式) => (
            <div key={状态样式} className={状态样式}>
              <div className={样式.画布}>
                <img
                  className={`${样式.固定部分} ${样式.灯杆}`}
                  src={子不语}
                  alt=''
                  decoding='async'
                />
                <div className={样式.悬偶}>
                  <img className={样式.悬偶内容} src={子不语} alt='' decoding='async' />
                </div>
                <div className={样式.悬饰}>
                  <img className={样式.悬饰内容} src={子不语} alt='' decoding='async' />
                </div>
              </div>
            </div>
          ))}
          {是否达成 && !忙碌 && (
            <div className={`${样式.画布} ${样式.特效层}`}>
              <魂灯特效 />
              <螺旋气流 层='前' />
              <幻狐 />
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  )
}
