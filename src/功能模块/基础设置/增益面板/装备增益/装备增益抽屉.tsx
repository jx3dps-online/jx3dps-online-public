import React, { lazy, Suspense, useMemo, useState } from 'react'
import { Alert, Checkbox, Drawer, Progress, Segmented, Spin } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import use装备分析 from './use装备分析'
import 收益面板 from './收益面板'
import 容量面板 from './容量面板'
import 效用面板 from './效用面板'
import { 计算装备效用 } from './效用计算'
import type { 装备收益来源 } from './属性来源'
import styles from './index.module.less'

const 同部位对比 = lazy(() => import('./同部位对比'))

function 装备增益抽屉({ onClose }: { onClose: () => void }) {
  const { 名称 } = use心法数据()
  const [页面, 设置页面] = useState<'属性秒伤' | '容量' | '效用'>('属性秒伤')
  const [包含特效, 设置包含特效] = useState(true)
  const { 容量, 效用容量, 错误, 状态 } = use装备分析(包含特效)
  const [对比部位, 设置对比部位] = useState<string | null>(null)
  const 对比参数 = useMemo(() => {
    const 来源 = 状态.效用结果.find((项) => 项.标识 === 对比部位)
    if (!来源 || !状态.效用入参 || !效用容量) return null
    const { 总秒伤损失, 总容量 } = 计算装备效用(状态.效用结果, 效用容量.条目)
    return {
      入参: 状态.效用入参,
      来源,
      包含特效,
      平均单位容量收益: 总容量 ? 总秒伤损失 / 总容量 : 0,
    }
  }, [状态.效用结果, 状态.效用入参, 效用容量, 对比部位, 包含特效])
  const 打开对比 = 状态.效用入参 ? (来源: 装备收益来源) => 设置对比部位(来源.标识) : undefined
  return (
    <Drawer
      open
      title={`装备增益`}
      placement='left'
      width={1000}
      onClose={onClose}
      styles={{ mask: { background: 'transparent' } }}
    >
      <div className={styles.工具栏}>
        <div>
          <Segmented value={页面} onChange={设置页面} options={['属性秒伤', '容量', '效用']} />
          <Checkbox
            style={{ marginLeft: 12 }}
            checked={包含特效}
            onChange={(事件) => 设置包含特效(事件.target.checked)}
          >
            计入单件装备特效
          </Checkbox>
        </div>
        {页面 === '容量'
          ? 容量 && (
              <span>
                可折算总容量{' '}
                <strong>{容量.总容量.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}</strong>
              </span>
            )
          : !状态.计算中 &&
            !状态.错误 && (
              <span>
                本次基准{' '}
                <strong>
                  {(页面 === '效用' ? 状态.效用基准秒伤 : 状态.基准秒伤).toLocaleString()}
                </strong>{' '}
                DPS
              </span>
            )}
      </div>
      {页面 === '容量' ? (
        <容量面板 结果={容量} 错误={错误} 包含特效={包含特效} on对比={打开对比} />
      ) : 状态.错误 ? (
        <Alert type='warning' showIcon message='暂时无法计算装备收益' description={状态.错误} />
      ) : 状态.计算中 ? (
        <div className={styles.加载}>
          <Spin />
          <p>
            正在计算装备收益（{状态.已计算}/{状态.总数}）
          </p>
          <Progress percent={状态.总数 ? Math.round((状态.已计算 / 状态.总数) * 100) : 0} />
        </div>
      ) : 页面 === '属性秒伤' ? (
        <收益面板 结果={状态.结果} on对比={打开对比} />
      ) : (
        <效用面板 收益={状态.效用结果} 容量={效用容量!.条目} on对比={打开对比} />
      )}
      {对比参数 && (
        <Suspense fallback={<Spin />}>
          <同部位对比
            key={`${名称}-${对比部位}`}
            心法={名称}
            参数={对比参数}
            onClose={() => 设置对比部位(null)}
          />
        </Suspense>
      )}
    </Drawer>
  )
}

export default 装备增益抽屉
