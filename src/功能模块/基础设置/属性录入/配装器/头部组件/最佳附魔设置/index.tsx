// 一键设置最佳附魔
import { App, Button, Checkbox, Col, Divider, Modal, Row, message } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch } from '@/hooks'
import { RiseOutlined } from '@ant-design/icons'
// import { 装备部位枚举 } from '@/@types/枚举'
import { 角色基础属性类型 } from '@/@types/角色'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 装备位置部位枚举 } from '@/@types/装备'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 数据埋点 } from '@/工具函数/tools/log'

import 根据装备信息获取基础属性 from '../../工具函数/根据装备信息获取基础属性'
import { 修改装备属性, 初始化所有组合 } from './util'
import './index.css'

const { 性能功能关闭数组, 名称: 心法名称 } = 获取当前数据()
const 全部部位: 装备位置部位枚举[] = Object.keys(装备位置部位枚举) as 装备位置部位枚举[]

function 最佳附魔设置({ 一键替换附魔, 对比秒伤, 对比装备信息 }) {
  const [open, setOpen] = useState<boolean>(false)
  const [部位选择弹窗, 更新部位选择弹窗] = useState<boolean>(false)
  const [最大组合, 更新最大组合] = useState<any>({})
  const [最大Dps, 更新最大秒伤] = useState<number>(0)
  const [计算用时, 更新计算用时] = useState<number>(0)
  const [无附魔装备属性, 设置无附魔装备属性] = useState<角色基础属性类型>()
  const { modal } = App.useApp()

  const [当前选择计算部位, 更新当前选择计算部位] = useState<装备位置部位枚举[]>(全部部位)

  const [过滤挑战附魔, 更新过滤挑战附魔] = useState<boolean>(false)

  const 是否选择部分 = useMemo(() => {
    return !!(当前选择计算部位?.length && 当前选择计算部位?.length < 全部部位?.length)
  }, [当前选择计算部位, 全部部位])

  const 是否全选 = useMemo(() => {
    return !全部部位?.some((key) => !当前选择计算部位?.includes(key))
  }, [当前选择计算部位, 全部部位])

  // 所有组合的缓存数据
  const dispatch = useAppDispatch()
  const dataRef = useRef<any>()

  useEffect(() => {
    初始化(当前选择计算部位)
  }, [对比装备信息, 当前选择计算部位, 过滤挑战附魔])

  const 当前附魔信息 = useMemo(() => {
    const res: any[] = []
    const 不同部位: string[] = []
    if (Object.keys(最大组合)?.length !== 0) {
      const 列表 = 对比装备信息?.装备列表
      Object.keys(最大组合).forEach((key) => {
        const 装备位置 = 装备位置部位枚举[key]
        const 当前附魔 = 列表?.find((item) => item?.装备部位 === 装备位置)?.附魔 || ''
        res.push({
          部位: 装备位置,
          附魔: 当前附魔,
        })

        const 附魔属性 = Object.keys(最大组合[key])?.[0]
        const 附魔值 = Object.values(最大组合[key])?.[0]
        if (当前附魔 !== `${附魔属性}+${附魔值}`) {
          不同部位.push(key)
        }
      })
    }
    return {
      当前附魔: res,
      不同部位,
    }
  }, [对比装备信息, 最大组合])

  // 先根据当前的附魔列表，计算出最后计算dps时所需要的排列组合
  const 初始化 = (计算部位) => {
    const res = 初始化所有组合(计算部位, 过滤挑战附魔)
    获取当前装备信息去除附魔加成的面板(计算部位)
    dataRef.current = res
  }

  const 获取当前装备信息去除附魔加成的面板 = (计算部位) => {
    const { 装备基础属性 } = 根据装备信息获取基础属性(对比装备信息, { 过滤附魔部位: 计算部位 })
    设置无附魔装备属性(装备基础属性)
  }

  const 计算前提示 = () => {
    if (无附魔装备属性) {
      modal.confirm({
        title: `确定开始计算吗`,
        content: (
          <div>
            <p>共 {dataRef?.current?.length} 种组合，计算将造成一定卡顿</p>
            {dataRef?.current?.length > 500 && 性能功能关闭数组?.length ? (
              <p>「{心法名称}」玩家电脑性能不佳情况下请慎重使用</p>
            ) : null}
          </div>
        ),
        okText: '我要计算',
        onOk: async () => {
          开始计算()
        },
        cancelText: '重新选择',
        onCancel: () => {
          更新部位选择弹窗(true)
        },
        closable: true,
      })
    }
  }

  const 开始计算 = () => {
    数据埋点('计算最佳附魔')
    const 开始计算时间 = new Date().valueOf()
    let 最大秒伤 = 0
    let 最大组合: any = {}
    if (dataRef?.current?.length) {
      for (let i = 0; i < dataRef?.current?.length; i++) {
        const 当前附魔数据 = dataRef?.current[i]
        const 修改后装备属性 = 修改装备属性(无附魔装备属性 as 角色基础属性类型, 当前附魔数据)
        const { 秒伤 } = dispatch(
          秒伤计算({
            更新装备信息: {
              ...对比装备信息,
              装备基础属性: 修改后装备属性,
            } as any,
            计算技能详情: false,
          }),
        )
        if (秒伤 > 最大秒伤) {
          最大秒伤 = 秒伤
          最大组合 = 当前附魔数据
        }
      }
    }
    更新最大组合(最大组合)
    更新最大秒伤(最大秒伤)
    const 结束计算时间 = new Date().valueOf()
    const 计算用时 = 结束计算时间 - 开始计算时间
    if (最大秒伤 > 对比秒伤) {
      setOpen(true)
      更新计算用时(计算用时)
    } else {
      message.success(`当前附魔已为最佳方案，无需替换。计算用时${计算用时}ms`)
    }
  }

  const closeModal = () => {
    setOpen(false)
    更新最大组合({})
    更新最大秒伤(0)
  }

  return (
    <>
      <Button
        type='primary'
        size='small'
        style={{ marginLeft: 12 }}
        onClick={() => 更新部位选择弹窗(true)}
      >
        一键设置附魔
      </Button>
      <Modal
        title={'需计算的附魔部位'}
        // centered
        open={部位选择弹窗}
        width={460}
        okText={'计算选中部位'}
        onOk={() => {
          更新部位选择弹窗(false)
          计算前提示()
        }}
        onCancel={() => 更新部位选择弹窗(false)}
      >
        <div className={'max-fumo-all-check'}>
          <Checkbox
            onChange={(e) => {
              更新过滤挑战附魔(e.target.checked)
            }}
            checked={过滤挑战附魔}
          >
            过滤挑战附魔
          </Checkbox>
          <Checkbox
            indeterminate={是否选择部分}
            onChange={() => {
              if (是否全选) {
                更新当前选择计算部位([])
              } else {
                更新当前选择计算部位(全部部位)
              }
            }}
            checked={是否全选}
          >
            全选
          </Checkbox>
        </div>
        <Divider style={{ margin: '12px 0' }} />

        <Checkbox.Group value={当前选择计算部位} onChange={(e) => 更新当前选择计算部位(e as any)}>
          <Row>
            {全部部位.map((key) => {
              return (
                <Col className={'max-fumo-check-col'} span={6} key={key}>
                  <Checkbox value={key}>{装备位置部位枚举[key]}</Checkbox>
                </Col>
              )
            })}
          </Row>
        </Checkbox.Group>
      </Modal>
      {/* 设置提醒和结果弹窗 */}
      <Modal
        title={
          <div className={'max-fumo-modal-title'}>
            <span>最佳附魔结果对比</span>
            <span>计算用时：{计算用时}ms</span>
          </div>
        }
        maskClosable={false}
        centered
        open={open}
        width={500}
        onCancel={() => setOpen(false)}
        footer={
          <Button
            type='primary'
            onClick={async () => {
              await 一键替换附魔(最大组合)
              closeModal()
            }}
          >
            一键替换
          </Button>
        }
      >
        <div className={'max-fumo-wrap'}>
          <div className='max-fumo-content'>
            <h1 className={'max-fumo-title'}>替换前</h1>
            <h1 className='max-fumo-dps'>{对比秒伤}</h1>
            <div>
              {(当前附魔信息?.当前附魔 || []).map((item, index) => {
                return (
                  <div className={`max-fumo-item`} key={`${item?.部位}_${index}`}>
                    <span className='max-fumo-label'>{item?.部位}</span>
                    <span className='max-fumo-value'>{item?.附魔}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className='max-fumo-content'>
            <h1 className={'max-fumo-title'}>替换后</h1>
            <h1 className='max-fumo-dps dps-up-color'>
              {最大Dps}
              <RiseOutlined className='max-fumo-dps-icon' />
            </h1>
            <div>
              {Object.keys(最大组合).map((key) => {
                const 附魔属性 = Object.keys(最大组合[key])?.[0]
                const 附魔值 = Object.values(最大组合[key])?.[0]
                return (
                  <div
                    className={`max-fumo-item ${
                      当前附魔信息?.不同部位?.includes(key) ? 'dps-up-color' : ''
                    }`}
                    key={key}
                  >
                    <span className='max-fumo-label'>{装备位置部位枚举[key]}</span>
                    <span className='max-fumo-value'>{`${附魔属性}+${附魔值}`}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default 最佳附魔设置
