import React, { useEffect, useMemo, useRef } from 'react'
import { Chart } from '@antv/g2'
import { Empty } from 'antd'
import type { 增益收益条目 } from './收益计算'
import styles from './index.module.less'

function 收益扇形图({ 条目, 分类 }: { 条目: 增益收益条目[]; 分类: string[] }) {
  const 容器 = useRef<HTMLDivElement>(null)
  const 数据 = useMemo(() => {
    const 已启用 = 条目
      .filter((项) => 项.已启用 && 项.秒伤差值 > 0)
      .sort((a, b) => b.秒伤差值 - a.秒伤差值)
    const 总收益 = 已启用.reduce((总和, 项) => 总和 + 项.秒伤差值, 0)
    const 格式化占比 = (收益: number) => {
      const 百分比 = (收益 / 总收益) * 100
      return 百分比 < 0.1 ? '<0.1%' : `${百分比.toFixed(1)}%`
    }
    const 图表数据 = 已启用
      .map((项, 索引) => ({
        标识: 项.标识,
        名称: `${项.秘籍技能 ? `${项.秘籍技能} · ` : ''}${项.增益.增益名称}`,
        收益: 项.秒伤差值,
        占比: 格式化占比(项.秒伤差值),
        颜色: `hsl(${(索引 * 137.508 + 210) % 360}, 62%, 52%)`,
      }))
      .filter((_, 索引) => 分类.includes(已启用[索引].增益.增益所在位置))
    const 其他收益 = 已启用.reduce(
      (总和, 项) => (分类.includes(项.增益.增益所在位置) ? 总和 : 总和 + 项.秒伤差值),
      0,
    )
    if (其他收益 > 0) {
      图表数据.push({
        标识: '其他',
        名称: '其他',
        收益: 其他收益,
        占比: 格式化占比(其他收益),
        颜色: '#a6adb7',
      })
    }
    return 图表数据
  }, [条目, 分类])

  useEffect(() => {
    if (!容器.current || !数据.length) return
    const 图表 = new Chart({ container: 容器.current, autoFit: true, height: 240, padding: 8 })
    图表.data(数据)
    图表.coordinate('theta', { radius: 0.95 })
    图表.legend(false)
    图表.tooltip({ showTitle: false, showMarkers: false })
    图表.interval()
      .adjust('stack')
      .position('收益')
      .color(
        '标识',
        数据.map((项) => 项.颜色),
      )
      .style({ lineWidth: 1, stroke: '#fff' })
      .tooltip('名称*占比', (名称, 占比) => ({ name: 名称, value: 占比 }))
    图表.interaction('element-active')
    图表.render()
    return () => 图表.destroy()
  }, [数据])

  return (
    <section className={styles.图表区域}>
      <h2 className={styles.图表标题}>已启用增益收益占比</h2>
      <p className={styles.图表说明}>
        百分比代表占所有心法自身增益提升的百分比，不代表对dps的提升的百分比
      </p>
      {数据.length ? (
        <div className={styles.图表内容}>
          <div ref={容器} className={styles.扇形图} role='img' aria-label='已启用增益收益扇形图' />
          <div className={styles.图例}>
            {数据.map((项) => (
              <div className={styles.图例项} key={项.标识}>
                <span className={styles.色块} style={{ background: 项.颜色 }} />
                <span className={styles.图例名称} title={项.名称}>
                  {项.名称}
                </span>
                <span>{项.占比}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无已启用且有正收益的增益' />
      )}
    </section>
  )
}

export default 收益扇形图
