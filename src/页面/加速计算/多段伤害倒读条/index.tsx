import React, { useState } from 'react'
import { Button, InputNumber, message, Table, Tooltip } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'
import { 获取阈值 } from '../utils'
import { 档位颜色枚举 } from './map'
import './index.css'

function 多段伤害倒读条() {
  const [channelFrame, setChannelFrame] = useState<number>()
  const [channelInterval, setChannelInterval] = useState<number>()
  const [dataSource, setDataSource] = useState<any[]>([])
  const [生效次数列表, 设置生效次数列表] = useState<any[]>([])

  const 计算帧数 = () => {
    if (!channelFrame) {
      message.error('请输入总作用间隔(ChannelFrame)')
      return
    }
    if (!channelInterval) {
      message.error('请输入单次作用间隔(ChannelInterval)')
      return
    }
    const 总帧数档位 = 获取档位(channelFrame)
    处理档位分布(总帧数档位)
  }

  const 获取档位 = (val) => {
    const 阈值: any = 获取阈值(val, Math.min(val - 1, 60))
    return 阈值
  }

  const 获取加速档位样式 = (档位) => {
    return 档位颜色枚举[档位] || '#000'
  }

  const 处理档位分布 = (data) => {
    let 最大作用次数 = 0
    let res = Object.keys(data).map((key: any) => {
      const 当前总帧数 = (channelFrame || 0) - (key || 0)
      const 实际作用次数 = Math.floor((channelFrame || 0) / (channelInterval || 1))
      const 作用间隔基础帧数 = Math.floor(当前总帧数 / 实际作用次数)
      const 作用间隔余数 = 当前总帧数 - 作用间隔基础帧数 * 实际作用次数
      const 作用次数数组 = 按数字生成数组(实际作用次数).map((_, index) => {
        if (index < 作用间隔余数) {
          return 作用间隔基础帧数 + 1
        } else {
          return 作用间隔基础帧数
        }
      })
      if (实际作用次数 > 最大作用次数) {
        最大作用次数 = 实际作用次数
      }
      const obj = {}
      作用次数数组.forEach((key, index) => {
        obj[`生效次数_${index + 1}`] = key
      })
      return {
        加速档位: key,
        ...obj,
        加速等级: data[key],
      }
    })
    res = res.map((item) => {
      return {
        ...item,
        最大作用次数,
      }
    })
    setDataSource(res)

    if (最大作用次数) {
      const list: any[] = []
      for (let i = 0; i < 最大作用次数; i++) {
        list.push({
          title: `次数 ${i + 1}`,
          key: `生效次数_${i + 1}`,
          width: 100,
          dataIndex: `生效次数_${i + 1}`,
          render: (e) => {
            const 加速档位 = (Math.floor(channelInterval || 0) || 0) - e

            const 加速档位颜色 = 获取加速档位样式(加速档位) || '#000'
            return (
              <span className={'haste-level-font'} style={{ color: 加速档位颜色 }}>
                {e || '-'}
              </span>
            )
          },
        })
      }

      设置生效次数列表(list)
    }
  }

  return (
    <div className='haste-layout-haste'>
      <div className='haste-layout-content'>
        <InputNumber
          className='haste-layout-input'
          value={channelFrame}
          onChange={(e: any) => setChannelFrame(e)}
          placeholder='请输入总作用间隔(ChannelFrame)'
          step={1}
          max={320}
          min={2}
          addonAfter='帧'
        />
        <InputNumber
          className='haste-layout-input'
          value={channelInterval}
          onChange={(e: any) => setChannelInterval(e)}
          placeholder='请输入单次作用间隔(ChannelInterval)'
          step={1}
          min={1}
          max={64}
          addonAfter='帧'
        />
        <Button type='primary' className='haste-layout-btn' onClick={计算帧数}>
          计算
        </Button>
      </div>
      <Table
        dataSource={dataSource}
        pagination={false}
        className='haste-layout-table'
        scroll={{ y: 'calc(100vh - 265px)' }}
        columns={[
          {
            title: '加速档位',
            key: '加速档位',
            fixed: 'left',
            width: 100,
            dataIndex: '加速档位',
          },
          ...生效次数列表,
          {
            title: '总时间',
            key: '总时间',
            fixed: 'right',
            width: 100,
            dataIndex: '总时间',
            render: (e, row) => {
              return (((channelFrame || 0) - (row.加速档位 || 0)) / 16).toFixed(2)
            },
          },
          {
            title: '所需加速等级',
            key: '所需加速等级',
            fixed: 'right',
            width: 200,
            dataIndex: '加速等级',
            render: (e, row) => {
              const 作用次数1 = row[`生效次数_1`] || 0
              const 最后次数 = row[`生效次数_${row.最大作用次数}`]
              if (作用次数1 === 最后次数 && 作用次数1 !== channelInterval) {
                const 加速档位 = (Math.floor(channelInterval || 0) || 0) - 作用次数1
                const 加速档位颜色 = 获取加速档位样式(加速档位) || '#000'
                return (
                  <Tooltip title={`全部作用次数档位提升至_${加速档位}段`}>
                    <span className='haste-level-up-level' style={{ color: 加速档位颜色 }}>
                      {e}
                    </span>
                  </Tooltip>
                )
              } else {
                return e
              }
            },
          },
        ]}
      />
      <div>{dataSource?.map((a) => a?.加速等级)?.join(',')}</div>
    </div>
  )
}

export default 多段伤害倒读条
