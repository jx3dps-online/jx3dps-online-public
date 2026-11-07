import React from 'react'
import { Button, Tag } from 'antd'
import type { 装备收益来源 } from './属性来源'
import styles from './index.module.less'

const 分类颜色 = { 装备: 'blue', 套装: 'purple', 附魔: 'gold', 镶嵌: 'cyan', 五彩石: 'green' }

function 来源名称({
  来源,
  名称后缀,
  显示分类 = true,
  显示部位 = true,
  显示加速提示 = false,
  on对比,
}: {
  来源: 装备收益来源
  名称后缀?: React.ReactNode
  显示分类?: boolean
  显示部位?: boolean
  显示加速提示?: boolean
  on对比?: (来源: 装备收益来源) => void
}) {
  const 是装备 = 来源.分类 === '装备'
  return (
    <div className={styles.条目名称}>
      {显示分类 && <Tag color={分类颜色[来源.分类]}>{来源.分类}</Tag>}
      <span className={styles.来源标题} title={是装备 ? 来源.说明 : 来源.名称}>
        {是装备 ? 来源.说明 : 来源.名称}
      </span>
      {(!是装备 || 显示部位) && (
        <span
          className={是装备 ? styles.部位名称 : styles.来源说明}
          title={是装备 ? 来源.名称 : 来源.说明}
        >
          {是装备 ? 来源.名称 : 来源.说明}
        </span>
      )}
      {来源.装备品级 !== undefined && <span className={styles.装备品级}>{来源.装备品级}品</span>}
      {!!来源.特征属性?.length && (
        <span className={styles.特征属性}>
          {来源.特征属性.map((属性, 索引) => (
            <React.Fragment key={`${属性}-${索引}`}>
              {索引 > 0 && ' '}
              <span className={styles[`${属性}标记`]}>{属性}</span>
            </React.Fragment>
          ))}
        </span>
      )}
      {名称后缀}
      {显示加速提示 && 来源.分类 === '装备' && (来源.属性.加速等级 || 0) > 0 && (
        <span className={styles.加速提示}>该部位 {来源.属性.加速等级} 加速未参与计算</span>
      )}
      {是装备 && on对比 && (
        <Button type='link' size='small' className={styles.对比按钮} onClick={() => on对比(来源)}>
          同部位对比
        </Button>
      )}
    </div>
  )
}

export default 来源名称
