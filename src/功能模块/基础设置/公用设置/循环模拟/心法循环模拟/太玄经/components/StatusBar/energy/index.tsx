import React, { useState } from 'react'
import { 角色状态信息类型 } from '../../../simulator/type'
import { 每秒郭氏帧 } from '@/数据/常量'

import { Modal, Progress, Table } from 'antd'
import './index.css'

interface RuiyiProps {
  角色状态信息: 角色状态信息类型
  起卦次数: number
}

function Ruiyi(props: RuiyiProps) {
  const { 角色状态信息, 起卦次数 } = props
  const [星运详情可见, 设置星运详情可见] = useState(false)
  const [溢出明细可见, 设置溢出明细可见] = useState(false)
  const [来源统计可见, 设置来源统计可见] = useState(false)
  const 起手星运 = 角色状态信息?.起手星运 || 0
  const 溢出星运 = 角色状态信息?.累计溢出星运 || 0
  const 累计获得星运 = 角色状态信息?.累计获得星运 || 0
  const 获得总星运 = 累计获得星运 + 溢出星运
  const 星运上限 = 角色状态信息?.星运上限 || 100
  const 星运 = 角色状态信息?.星运 || 0

  return (
    <div className={'cycle-status-bar-content'}>
      <div className={'cycle-status-bar-title'}>星运</div>
      <div className={'cycle-status-bar-body'}>
        <Progress
          className={'cycle-status-bar-ruiyi'}
          percent={(星运 / 星运上限) * 100}
          format={() => `${星运}/${星运上限}`}
        />
      </div>
      <div className='taixuan-energy-totals'>
        <button
          type='button'
          className='taixuan-energy-overflow-link'
          onClick={() => 设置星运详情可见(true)}
        >
          星运及共鸣时长统计
        </button>
      </div>
      <Modal
        title='星运及共鸣时长统计'
        open={星运详情可见}
        onCancel={() => 设置星运详情可见(false)}
        footer={null}
      >
        <p>
          <button
            type='button'
            className='taixuan-energy-overflow-link'
            onClick={() => 设置来源统计可见(true)}
          >
            当前已获得星运：{累计获得星运 + 起手星运}
          </button>
        </p>
        <p>当前已消耗星运：{角色状态信息?.累计消耗星运 || 0}</p>
        <p>
          <button
            type='button'
            className='taixuan-energy-overflow-link'
            onClick={() => 设置溢出明细可见(true)}
          >
            已溢出星运：{角色状态信息?.累计溢出星运 || 0}
          </button>
        </p>
        <p>共鸣窗口期统计（起卦次数*6s）：{起卦次数 * 6}s</p>
      </Modal>
      <Modal
        title='获得星运来源统计'
        open={来源统计可见}
        onCancel={() => 设置来源统计可见(false)}
        footer={null}
        width={680}
      >
        <p>
          获得总星运（包括溢出）：{获得总星运}点 − 溢出星运（{溢出星运}点）＋ 起手星运（
          {起手星运}点）＝ {累计获得星运 + 起手星运}点
        </p>
        <Table
          size='small'
          rowKey='来源'
          dataSource={Object.entries(角色状态信息?.星运来源统计 || {}).map(([来源, 统计]) => ({
            来源,
            ...统计,
            有效获得星运: 统计.获得星运 - 统计.溢出星运,
          }))}
          columns={[
            { title: '来源技能', dataIndex: '来源' },
            { title: '获得星运（含溢出）', dataIndex: '获得星运' },
            { title: '溢出星运', dataIndex: '溢出星运' },
            { title: '有效获得星运', dataIndex: '有效获得星运' },
          ]}
          pagination={false}
          locale={{ emptyText: '本循环暂无技能获得星运' }}
        />
      </Modal>
      <Modal
        title='星运溢出明细'
        open={溢出明细可见}
        onCancel={() => 设置溢出明细可见(false)}
        footer={null}
        width={560}
      >
        <Table
          size='small'
          dataSource={(角色状态信息?.星运溢出记录 || []).map((记录, index) => ({
            ...记录,
            key: index,
          }))}
          columns={[
            {
              title: '时间（秒）',
              dataIndex: '时间',
              render: (时间: number) => 时间 / 每秒郭氏帧,
            },
            { title: '技能', dataIndex: '技能名称' },
            { title: '溢出星运', dataIndex: '溢出星运' },
          ]}
          pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
          locale={{ emptyText: '本循环暂无星运溢出' }}
        />
      </Modal>
    </div>
  )
}

export default Ruiyi
