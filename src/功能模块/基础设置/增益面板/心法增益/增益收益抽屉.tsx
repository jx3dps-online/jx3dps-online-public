import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Checkbox, Drawer, Empty, Progress, Spin, Tag, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取秒伤计算基础 } from '@/计算模块/计算函数'
import {
  增益分类,
  获取收益计算入参,
  获取增益收益条目,
  计算单个增益收益,
  计算收益秒伤,
  type 增益收益条目,
} from './收益计算'
import styles from './index.module.less'
import 收益扇形图 from './收益扇形图'
import 增益效果 from './增益效果'

const 分类颜色 = { 奇穴: 'purple', 技能: 'blue', 职业: 'cyan', 秘籍: 'geekblue', 装备: 'gold' }

function 增益收益抽屉({ onClose }: { onClose: () => void }) {
  const { 名称 } = use心法数据()
  const 数据 = useAppSelector((state) => state.data)
  const dispatch = useAppDispatch()
  const [分类, 设置分类] = useState<string[]>(增益分类)
  const [结果, 设置结果] = useState<增益收益条目[]>([])
  const [进度, 设置进度] = useState({ 已计算: 0, 总数: 0, 计算中: true, 基准秒伤: 0 })
  const [错误, 设置错误] = useState('')
  const [无法计算, 设置无法计算] = useState(false)

  useEffect(() => {
    let 已取消 = false
    let 定时器: ReturnType<typeof setTimeout>
    设置结果([])
    设置错误('')
    设置无法计算(false)
    设置进度({ 已计算: 0, 总数: 0, 计算中: true, 基准秒伤: 0 })
    const 执行 = () => {
      try {
        const 基础 = dispatch((内部派发, 获取状态) => 获取秒伤计算基础(内部派发, 获取状态))
        const 入参 = 获取收益计算入参(基础)
        if (!入参.计算循环.length || !入参.战斗时间 || !入参.装备信息.装备基础属性?.基础攻击) {
          设置无法计算(true)
          return
        }
        const 基准秒伤 = 计算收益秒伤(入参)
        const 条目 = 获取增益收益条目(入参).filter(
          (项) =>
            项.已启用 && 项.效果列表.some((效果) => 效果.属性列表.some((属性) => 属性.值 !== 0)),
        )
        const 新结果: 增益收益条目[] = []
        const 计算下一项 = () => {
          if (已取消) return
          try {
            if (新结果.length < 条目.length) {
              新结果.push(计算单个增益收益(入参, 条目[新结果.length], 基准秒伤))
            }
            const 计算中 = 新结果.length < 条目.length
            设置进度({ 已计算: 新结果.length, 总数: 条目.length, 计算中, 基准秒伤 })
            if (计算中) 定时器 = setTimeout(计算下一项, 0)
            else 设置结果(新结果)
          } catch (异常) {
            设置错误(异常 instanceof Error ? 异常.message : '增益收益计算失败')
          }
        }
        计算下一项()
      } catch (异常) {
        设置错误(异常 instanceof Error ? 异常.message : '增益收益计算失败')
      }
    }
    定时器 = setTimeout(执行, 0)
    return () => {
      已取消 = true
      clearTimeout(定时器)
    }
  }, [dispatch, 数据, 名称])

  const 有效结果 = useMemo(
    () => 结果.filter((项) => 项.秒伤比例 !== null && Number(项.秒伤比例.toFixed(2)) !== 0),
    [结果],
  )
  const 显示结果 = useMemo(
    () =>
      有效结果
        .filter((条目) => 分类.includes(条目.增益.增益所在位置))
        .sort((a, b) => b.秒伤差值 - a.秒伤差值),
    [有效结果, 分类],
  )
  const 最大收益 = Math.max(1, ...显示结果.map((条目) => Math.abs(条目.秒伤差值)))

  return (
    <Drawer
      open
      title={`心法增益收益`}
      placement='left'
      width={804}
      onClose={onClose}
      styles={{ mask: { background: 'transparent' } }}
    >
      <Alert
        type='info'
        message='对比当前循环中单个增益的收益，仅计算在循环不变的情况下删除某增益后损失秒伤的百分比'
      />
      <div className={styles.过滤}>
        <Checkbox.Group options={增益分类} value={分类} onChange={设置分类} />
      </div>
      {错误 ? (
        <Alert type='error' showIcon message='收益计算失败' description={错误} />
      ) : 无法计算 ? (
        <Empty description='当前循环或装备无法计算，请检查加速、延迟和装备。' />
      ) : 进度.计算中 ? (
        <div className={styles.加载}>
          <Spin />
          <p>
            正在计算增益收益（{进度.已计算}/{进度.总数}）
          </p>
          <Progress percent={进度.总数 ? Math.round((进度.已计算 / 进度.总数) * 100) : 0} />
        </div>
      ) : (
        <>
          <收益扇形图 条目={有效结果} 分类={分类} />
          <div className={styles.收益说明}>
            <span className='dps-low-color'>− 关闭后损失</span>
          </div>
          {显示结果.length ? (
            显示结果.map((条目) => <收益条目 key={条目.标识} 条目={条目} 最大收益={最大收益} />)
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='当前筛选下暂无增益' />
          )}
        </>
      )}
    </Drawer>
  )
}

function 收益条目({ 条目, 最大收益 }: { 条目: 增益收益条目; 最大收益: number }) {
  const { 增益, 秒伤差值, 秒伤比例 } = 条目
  const 变化 = -秒伤差值
  const 符号 = 变化 > 0 ? '+' : 变化 < 0 ? '−' : ''
  const 状态 = '关闭后的秒伤变化'
  return (
    <div className={styles.条目}>
      <div className={styles.信息}>
        <div className={styles.名称行}>
          <Tooltip title={`关联技能：${条目.关联技能.join('、')}`}>
            <span className={styles.名称}>
              {条目.秘籍技能 && `${条目.秘籍技能} · `}
              {增益.增益名称}
            </span>
          </Tooltip>
          {增益.增益所在位置 === '奇穴' && (
            <Tag color='purple'>奇穴：{增益.依赖奇穴 || 增益.增益名称}</Tag>
          )}
        </div>
        <div className={styles.标签}>
          <Tag className={styles.分类标签} color={分类颜色[增益.增益所在位置]}>
            {增益.增益所在位置}
          </Tag>
          <增益效果 条目={条目} />
        </div>
      </div>
      <Tooltip title={状态}>
        <div className={styles.收益} aria-label={`${状态}：${变化}`}>
          <strong className={变化 < 0 ? 'dps-low-color' : 变化 > 0 ? 'dps-up-color' : ''}>
            {符号}
            {Math.abs(变化).toLocaleString()}
            <small>
              （{秒伤比例 === null ? '—' : `${符号}${Math.abs(秒伤比例).toFixed(2)}%`}）
            </small>
          </strong>
        </div>
      </Tooltip>
      <div
        className={styles.收益条}
        style={{ width: `${(Math.abs(秒伤差值) / 最大收益) * 100}%` }}
      />
    </div>
  )
}

export default 增益收益抽屉
