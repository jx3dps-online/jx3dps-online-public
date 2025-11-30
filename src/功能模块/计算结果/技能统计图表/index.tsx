/**
 * 技能统计图表
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as G2 from '@antv/g2'
import { useAppSelector } from '@/hooks'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取技能统计数据 } from '../结果统计/util'
import './index.css'

const { 系统配置 } = 获取当前数据()

function 技能统计图表(_, ref) {
  const 增益面板显示状态 = useAppSelector((state) => state?.system?.增益面板显示状态)
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)

  const [chartData, setChartData] = useState<any>()

  const limitRef: any = useRef<any>()

  const getDataSource = () => {
    const res = 获取技能统计数据(当前计算结果, true) || []

    res.sort((a, b) => {
      return a.技能总输出 - b.技能总输出
    })

    return res.map((item) => {
      return {
        ...item,
        技能数量: Number.isInteger(item.技能数量) ? item.技能数量 : item.技能数量.toFixed(2),
        key: item.显示名称 || item?.技能名称 || item.统计名称,
        技能总输出: Math.floor(item.技能总输出) || 0,
        会心期望: `${item.会心几率 ? (item.会心几率 * 100).toFixed(2) : 0}%`,
        技能比例: `${((item.技能总输出 / 当前计算结果?.总伤) * 100).toFixed(2)}%`,
      }
    })
  }

  useImperativeHandle(ref, () => ({
    initChart: initChart,
  }))

  useEffect(() => {
    limitRef.current = false
    return () => {
      limitRef.current = false
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      chartData && chartData.forceFit()
    }, 200)
  }, [增益面板显示状态])

  const initChart = () => {
    if (limitRef.current) {
      return
    }
    limitRef.current = true

    const chart = chartData
      ? chartData
      : new G2.Chart({
          container: 'skill-chart',
          autoFit: true,
          renderer: 'canvas',
          padding: [20, 48, 0, 96],
        })

    if (!chartData) {
      setChartData(chart)
    }

    const dataSource = getDataSource()
    chart.clear()
    chart.axis('key', {
      title: null,
      tickLine: null,
      line: null,
      label: {
        style: {
          fill: '#ffffff', // 文本的颜色
          fontSize: 12, // 文本大小
        },
        offset: 12,
      },
    })
    chart.axis('技能总输出', false)
    chart.coordinate().transpose()
    chart
      .interval()
      .position('key*技能总输出')
      .color(系统配置?.收益柱形图颜色 || 系统配置?.主题色)
      .tooltip('技能总输出*会心期望*技能比例')
      .label('技能数量', {
        offset: 16,
        style: {
          fill: '#ffffff',
          fontSize: 16,
        },
      })

    chart.data(dataSource)
    chart.render()

    setTimeout(() => {
      limitRef.current = false
    }, 10)
  }

  return (
    <>
      <div className={'skill-chart'} id='skill-chart' />
    </>
  )
}

export default forwardRef(技能统计图表)
