import { Modal, ModalProps, Space } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { Chart } from '@antv/g2'
import { 循环日志数据类型 } from '../../../../../simulator/type'
import './index.css'
import { 格式化buff覆盖数组, 获取Buff覆盖率 } from './util'

interface BuffCountModalProps extends ModalProps {
  open: boolean
  onCancel: () => void
  日志: 循环日志数据类型[]
  总战斗用时: number // 总战斗用时
}

function BuffCountModal(props: BuffCountModalProps) {
  const { open, onCancel, 日志, 总战斗用时 } = props
  const [chartData, setChartData] = useState<any>()
  const limitRef: any = useRef<any>()
  const [覆盖率, 设置覆盖率] = useState<any>({})

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        initChart()
      }, 20)
    }
    if (open) {
      limitRef.current = false
    } else {
      limitRef.current = false
      设置覆盖率({})
      setChartData(undefined)
    }
  }, [open, 日志, 总战斗用时])

  const initChart = () => {
    if (limitRef.current) {
      return
    }
    limitRef.current = true

    const chart = chartData
      ? chartData
      : new Chart({
          container: 'cycle-buff-count-chart',
          autoFit: true,
          renderer: 'canvas',
          padding: [24, 120, 100, 120],
        })

    chart.tooltip({
      crosshairs: false,
    })

    if (!chartData) {
      setChartData(chart)
    }

    const dataSource = getDataSource()

    chart.source(dataSource, {
      time: {
        tickCount: 10,
      },
    })
    chart.axis('time', {
      label: {
        style: {
          textAlign: 'center', // 文本对齐方向，可取值为： start middle end
          fontSize: 16, // 文本大小
        },
      },
    })

    const data = getDataSource()

    chart.data(data)
    chart.coordinate().transpose()
    chart.interval().position('type*range').color('type').label('range', { offset: 10 })
    // .color(DOMAIN_COLOR)
    chart.render()
    // setLoading(false)

    setTimeout(() => {
      limitRef.current = false
    }, 10)
  }

  const getDataSource = () => {
    const { Buff枚举, 覆盖率 } = 获取Buff覆盖率(日志, 总战斗用时)
    设置覆盖率(覆盖率)
    return 格式化buff覆盖数组(Buff枚举)
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className={'cycle-simulator-modal-header'}>
          <h1 className={'cycle-simulator-modal-title'}>Buff覆盖情况（时间单位：帧）</h1>
        </div>
      }
      width={'80%'}
      centered
      footer={false}
    >
      <Space className='cycle-buff-count-text' size={[16, 16]} wrap>
        {Object.keys(覆盖率).map((item) => {
          return (
            <div key={item} className={'cycle-buff-count-text-wrap'}>
              <span className='cycle-buff-count-text-label'>{item}：</span>
              <span className='cycle-buff-count-text-value'>{覆盖率[item]}%</span>
            </div>
          )
        })}
      </Space>
      {open ? <div id='cycle-buff-count-chart' className={'cycle-buff-count-chart'} /> : null}
    </Modal>
  )
}

export default BuffCountModal
