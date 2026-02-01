import React from 'react'
import { Modal, ModalProps, Table } from 'antd'
import 循环模拟技能基础数据, { 日志类型数组 } from '../../../../constant/skill'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环日志数据类型 } from '../../../../simulator/type'
import '../../../../index.css'

interface BattleLogModalProps extends ModalProps {
  日志信息: 循环日志数据类型[]
}

const BattleLogModal: React.FC<BattleLogModalProps> = (props) => {
  const { open, onCancel, 日志信息 } = props

  const columns = [
    {
      title: '日志',
      dataIndex: '日志',
      filters: [...循环模拟技能基础数据, { 技能名称: '流血' }]?.map((item) => {
        return {
          text: item?.技能名称,
          value: item?.技能名称,
        }
      }),
      onFilter: (value: any, record) => {
        return record.日志?.includes(value) || record?.日志类型?.includes(value)
      },
    },
    {
      title: '日志类型',
      dataIndex: '日志类型',
      filters: 日志类型数组?.map((item) => {
        return {
          text: item,
          value: item,
        }
      }),
      onFilter: (value: any, record) => record.日志类型.indexOf(value) === 0,
    },
    {
      title: '伤害次数',
      dataIndex: '伤害次数',
      render: (_, row) => {
        return row?.其他数据?.伤害次数 || ''
      },
    },
    {
      title: 'buff列表',
      dataIndex: 'buff列表',
      render: (_, record) => {
        return record.日志类型 === '造成伤害' ? (_ || [])?.join(',') || '-' : '-'
      },
    },
    {
      title: '日志帧',
      dataIndex: '日志时间',
      render: (_) => {
        return _
      },
    },
    {
      title: '日志秒',
      dataIndex: '日志秒',
      render: (_, row) => {
        return row?.日志时间 / 每秒郭氏帧
      },
    },
    // {
    //   title: '造成伤害',
    //   dataIndex: '造成伤害',
    // },
    // {
    //   title: '造成总伤害',
    //   dataIndex: '造成总伤害',
    // },
    // {
    //   title: '秒伤',
    //   dataIndex: '秒伤',
    // },
  ]

  return (
    <Modal
      className='cycle-simulator-modal'
      open={open}
      onCancel={onCancel}
      title={
        <div className={'cycle-simulator-modal-header'}>
          <h1 className={'cycle-simulator-modal-title'}>战斗日志</h1>
        </div>
      }
      width={'80%'}
      centered
      footer={false}
    >
      <Table
        dataSource={日志信息}
        columns={columns}
        size='small'
        pagination={{ pageSize: 100, showTotal: (total) => total }}
      />
    </Modal>
  )
}

export default BattleLogModal
