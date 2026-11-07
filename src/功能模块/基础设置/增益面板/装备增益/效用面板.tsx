import React, { useMemo } from 'react'
import { Alert, Empty } from 'antd'
import type { 装备容量条目 } from './容量计算'
import type { 装备收益结果 } from './收益计算'
import type { 装备收益来源 } from './属性来源'
import { 计算装备效用 } from './效用计算'
import 来源名称 from './来源名称'
import styles from './index.module.less'

const 格式化数值 = (值: number) => 值.toLocaleString('zh-CN', { maximumFractionDigits: 2 })

function 效用面板({
  收益,
  容量,
  on对比,
}: {
  收益: 装备收益结果[]
  容量: 装备容量条目[]
  on对比?: (来源: 装备收益来源) => void
}) {
  const { 可比较条目, 不可比较条目 } = useMemo(() => 计算装备效用(收益, 容量), [收益, 容量])
  const 下界 = Math.min(0, ...可比较条目.map((项) => 项.效用系数!)) * 1.08
  const 上界 = Math.max(1.2, ...可比较条目.map((项) => 项.效用系数!)) * 1.08
  const 坐标 = (值: number) => ((值 - 下界) / (上界 - 下界)) * 100
  return (
    <>
      <Alert
        type='info'
        showIcon
        message={
          <>
            <p>效用＝非加速/特效秒伤损失占比 ÷ 非加速容量占比</p>
            <p>
              我也不知道这个有啥用，做着玩。看起来一定程度上它代表着该部位当前收益高的属性的占比情况
            </p>
          </>
        }
      />
      <p className={styles.说明}>
        非加速/特效秒伤损失：保留当前加速与循环，基准和各项计算均排除无法折算容量的装备特效，
        只比较剩余属性带来的秒伤。勾选特效时，仍计入可折算的属性特效。
      </p>
      {可比较条目.length ? (
        <>
          <div className={styles.效用图} role='list' aria-label='效用系数排序'>
            <div className={styles.效用图行} aria-hidden='true'>
              <span />
              <div className={styles.效用刻度}>
                <span style={{ left: `${坐标(1)}%` }}>平均 1.00</span>
              </div>
              <span>效用系数</span>
            </div>
            {可比较条目.map((项) => (
              <div className={styles.效用图行} role='listitem' key={项.标识}>
                <span
                  className={styles.图例名称}
                  title={项.分类 === '装备' ? `${项.名称} · ${项.说明}` : 项.名称}
                >
                  {项.分类 === '装备' ? 项.说明 : 项.名称}
                </span>
                <div className={styles.效用轨道} aria-hidden='true'>
                  <span
                    className={styles.效用条}
                    style={{
                      left: `${Math.min(坐标(0), 坐标(项.效用系数!))}%`,
                      width: `${Math.abs(坐标(项.效用系数!) - 坐标(0))}%`,
                      background: 项.效用系数! < 0 ? '#cf1322' : '#749ce0',
                    }}
                  />
                  <span className={styles.效用零线} style={{ left: `${坐标(0)}%` }} />
                  <span className={styles.效用平均线} style={{ left: `${坐标(1)}%` }} />
                </div>
                <strong>{项.效用系数!.toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <div className={styles.表格容器}>
            <table className={styles.容量表}>
              <thead>
                <tr>
                  <th>来源</th>
                  <th>非加速/特效秒伤损失</th>
                  <th>非加速容量</th>
                  <th>效用系数</th>
                </tr>
              </thead>
              <tbody>
                {可比较条目.map((项) => (
                  <tr key={项.标识}>
                    <td>
                      <来源名称 来源={项} on对比={on对比} />
                    </td>
                    <td title={`本页非加速/特效秒伤损失占比 ${(项.秒伤占比 * 100).toFixed(2)}%`}>
                      {格式化数值(项.秒伤差值)}
                    </td>
                    <td title={`本页容量占比 ${(项.容量占比 * 100).toFixed(2)}%`}>
                      {格式化数值(项.非加速容量)}
                    </td>
                    <td>
                      <strong>{项.效用系数!.toFixed(2)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty description='当前没有能完整比较效用的项目' />
      )}
      {不可比较条目.length > 0 && (
        <div className={styles.未折算}>
          <h2 className={styles.小标题}>未参与效用比较（{不可比较条目.length} 项）</h2>
          {不可比较条目.map((项) => (
            <div className={styles.未比较条目} key={项.标识}>
              <来源名称 来源={项} on对比={on对比} />
              <p className={styles.说明}>
                非加速/特效秒伤损失 {格式化数值(项.秒伤差值)} DPS，已折算非加速容量{' '}
                {格式化数值(项.非加速容量)}。 原因：{项.不可比较原因.join('；')}。
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default 效用面板
