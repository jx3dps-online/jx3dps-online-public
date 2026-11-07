import React, { useMemo } from 'react'
import { Alert, Empty, Tag } from 'antd'
import type { 装备容量结果 } from './容量计算'
import type { 装备收益来源 } from './属性来源'
import 占比图 from './占比图'
import 来源名称 from './来源名称'
import styles from './index.module.less'

const 格式化数值 = (值: number) => 值.toLocaleString('zh-CN', { maximumFractionDigits: 2 })

function 容量面板({
  结果,
  错误,
  包含特效,
  on对比,
}: {
  结果?: 装备容量结果
  错误: string
  包含特效: boolean
  on对比?: (来源: 装备收益来源) => void
}) {
  const 图表数据 = useMemo(
    () =>
      结果?.条目.filter((项) => 项.容量 > 0).map((项) => ({ 名称: 项.名称, 数值: 项.容量 })) || [],
    [结果],
  )
  if (!结果)
    return <Alert type='warning' showIcon message='暂时无法拆分装备容量' description={错误} />
  return (
    <>
      <Alert type='info' showIcon message='仅比较各项的属性容量，容量百分比高不代表秒伤高' />
      <p className={styles.说明}>
        装备本体含精炼，套装、普通附魔、大附魔、所有镶嵌与五彩石独立统计。沿用装备速查的附魔基准折算容量，
        会效与会心使用相同基准；不计体质、角色自身基础属性及主属性转换。
        {包含特效 &&
          '特效属性归入对应来源，风特效归腰坠、水特效归武器；触发属性沿用现有平均覆盖率。'}
      </p>
      {图表数据.length ? (
        <>
          <占比图 数据={图表数据} 标题='各装备来源容量占比' />
          <div className={styles.表格容器}>
            <table className={styles.容量表}>
              <thead>
                <tr>
                  <th>来源</th>
                  <th>基础容量</th>
                  <th>特效容量</th>
                  <th>合计</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {结果.条目.map((项) => (
                  <tr key={项.标识}>
                    <td>
                      <来源名称 来源={项} on对比={on对比} />
                    </td>
                    <td>{格式化数值(项.基础容量)}</td>
                    <td>
                      {项.特效容量
                        ? `${项.特效容量 > 0 ? '+' : ''}${格式化数值(项.特效容量)}`
                        : '—'}
                    </td>
                    <td>{格式化数值(项.容量)}</td>
                    <td>{项.比例.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty description='当前没有可折算的属性容量' />
      )}
      {结果.未折算.length > 0 && (
        <div className={styles.未折算}>
          <h2 className={styles.小标题}>未折算项目</h2>
          <p className={styles.说明}>
            以下项目没有统一的属性容量换算，不计入总容量，不代表没有收益。
          </p>
          {结果.未折算.map((项) => (
            <Tag key={项}>{项}</Tag>
          ))}
        </div>
      )}
    </>
  )
}

export default 容量面板
