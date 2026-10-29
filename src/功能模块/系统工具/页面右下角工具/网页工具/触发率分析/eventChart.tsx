import { use心法数据 } from '@/心法模块/心法上下文'
import React, { useEffect, useRef, useState } from 'react'
import * as G2 from '@antv/g2'
import './index.css'

interface 图表展示类型 {
  当前查看人: string
  data: { [key: number]: number }
}

const 图表展示: React.FC<图表展示类型> = (props) => {
  const { 系统配置 } = use心法数据()
  const { data, 当前查看人 } = props
  const id = `${当前查看人}_event_chart`
  const [chartData, setChartData] = useState<any>()

  const limitRef: any = useRef<any>()

  useEffect(() => {
    limitRef.current = false
    initChart()
    return () => {
      limitRef.current = false
    }
  }, [系统配置])

  // 处理缺少的帧数数据
  const 处理图表数据 = (data) => {
    if (!data) {
      return []
    }
    const result: any[] = []
    const key数据 = Object.keys(data) || []
    const 初始帧数: any = +key数据?.[0] || 0
    const 最终帧数: any = +key数据?.[key数据.length - 1] || 0
    const 总执行时间 = 最终帧数 - 初始帧数
    for (let i = 0; i < 总执行时间; i++) {
      if (data[初始帧数 + i]) {
        result.push({
          帧: i,
          触发率: data[初始帧数 + i],
        })
      }
    }

    return result
  }

  const initChart = () => {
    if (limitRef.current) {
      return
    }
    limitRef.current = true

    const chart = chartData
      ? chartData
      : new G2.Chart({
          container: id,
          autoFit: true,
          renderer: 'canvas',
          padding: [20, 40, 20, 40],
        })

    if (!chartData) {
      setChartData(chart)
    }

    const dataSource = 处理图表数据(data)

    chart.clear()

    // chart.axis('触发率', false)
    chart.line().position('帧*触发率').size(3).color(系统配置?.主题色)

    chart.data(dataSource)
    chart.render()

    setTimeout(() => {
      limitRef.current = false
    }, 10)
  }

  return <div id={id} className='tools-event-chart-wrap' />
}

export default React.memo(图表展示)
