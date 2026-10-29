import { Modal, ModalProps } from 'antd'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from '@antv/g2'
import { 技能伤害详情类型 } from '../../../../typs'
import { 每秒郭氏帧 } from '@/数据/常量'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import {
  战斗曲线联动值Context,
  更新战斗曲线展示数量Context,
} from '@/功能模块/基础设置/公用设置/循环模拟/context'
import { 增益泳道类型, 增益区间 } from './增益泳道'
import { 曲线数据点 } from './use战斗曲线'
import './index.css'

// 旧路径（按伤害事件）采样间隔，用于把技能伤害详情转换为曲线采样点
const 统计间隔 = 24

// 曲线绘图区左右留白（px），泳道/遮罩用同样留白保证时间轴对齐
const 左留白 = 96
const 右留白 = 90
// 曲线绘图区上下留白（px），与 G2 padding 保持一致
const 上留白 = 20
const 下留白 = 36

// 将颜色转成带透明度的 rgba，用于面积渐变色（支持 #RGB / #RRGGBB / rgb()）
const 颜色转rgba = (颜色: string, 透明度: number): string => {
  if (!颜色) return `rgba(65, 89, 180, ${透明度})`
  if (颜色.startsWith('#')) {
    const hex = 颜色.slice(1)
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(65, 89, 180, ${透明度})`
    return `rgba(${r}, ${g}, ${b}, ${透明度})`
  }
  const 匹配 = 颜色.match(/rgba?\(([^)]+)\)/)
  const 分量 = 匹配?.[1]?.split(',').map((s) => parseFloat(s.trim()))
  if (分量 && 分量.length >= 3) {
    return `rgba(${分量[0]}, ${分量[1]}, ${分量[2]}, ${透明度})`
  }
  return `rgba(65, 89, 180, ${透明度})`
}

// 大数值格式化：万 / 亿
const 格式化数值 = (数值?: number): string => {
  if (数值 == null || !Number.isFinite(数值)) return '0'
  if (Math.abs(数值) >= 100000000) return `${(数值 / 100000000).toFixed(2)} 亿`
  if (Math.abs(数值) >= 10000) return `${(数值 / 10000).toFixed(2)} 万`
  return Math.round(数值).toLocaleString('zh-CN')
}

// 时间轴上限：nice 向上取整，返回 { 上限, 步长 }
// 只以曲线数据（战斗时长）为准，泳道区间超出部分会被裁剪，避免泳道变化反复触发图表重建
const 计算时间上限 = (数据源: 曲线数据点[]): { 上限: number; 步长: number } => {
  const 最大 = 数据源?.[数据源.length - 1]?.时间 || 0
  if (最大 <= 0) {
    return { 上限: 60, 步长: 10 }
  }
  const 步长 = 最大 <= 60 ? 10 : 最大 <= 180 ? 15 : 最大 <= 360 ? 30 : 60
  return { 上限: Math.ceil(最大 / 步长) * 步长, 步长 }
}

interface 战斗曲线Props {
  曲线数据: 曲线数据点[]
  增益泳道列表?: 增益泳道类型[]
  // 整个曲线区域（曲线 + 泳道 + 图例）的总高度
  高度?: number
}

// 旧路径：按伤害事件累计总伤，转为曲线采样点（仅供兼容其它心法的弹窗入口）
const 获取秒伤统计 = (原始数据: 技能伤害详情类型[], 统计间隔帧: number): 曲线数据点[] => {
  if (!原始数据?.length) return []

  const 结果: 曲线数据点[] = [{ 总伤: 0, 时间: 0, 秒伤: 0 }]
  let 累计总伤 = 0
  let 下个采样点 = 统计间隔帧

  for (const 数据 of 原始数据) {
    while ((数据?.时间 || 0) >= 下个采样点) {
      const 时间秒 = 下个采样点 / 每秒郭氏帧
      结果.push({ 总伤: 累计总伤, 时间: 时间秒, 秒伤: 累计总伤 / 时间秒 })
      下个采样点 += 统计间隔帧
    }
    累计总伤 += 数据?.伤害 || 0
  }

  const 最后时间帧 = 原始数据[原始数据.length - 1]?.时间 || 0
  const 末点秒 = 最后时间帧 / 每秒郭氏帧
  const 尾点 = 结果[结果.length - 1]
  if (末点秒 > (尾点?.时间 || 0)) {
    结果.push({ 总伤: 累计总伤, 时间: 末点秒, 秒伤: 累计总伤 / 末点秒 })
  }

  return 结果
}

/**
 * 战斗曲线核心组件（无外壳，渲染曲线 + 增益泳道 + 图例）
 * 支持：鼠标悬停联动（曲线/泳道共用一条竖向光标）、点击图例将增益「投影」到曲线上
 */
export function 战斗曲线(props: 战斗曲线Props) {
  const { 曲线数据, 增益泳道列表 = [], 高度 = 320 } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [隐藏泳道, 设置隐藏泳道] = useState<Set<string>>(new Set())
  const [投影泳道, 设置投影泳道] = useState<Set<string>>(new Set())
  const [悬停, 设置悬停] = useState<{ 时间: number; 比例: number; x: number; y: number } | null>(
    null,
  )

  const 联动悬停时间 = useContext(战斗曲线联动值Context)
  const 更新展示数量 = useContext(更新战斗曲线展示数量Context)

  // 挂载/卸载时登记展示数量，供技能 hover 联动判断「曲线是否正在展示」
  useEffect(() => {
    更新展示数量(1)
    return () => 更新展示数量(-1)
  }, [更新展示数量])

  const { 系统配置 } = 获取当前数据()
  const 曲线颜色 = 系统配置?.收益柱形图颜色 || 系统配置?.主题色 || '#4159b4'

  const 数据源 = 曲线数据 || []
  const { 上限: 时间上限, 步长 } = useMemo(() => 计算时间上限(数据源), [数据源])
  const 可见泳道 = useMemo(
    () => (增益泳道列表 || []).filter((泳道) => !隐藏泳道.has(泳道.名称)),
    [增益泳道列表, 隐藏泳道],
  )
  // 投影到曲线上的泳道（以半透明竖带叠加在曲线上）
  const 投影泳道列表 = useMemo(
    () => (增益泳道列表 || []).filter((泳道) => 投影泳道.has(泳道.名称)),
    [增益泳道列表, 投影泳道],
  )

  // 创建图表实例（挂载时；仅曲线颜色变化时重建，避免每次数据更新销毁重建）
  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      renderer: 'canvas',
      padding: [上留白, 右留白, 下留白, 左留白],
    })

    chart.scale('秒伤', {
      nice: true,
      formatter: (val: number) => 格式化数值(val),
    })

    chart.axis('时间', {
      title: {
        text: '时间（秒）',
        style: { fill: '#999', fontSize: 12, fontWeight: 'normal' },
      },
      label: { style: { fill: '#999', fontSize: 12 } },
      line: { style: { stroke: '#e0e0e0' } },
      tickLine: { style: { stroke: '#e0e0e0' } },
      grid: null,
    })
    chart.axis('秒伤', {
      label: { style: { fill: '#999', fontSize: 12 } },
      line: null,
      tickLine: null,
      grid: {
        line: { style: { stroke: '#f0f0f0', lineDash: [4, 4] } },
      },
    })

    chart.tooltip(false)
    chart.legend(false)

    chart
      .area()
      .position('时间*秒伤')
      .color(`l(90) 0:${颜色转rgba(曲线颜色, 0.32)} 1:${颜色转rgba(曲线颜色, 0)}`)
      .style({ lineWidth: 0 })
      .tooltip(false)

    chart.line().position('时间*秒伤').color(曲线颜色).size(2).tooltip(false)

    chartRef.current = chart

    return () => {
      chart.destroy()
      chartRef.current = null
    }
  }, [曲线颜色])

  // 数据/时间轴变化：复用图表实例更新数据与参考线，避免 destroy 后重建
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) {
      return
    }
    if (!数据源?.length) {
      chart.changeData([])
      chart.render()
      return
    }

    const 最终秒伤 = 数据源[数据源.length - 1]?.秒伤

    chart.changeData(数据源)
    chart.scale('时间', {
      type: 'linear',
      min: 0,
      max: 时间上限,
      nice: false,
      tickCount: 时间上限 / 步长,
    })
    chart.annotation().clear(true)
    chart.annotation().line({
      start: ['min', 最终秒伤],
      end: ['max', 最终秒伤],
      style: {
        stroke: '#ff4d4f',
        lineWidth: 1,
        lineDash: [4, 4],
      },
      text: {
        position: 'end',
        content: `最终秒伤 ${格式化数值(最终秒伤)}`,
        style: {
          fill: '#ff4d4f',
          fontSize: 12,
          fontWeight: 'normal',
        },
        offsetX: -4,
        offsetY: -6,
      },
    })
    chart.render()
    // 曲线颜色变化会触发上面的创建 effect 重建图表，这里一并依赖以保证重建后回填数据
  }, [数据源, 时间上限, 步长, 曲线颜色])

  // 悬停联动：把鼠标 x 换算成时间，并记录鼠标在绘图区内的位置（用于 tooltip 跟随）
  const 处理鼠标移动 = (e: React.MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect()
    const plotRect = plotRef.current?.getBoundingClientRect()
    if (!rect || !plotRect || rect.width <= 0) {
      return
    }
    const 比例 = (e.clientX - rect.left) / rect.width
    if (比例 < 0 || 比例 > 1) {
      设置悬停(null)
      return
    }
    设置悬停({
      时间: 比例 * 时间上限,
      比例,
      x: e.clientX - plotRect.left,
      y: e.clientY - plotRect.top,
    })
  }

  const 处理鼠标离开 = () => 设置悬停(null)

  // 技能序列 hover 联动的竖线：外部联动（技能 hover）优先于图表内鼠标 hover
  const 联动比例 =
    联动悬停时间 != null && 时间上限 > 0 ? Math.min(Math.max(联动悬停时间 / 时间上限, 0), 1) : null
  const 展示悬停 =
    联动比例 != null
      ? {
          时间: 联动悬停时间 as number,
          比例: 联动比例,
          x: 左留白 + 联动比例 * ((plotRef.current?.clientWidth || 0) - 左留白 - 右留白),
          y: 20,
        }
      : 悬停

  const 悬停时间 = 展示悬停?.时间 ?? null

  const 悬停信息 = useMemo(() => {
    if (悬停时间 == null) {
      return null
    }
    let 最近点: 曲线数据点 | null = null
    let 最小差 = Infinity
    for (const 点 of 数据源) {
      const 差 = Math.abs(点.时间 - 悬停时间)
      if (差 < 最小差) {
        最小差 = 差
        最近点 = 点
      }
    }
    const 激活增益 = 可见泳道
      .map((泳道) => {
        const 区间 = 泳道.区间列表?.find((item) => 悬停时间 >= item.开始 && 悬停时间 <= item.结束)
        if (!区间) {
          return null
        }
        return 区间.层数 && 区间.层数 > 1 ? `${泳道.名称}(${区间.层数})` : 泳道.名称
      })
      .filter(Boolean)
    return { 时间: 悬停时间, 秒伤: 最近点?.秒伤, 总伤: 最近点?.总伤, 激活增益 }
  }, [悬停时间, 数据源, 可见泳道])

  // 将区间裁剪到时间轴范围内，返回 { 左, 宽 }（百分比）
  const 计算区间位置 = (开始: number, 结束: number): { 左: number; 宽: number } => {
    const 左比例 = Math.max(0, Math.min(开始 / 时间上限, 1))
    const 右比例 = Math.max(0, Math.min(结束 / 时间上限, 1))
    return { 左: 左比例 * 100, 宽: Math.max(0, (右比例 - 左比例) * 100) }
  }

  const 渲染区间 = (区间列表: 增益区间[], 颜色: string) => {
    return (区间列表 || []).map((区间, index) => {
      const { 左, 宽 } = 计算区间位置(区间.开始, 区间.结束)
      if (宽 <= 0) {
        return null
      }
      return (
        <div
          key={index}
          className='cycle-chart-lane-seg'
          style={{ left: `${左}%`, width: `${Math.max(宽, 0.4)}%`, background: 颜色 }}
        >
          {区间.层数 && 区间.层数 > 1 ? (
            <span className='cycle-chart-lane-seg-layer'>{区间.层数}</span>
          ) : null}
        </div>
      )
    })
  }

  // 投影遮罩：把选中泳道的覆盖区间以半透明竖带叠加在曲线上
  const 投影区间 = useMemo(() => {
    const 列表: { 颜色: string; 名称: string; 开始: number; 结束: number; 层数?: number }[] = []
    for (const 泳道 of 投影泳道列表) {
      for (const 区间 of 泳道.区间列表 || []) {
        列表.push({
          颜色: 泳道.颜色,
          名称: 泳道.名称,
          开始: 区间.开始,
          结束: 区间.结束,
          层数: 区间.层数,
        })
      }
    }
    return 列表
  }, [投影泳道列表])

  return (
    <div
      className='cycle-chart-wrap'
      style={{ height: 高度 }}
      onMouseMove={处理鼠标移动}
      onMouseLeave={处理鼠标离开}
    >
      {增益泳道列表?.length ? (
        <div className='cycle-chart-legend'>
          {增益泳道列表.map((泳道) => {
            const 隐藏 = 隐藏泳道.has(泳道.名称)
            const 投影 = 投影泳道.has(泳道.名称)
            return (
              <div
                key={泳道.名称}
                className={`cycle-chart-legend-item ${隐藏 ? 'cycle-chart-legend-hidden' : ''}`}
              >
                <span
                  className='cycle-chart-legend-body'
                  onClick={() => {
                    const 新集合 = new Set(隐藏泳道)
                    if (隐藏) {
                      新集合.delete(泳道.名称)
                    } else {
                      新集合.add(泳道.名称)
                    }
                    设置隐藏泳道(新集合)
                  }}
                >
                  <span className='cycle-chart-legend-dot' style={{ background: 泳道.颜色 }} />
                  {泳道.图标 ? (
                    <img className='cycle-chart-legend-icon' src={泳道.图标} alt='' />
                  ) : null}
                  <span className='cycle-chart-legend-name'>{泳道.名称}</span>
                </span>
                <span
                  className={`cycle-chart-legend-proj ${投影 ? 'cycle-chart-legend-proj-active' : ''}`}
                  style={投影 ? { background: 泳道.颜色, borderColor: 泳道.颜色 } : undefined}
                  title={投影 ? '取消投影到曲线' : '投影到曲线'}
                  onClick={() => {
                    const 新集合 = new Set(投影泳道)
                    if (投影) {
                      新集合.delete(泳道.名称)
                    } else {
                      新集合.add(泳道.名称)
                    }
                    设置投影泳道(新集合)
                  }}
                />
              </div>
            )
          })}
        </div>
      ) : null}

      <div ref={plotRef} className='cycle-chart-plot'>
        <div ref={containerRef} className='cycle-line-count-chart' />
        <div ref={overlayRef} className='cycle-chart-overlay'>
          {投影区间.map((遮罩, index) => {
            const { 左, 宽 } = 计算区间位置(遮罩.开始, 遮罩.结束)
            if (宽 <= 0) {
              return null
            }
            // 层数越高，遮罩越深，便于直观看出层数变化
            const 层数 = 遮罩.层数 || 1
            const 透明度 = Math.min(0.32, 0.1 + 层数 * 0.05)
            return (
              <div
                key={`${遮罩.名称}_${index}`}
                className='cycle-chart-shade'
                style={{
                  left: `${左}%`,
                  width: `${Math.max(宽, 0.4)}%`,
                  background: 颜色转rgba(遮罩.颜色, 透明度),
                }}
              >
                {层数 > 1 ? (
                  <span className='cycle-chart-shade-layer' style={{ color: 遮罩.颜色 }}>
                    {层数}
                  </span>
                ) : null}
              </div>
            )
          })}
          {展示悬停 != null ? (
            <div className='cycle-chart-cursor' style={{ left: `${展示悬停.比例 * 100}%` }} />
          ) : null}
        </div>
        {展示悬停 && 悬停信息 ? (
          <div
            className='cycle-chart-hover-tip'
            style={{
              left: Math.min(展示悬停.x + 12, (plotRef.current?.clientWidth || 200) - 150),
              top: Math.min(展示悬停.y + 12, (plotRef.current?.clientHeight || 100) - 90),
            }}
          >
            <div className='cycle-chart-hover-tip-time'>{悬停信息.时间.toFixed(1)} 秒</div>
            <div className='cycle-chart-hover-tip-row'>
              <span>秒伤</span>
              <b>{格式化数值(悬停信息.秒伤)}</b>
            </div>
            <div className='cycle-chart-hover-tip-row'>
              <span>总伤</span>
              <b>{格式化数值(悬停信息.总伤)}</b>
            </div>
            {悬停信息.激活增益?.length ? (
              <div className='cycle-chart-hover-tip-buffs'>{悬停信息.激活增益.join('、')}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      {可见泳道?.length ? (
        <div className='cycle-chart-lanes' style={{ marginRight: 右留白 }}>
          <div className='cycle-chart-lane-labels' style={{ width: 左留白 }}>
            {可见泳道.map((泳道) => (
              <div className='cycle-chart-lane-label' key={泳道.名称}>
                {泳道.图标 ? (
                  <img className='cycle-chart-lane-icon' src={泳道.图标} alt='' />
                ) : (
                  <span className='cycle-chart-lane-dot' style={{ background: 泳道.颜色 }} />
                )}
                <span className='cycle-chart-lane-name'>{泳道.名称}</span>
              </div>
            ))}
          </div>
          <div className='cycle-chart-lane-tracks'>
            {可见泳道.map((泳道) => (
              <div className='cycle-chart-lane-track' key={泳道.名称}>
                {渲染区间(泳道.区间列表, 泳道.颜色)}
              </div>
            ))}
            {展示悬停 != null ? (
              <div
                className='cycle-chart-lane-cursor'
                style={{ left: `${展示悬停.比例 * 100}%` }}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface 战斗曲线弹窗类型 extends ModalProps {
  open: boolean
  onCancel: () => void
  // 新：采样点曲线数据
  曲线数据?: 曲线数据点[]
  // 旧：按伤害事件的数据（兼容其它心法，内部转换为采样点）
  技能伤害详情数据?: 技能伤害详情类型[]
  增益泳道列表?: 增益泳道类型[]
}

function 战斗曲线弹窗(props: 战斗曲线弹窗类型) {
  const { open, onCancel, 曲线数据, 技能伤害详情数据, 增益泳道列表 } = props

  const 实际曲线数据 = useMemo(
    () => 曲线数据 || 获取秒伤统计(技能伤害详情数据 || [], 统计间隔),
    [曲线数据, 技能伤害详情数据],
  )

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className={'cycle-simulator-modal-header'}>
          <h1 className={'cycle-simulator-modal-title'}>战斗秒伤曲线</h1>
        </div>
      }
      width={'80%'}
      centered
      footer={false}
    >
      {open ? <战斗曲线 曲线数据={实际曲线数据} 增益泳道列表={增益泳道列表} 高度={480} /> : null}
    </Modal>
  )
}

export default 战斗曲线弹窗

export interface 战斗曲线面板类型 {
  open: boolean
  onClose: () => void
  曲线数据: 曲线数据点[]
  增益泳道列表?: 增益泳道类型[]
  onRefresh?: () => void
  高度?: number
  on高度变化?: (e: number) => void
}

/**
 * 底部滑出的嵌入面板，支持拖拽调整高度
 */
export function 战斗曲线面板(props: 战斗曲线面板类型) {
  const { open, onClose, 曲线数据, 增益泳道列表, onRefresh, 高度 = 400, on高度变化 } = props
  const [放大展示, 设置放大展示] = useState<boolean>(false)
  const 拖拽起始 = useRef<{ y: number; 高度: number } | null>(null)

  const 开始拖拽 = (e: React.PointerEvent) => {
    e.preventDefault()
    拖拽起始.current = { y: e.clientY, 高度: 高度 }
    const onMove = (ev: PointerEvent) => {
      const 起始 = 拖拽起始.current
      if (!起始) {
        return
      }
      const delta = 起始.y - ev.clientY
      on高度变化?.(Math.max(200, Math.min(720, 起始.高度 + delta)))
    }
    const onUp = () => {
      拖拽起始.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className={`cycle-chart-panel ${open ? 'cycle-chart-panel-open' : ''}`}>
      <div className='cycle-chart-panel-resize' onPointerDown={开始拖拽} title='拖动调整高度' />
      <div className='cycle-chart-panel-header'>
        <span className='cycle-chart-panel-title'>战斗秒伤曲线</span>
        <span className='cycle-chart-panel-actions'>
          {onRefresh ? (
            <span className='cycle-chart-panel-btn' onClick={onRefresh}>
              刷新
            </span>
          ) : null}
          <span className='cycle-chart-panel-btn' onClick={() => 设置放大展示(true)}>
            放大
          </span>
          <span className='cycle-chart-panel-btn' onClick={onClose}>
            收起
          </span>
        </span>
      </div>
      {open ? <战斗曲线 曲线数据={曲线数据} 增益泳道列表={增益泳道列表} 高度={高度} /> : null}
      <战斗曲线弹窗
        open={放大展示}
        onCancel={() => 设置放大展示(false)}
        曲线数据={曲线数据}
        增益泳道列表={增益泳道列表}
      />
    </div>
  )
}
