// DPS结果显示
import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalProps } from 'antd'
import * as G2 from '@antv/g2'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环日志数据类型 } from '../../../../simulator/type'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import '../../../../index.css'

const { 系统配置 } = 获取当前数据()

interface DpsResModalProps extends ModalProps {
  日志信息: 循环日志数据类型[]
}

const DpsResModal: React.FC<DpsResModalProps> = (props) => {
  const { open, onCancel, 日志信息 } = props
  const [chartData, setChartData] = useState<any>()
  const limitRef: any = useRef<any>()

  useEffect(() => {
    setTimeout(() => {
      initChart()
    }, 20)
    if (open) {
      limitRef.current = false
    } else {
      limitRef.current = false
    }
  }, [open])

  const initChart = () => {
    if (limitRef.current) {
      return
    }
    limitRef.current = true

    const chart = chartData
      ? chartData
      : new G2.Chart({
          container: 'dps-res-chart',
          autoFit: true,
          renderer: 'canvas',
          padding: [24, 120, 100, 120],
        })
    chart.axis('dps', {
      label: {
        style: {
          fontSize: 12, // 文本大小
        },
      },
    })
    chart.tooltip({
      crosshairs: false,
    })
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
    chart.legend(false)
    if (系统配置?.主题色) {
      chart.line().position('time*dps').color(系统配置?.主题色)
    } else {
      chart.line()
    }

    if (!chartData) {
      setChartData(chart)
    }
    chart.data(dataSource)
    chart.render()
    setTimeout(() => {
      limitRef.current = false
    }, 10)
  }

  const getDataSource = () => {
    if (日志信息?.length) {
      const firstTime: any = 日志信息?.find((item) => item?.日志类型 === '造成伤害')?.日志时间

      // 先过滤重复的数据
      const dpsResObj = {}
      日志信息.forEach((item) => {
        if (item?.日志类型 === '造成伤害') {
          dpsResObj[(item.日志时间 || 0) - firstTime] = item.造成总伤害
        }
      })

      const lastTime: any = Object.keys(dpsResObj)?.[Object.keys(dpsResObj).length - 1]

      const dpsResLit: any[] = []

      // 每1秒结算一次
      for (let i = 0; i < lastTime; i = i + 每秒郭氏帧) {
        let 当前计算结果DPS = 0
        if (dpsResObj[i]) {
          if (i) {
            当前计算结果DPS = Math.round(dpsResObj[i] / (Number(i) / 每秒郭氏帧))
          } else {
            当前计算结果DPS = Math.round(dpsResObj[i])
          }
        } else {
          // 当前时间没有数据，向前找到离本次时间节点最近的数据
          for (let j = 1; j < i; j++) {
            if (dpsResObj[i - j]) {
              const currentTime = i - j
              if (i - j >= 0) {
                if (currentTime) {
                  当前计算结果DPS = Math.round(
                    dpsResObj[currentTime] / (Number(currentTime) / 每秒郭氏帧)
                  )
                } else {
                  当前计算结果DPS = Math.round(dpsResObj[currentTime])
                }
                break
              }
            }
          }
        }
        dpsResLit.push({
          time: Number(i) / 每秒郭氏帧,
          dps: 当前计算结果DPS,
        })
      }
      return dpsResLit
    } else {
      return []
    }
  }

  return (
    <Modal
      className='cycle-simulator-dps-modal'
      open={open}
      onCancel={onCancel}
      title={'Dps'}
      width={'80%'}
      centered
      footer={false}
    >
      <div className={'dps-res-chart'} id='dps-res-chart' />
    </Modal>
  )
}

export default DpsResModal
