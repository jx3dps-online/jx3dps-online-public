import type { 计算结果技能列表类型, 技能统计数据类型 } from '@/@types/输出'
import React, { useState } from 'react'
import styles from './index.module.less'
import { 千分位转换 } from '@/工具函数/help'

interface 技能结果详情容器类型 {
  children?: React.ReactNode
  技能数据?: 技能统计数据类型
}

const 技能结果详情容器: React.FC<技能结果详情容器类型> = (props) => {
  const { children, 技能数据 } = props
  const [展开状态, 设置展开状态] = useState(false)

  return (
    <div onClick={() => 设置展开状态(!展开状态)}>
      {children}
      {展开状态 ? (
        <div className={styles.wrap}>
          {技能数据?.伤害分段 ? (
            技能数据.伤害分段.map((分段, 序号) => (
              <React.Fragment key={序号}>
                <div className={styles.content}>
                  {分段.技能名称}（等级 {分段.技能等级 || 1}）
                </div>
                <技能伤害详情 技能数据={分段} />
              </React.Fragment>
            ))
          ) : (
            <技能伤害详情 技能数据={技能数据} />
          )}
        </div>
      ) : null}
    </div>
  )
}

const 技能伤害详情 = ({ 技能数据 }: { 技能数据?: 计算结果技能列表类型 }) => {
  const 会心个数 = (技能数据?.技能数量 || 0) * (技能数据?.会心几率 || 0)
  return (
    <>
      {技能数据?.会心几率 ? (
        <div className={styles.content}>
          <span className={styles.title}>会心</span>
          <span className={styles.item}>
            <span className={styles.minTitle}>最小值：</span>
            <span className={styles.value}>
              {千分位转换(技能数据?.技能最终详情?.会心?.最小值 || 0)}
            </span>
          </span>

          <span className={styles.item}>
            <span className={styles.subTitle}>均值：</span>
            <span className={styles.value}>
              {技能数据?.技能最终详情?.会心?.总值
                ? 千分位转换((技能数据?.技能最终详情?.会心?.总值 / 会心个数)?.toFixed(0))
                : 0}
            </span>
          </span>

          <span className={styles.item}>
            <span className={styles.maxTitle}>最大值：</span>
            <span className={styles.value}>
              {千分位转换(技能数据?.技能最终详情?.会心?.最大值 || 0)}
            </span>
          </span>
        </div>
      ) : null}
      {!技能数据?.会心几率 || 技能数据?.会心几率 < 1 ? (
        <div className={styles.content}>
          <span className={styles.title}>命中</span>
          <span className={styles.item}>
            <span className={styles.minTitle}>最小值：</span>
            <span className={styles.value}>
              {千分位转换(技能数据?.技能最终详情?.命中?.最小值 || 0)}
            </span>
          </span>

          <span className={styles.item}>
            <span className={styles.subTitle}>均值：</span>
            <span className={styles.value}>
              {技能数据?.技能最终详情?.命中?.总值
                ? 千分位转换(
                    (
                      技能数据?.技能最终详情?.命中?.总值 /
                      ((技能数据?.技能数量 || 1) - 会心个数)
                    )?.toFixed(0),
                  )
                : 0}
            </span>
          </span>

          <span className={styles.item}>
            <span className={styles.maxTitle}>最大值：</span>
            <span className={styles.value}>
              {千分位转换(技能数据?.技能最终详情?.命中?.最大值 || 0)}
            </span>
          </span>
        </div>
      ) : null}
    </>
  )
}

export default React.memo(技能结果详情容器)
