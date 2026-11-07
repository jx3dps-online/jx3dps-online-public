import React, { useMemo } from 'react'
import { Alert, Empty, Progress } from 'antd'
import type { 装备收益结果 } from './收益计算'
import type { 装备收益来源 } from './属性来源'
import 占比图 from './占比图'
import 来源名称 from './来源名称'
import styles from './index.module.less'

function 收益面板({
  结果,
  on对比,
}: {
  结果: 装备收益结果[]
  on对比?: (来源: 装备收益来源) => void
}) {
  const 图表数据 = useMemo(
    () => 结果.filter((项) => 项.秒伤差值 > 0).map((项) => ({ 名称: 项.名称, 数值: 项.秒伤差值 })),
    [结果],
  )
  const 最大收益 = Math.max(1, ...结果.map((项) => Math.abs(项.秒伤差值)))
  if (!结果.length) return <Empty description='当前没有可统计的装备来源' />
  return (
    <>
      <Alert
        type='info'
        showIcon
        message={
          <>
            <p>固定当前循环与加速，仅比较移除单项属性后损失的秒伤。</p>
            <p>注意：为避免加速对循环产生影响，这里装备上的加速均未参与计算！！</p>
          </>
        }
      />
      {图表数据.length > 0 && (
        <>
          <h2 className={styles.小标题}>各项收益的相对占比</h2>
          <占比图 数据={图表数据} 标题='装备收益相对占比' />
        </>
      )}
      <p className={styles.说明}>
        扇形图中百分比代表参与计算的统计占比，非秒伤；下方百分比为占当前你打出来的总秒伤的比例。两个比例不同。
      </p>
      {结果.map((项) => (
        <div className={styles.收益条目} key={项.标识}>
          <div className={styles.条目内容}>
            <来源名称 来源={项} 显示加速提示 on对比={on对比} />
            <Progress
              percent={(Math.abs(项.秒伤差值) / 最大收益) * 100}
              showInfo={false}
              size='small'
              strokeColor={项.秒伤差值 < 0 ? '#cf1322' : '#749ce0'}
            />
          </div>
          <div className={styles.收益数值}>
            <strong>{项.秒伤比例.toFixed(2)}%</strong>
            <span>{项.秒伤差值.toLocaleString()} 属性秒伤</span>
          </div>
        </div>
      ))}
    </>
  )
}

export default 收益面板
