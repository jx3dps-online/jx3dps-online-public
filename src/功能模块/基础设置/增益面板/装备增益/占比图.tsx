import React, { useEffect, useMemo, useRef } from 'react'
import { Chart } from '@antv/g2'
import styles from './index.module.less'

function 占比图({ 数据, 标题 }: { 数据: { 名称: string; 数值: number }[]; 标题: string }) {
  const 容器 = useRef<HTMLDivElement>(null)
  const 图表数据 = useMemo(() => {
    const 总数 = 数据.reduce((和, 项) => 和 + 项.数值, 0)
    return 数据.map((项, 索引) => ({
      ...项,
      占比: `${((项.数值 / 总数) * 100).toFixed(2)}%`,
      颜色: `hsl(${(索引 * 137.508 + 210) % 360}, 62%, 52%)`,
    }))
  }, [数据])
  useEffect(() => {
    if (!容器.current || !图表数据.length) return
    const 图表 = new Chart({ container: 容器.current, autoFit: true, height: 240, padding: 8 })
    图表.data(图表数据)
    图表.coordinate('theta', { radius: 0.92 })
    图表.legend(false)
    图表.tooltip({ showTitle: false, showMarkers: false })
    图表.interval()
      .adjust('stack')
      .position('数值')
      .color(
        '名称',
        图表数据.map((项) => 项.颜色),
      )
      .style({ lineWidth: 1, stroke: '#fff' })
      .tooltip('名称*占比', (名称, 占比) => ({ name: 名称, value: 占比 }))
    图表.interaction('element-active')
    图表.render()
    return () => 图表.destroy()
  }, [图表数据])
  return (
    <div className={styles.图表内容}>
      <div ref={容器} className={styles.图表} role='img' aria-label={标题} />
      <div className={styles.图例} role='list' aria-label={`${标题}图例`}>
        {图表数据.map((项) => (
          <div className={styles.图例项} role='listitem' key={项.名称}>
            <span className={styles.色块} style={{ background: 项.颜色 }} />
            <span className={styles.图例名称} title={项.名称}>
              {项.名称}
            </span>
            <span>{项.占比}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default 占比图
