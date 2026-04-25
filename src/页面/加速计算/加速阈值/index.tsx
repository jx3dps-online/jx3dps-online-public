import React, { useState } from 'react'
import { Button, InputNumber, message, Table } from 'antd'
import './index.css'
import { 获取阈值 } from '../utils'

function 加速阈值() {
  const [val, setVal] = useState<number>()
  const [dataSource, setDataSource] = useState<any[]>([])

  const 计算帧数 = () => {
    if (!val) {
      message.error('请输入要计算的原始帧数')
      return
    }
    const 阈值: any = 获取阈值(val, val - 1)
    setDataSource(
      Object.keys(阈值).map((key) => {
        return {
          加速档位: key,
          实际时间: (val - +key) / 16,
          加速等级: 阈值[key],
        }
      }),
    )
  }

  return (
    <div className='haste-layout-haste'>
      <div className='haste-layout-content'>
        <InputNumber
          className='haste-layout-input'
          value={val}
          onChange={(e: any) => setVal(e)}
          placeholder='请输入原始帧数'
          step={1}
          precision={0}
          max={999}
          min={2}
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
            dataIndex: '加速档位',
          },
          {
            title: '实际时间',
            dataIndex: '实际时间',
          },
          {
            title: '所需加速等级',
            dataIndex: '加速等级',
          },
        ]}
      />
      <div>{dataSource?.map((a) => a?.加速等级)?.join(',')}</div>
    </div>
  )
}

export default 加速阈值
