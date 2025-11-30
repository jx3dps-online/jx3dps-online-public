// 一键设置最佳附魔
import { App, Button, Modal, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useAppDispatch } from '@/hooks'
import { RiseOutlined } from '@ant-design/icons'
import { 角色基础属性类型 } from '@/@types/角色'
import { 秒伤计算 } from '@/计算模块/计算函数'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 数据埋点 } from '@/工具函数/tools/log'

import 根据装备信息获取基础属性, {
  五彩石计算,
  判断五彩石郭氏增益,
} from '../../工具函数/根据装备信息获取基础属性'
import './index.css'

const { 五彩石 } = 获取当前数据()

const 五彩石原始数据 = 五彩石?.[6]

function 最佳五彩石设置({ 一键替换五彩石, 对比秒伤, 对比装备信息 }) {
  const [open, setOpen] = useState<boolean>(false)
  const [最大五彩石, 更新最大五彩石] = useState<string>('')
  const [最大Dps, 更新最大Dps] = useState<number>(0)
  const [计算用时, 更新计算用时] = useState<number>(0)
  const [无五彩石装备属性, 设置无五彩石装备属性] = useState<角色基础属性类型>()
  const [五彩石秒伤数据, 设置五彩石秒伤数据] = useState<五彩石秒伤数据类型[]>([])
  const { modal } = App.useApp()

  // 所有组合的缓存数据
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!open) {
      更新计算用时(0)
      更新最大Dps(0)
    }
  }, [open])

  useEffect(() => {
    获取当前装备信息去除五彩石加成的面板()
  }, [对比装备信息])

  const 获取当前装备信息去除五彩石加成的面板 = () => {
    const { 装备基础属性 } = 根据装备信息获取基础属性(对比装备信息, { 计算五彩石: false })
    设置无五彩石装备属性(装备基础属性)
  }

  const 计算前提示 = () => {
    modal.confirm({
      title: `确定开始计算吗`,
      content: `共 ${五彩石原始数据?.length} 个六级五彩石，计算将造成一定卡顿`,
      okText: '我要计算',
      onOk: async () => {
        开始计算()
      },
    })
  }

  const 开始计算 = () => {
    数据埋点('计算最佳五彩石')
    const 开始计算时间 = new Date().valueOf()
    let 最大秒伤 = 0
    let 最大五彩石: any = {}
    const 全部五彩石秒伤数据: 五彩石秒伤数据类型[] = []
    if (五彩石原始数据?.length) {
      for (let i = 0; i < 五彩石原始数据?.length; i++) {
        const 当前五彩石 = 五彩石原始数据[i]
        const 五彩石计算数据 = 五彩石计算(
          当前五彩石?.五彩石名称,
          无五彩石装备属性 as 角色基础属性类型,
        )
        const 装备增益 = 判断五彩石郭氏增益(五彩石计算数据?.五彩石郭氏增益, 对比装备信息?.装备增益)

        const { 秒伤 } = dispatch(
          秒伤计算({
            更新装备信息: {
              ...对比装备信息,
              装备增益,
              装备基础属性: 五彩石计算数据?.计算后属性,
              五彩石: 当前五彩石?.五彩石名称,
            } as any,
            计算技能详情: false,
          }),
        )
        // 显示五彩石属性简写
        const 五彩石属性 = 当前五彩石?.装备增益?.map((item) => item?.增益名称)?.join(' ')
        全部五彩石秒伤数据.push({
          名称: 当前五彩石?.五彩石名称,
          属性: 五彩石属性,
          秒伤,
          较当前比较: 秒伤 === 对比秒伤 ? 3 : 秒伤 > 对比秒伤 ? 1 : 2,
        })

        if (秒伤 > 最大秒伤) {
          最大秒伤 = 秒伤
          最大五彩石 = 五彩石原始数据[i]?.五彩石名称
        }
      }
    }

    全部五彩石秒伤数据.sort((a, b) => b.秒伤 - a.秒伤)
    设置五彩石秒伤数据(全部五彩石秒伤数据)
    更新最大五彩石(最大五彩石)
    更新最大Dps(最大秒伤)
    const 结束计算时间 = new Date().valueOf()
    const 计算用时 = 结束计算时间 - 开始计算时间
    setOpen(true)
    更新计算用时(计算用时)
  }

  const closeModal = () => {
    setOpen(false)
    更新最大五彩石('')
    更新最大Dps(0)
  }

  const 设置五彩石关闭弹窗 = async (五彩石名称) => {
    await 一键替换五彩石(五彩石名称)
    closeModal()
  }

  return (
    <>
      <Button type='primary' size='small' style={{ marginLeft: 12 }} onClick={() => 计算前提示()}>
        一键设置五彩石
      </Button>
      {/* 设置提醒和结果弹窗 */}
      <Modal
        title={
          <div className={'max-wucaishi-modal-title'}>
            <span>最佳五彩石结果对比</span>
            <span>计算用时：{计算用时}ms</span>
          </div>
        }
        maskClosable={false}
        centered
        open={open}
        onCancel={() => setOpen(false)}
        width={670}
        footer={false}
      >
        <div className={'max-wucaishi-wrap'}>
          {最大Dps === 对比秒伤 ? (
            <div className='max-wucaishi-wrap-has-max dps-up-color'>
              当前五彩石已为最佳方案，无需替换
            </div>
          ) : (
            <div className='max-wucaishi-wrap-content'>
              <div className='max-wucaishi-content'>
                <h1 className={'max-wucaishi-title'}>替换前</h1>
                <h1 className='max-wucaishi-dps dps-low-color'>{对比秒伤}</h1>
                <div>
                  <div className={`max-wucaishi-item`}>
                    <span className='max-wucaishi-value'>{对比装备信息?.五彩石 || '无五彩石'}</span>
                  </div>
                </div>
              </div>
              <div className='max-wucaishi-content'>
                <h1 className={'max-wucaishi-title'}>替换为最佳后</h1>
                <h1 className='max-wucaishi-dps dps-up-color'>
                  {最大Dps}
                  <RiseOutlined className='max-wucaishi-dps-icon' />
                </h1>
                <div>
                  <div className={`max-wucaishi-item dps-up-color`}>
                    <span className='max-wucaishi-value'>{最大五彩石}</span>
                  </div>
                </div>
              </div>
              <Button
                className='max-wucaishi-content'
                type='primary'
                onClick={() => 设置五彩石关闭弹窗(最大五彩石)}
              >
                替换为最佳五彩石
              </Button>
            </div>
          )}

          <Table
            className='max-wucaishi-table'
            size='small'
            pagination={false}
            dataSource={五彩石秒伤数据}
            scroll={{ y: 400 }}
            columns={[
              {
                key: '排名',
                title: '排名',
                dataIndex: '排名',
                width: 50,
                render: (value, row, index) => {
                  return (
                    <div>
                      <span>{index + 1}</span>
                    </div>
                  )
                },
              },
              {
                key: '名称',
                title: '五彩石',
                dataIndex: '名称',
                render: (value, row) => {
                  const cls = classNames(
                    'max-wucaishi-all-value',
                    row?.较当前比较 === 1 ? 'dps-up-color' : '',
                    row?.较当前比较 === 2 ? 'dps-low-color' : '',
                  )
                  return (
                    <div>
                      <span className={cls}>{value}</span>
                      {row?.较当前比较 === 3 ? `(当前)` : ''}
                    </div>
                  )
                },
              },
              {
                key: '属性',
                title: '属性',
                dataIndex: '属性',
                width: 150,
                render: (value) => {
                  return <div>{value}</div>
                },
              },
              {
                key: '秒伤',
                width: 150,
                title: '秒伤',
                dataIndex: '秒伤',
                sorter: (a: any, b: any) => {
                  return (b.秒伤 || 0) - (a.秒伤 || 0)
                },
              },
              {
                key: '操作',
                width: 50,
                title: '操作',
                dataIndex: '操作',
                render: (value, row) => {
                  return <a onClick={() => 设置五彩石关闭弹窗(row?.名称)}>使用</a>
                },
              },
            ]}
          />
        </div>
      </Modal>
    </>
  )
}

export default 最佳五彩石设置

interface 五彩石秒伤数据类型 {
  名称: string
  秒伤: number
  属性: string
  较当前比较: number // 1 高 2低 3 不变
}
