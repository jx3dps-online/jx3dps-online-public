// 一键设置最佳附魔
import { App, Button, Checkbox, Col, Divider, Modal, Row, message } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { RiseOutlined } from '@ant-design/icons'
import { 秒伤计算 } from '@/计算模块/计算函数'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 数据埋点 } from '@/工具函数/tools/log'
import { 增益选项数据类型 } from '@/@types/团队增益'

import { 初始化所有组合, 计算部位枚举 } from './util'
import './index.css'

const { 性能功能关闭数组, 名称: 心法名称, 小药小吃 } = 获取当前数据()
const 全部部位 = Object.keys(计算部位枚举)

function 计算最佳增益({ 保存数据并计算 }) {
  const { modal } = App.useApp()

  const 当前秒伤 = useAppSelector((state) => state.data?.当前计算结果)?.秒伤 || 0
  const 增益数据 = useAppSelector((state) => state.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state.data?.增益启用)

  // states
  const [计算部位选择弹窗展示, 设置计算部位选择弹窗展示] = useState<boolean>(false)
  const [计算结果弹窗展示, 设置计算结果弹窗展示] = useState<boolean>(false)
  const [最大组合, 更新最大组合] = useState<any>({})
  const [最大Dps, 更新最大秒伤] = useState<number>(0)
  const [计算用时, 更新计算用时] = useState<number>(0)
  const [最大增益, 更新最大增益] = useState<增益选项数据类型>()
  const [无计算部位增益数据, 设置无计算部位增益数据] = useState<增益选项数据类型>()

  const [当前选择计算部位, 更新当前选择计算部位] = useState<string[]>(全部部位)
  const [是否过滤加速, 更新是否过滤加速] = useState<boolean>()

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
    初始化(当前选择计算部位, 是否过滤加速)
  }, [当前选择计算部位, 是否过滤加速])

  // 当前计算部位属性对比
  const 当前增益展示 = useMemo(() => {
    const 最终展示 = {}
    当前选择计算部位?.forEach((key) => {
      if (key === '阵眼') {
        最终展示[key] = 增益数据?.阵眼
      } else {
        const 对应部位数据 = 小药小吃?.filter((a) => a?.小吃部位 === key)?.map((a) => a?.小吃名称)
        最终展示[key] = 增益数据?.小吃?.filter((a) => 对应部位数据?.includes(a))?.[0]
      }
    })
    return 最终展示
  }, [当前选择计算部位, 增益数据, 小药小吃])

  // 先根据当前的附魔列表，计算出最后计算dps时所需要的排列组合
  const 初始化 = (计算部位, 是否过滤加速) => {
    const res = 初始化所有组合(计算部位, 是否过滤加速)
    获取当前信息去除对应部位后的基础数据(计算部位)
    dataRef.current = res
  }

  const 获取当前信息去除对应部位后的基础数据 = (计算部位) => {
    const 新增益数据: 增益选项数据类型 = {
      团队增益: 增益数据?.团队增益,
      阵眼: '',
      小吃: [],
    }
    if (!计算部位?.includes('阵眼')) {
      新增益数据.阵眼 = 增益数据?.阵眼
    }
    if (增益数据?.小吃?.length) {
      const 所有需要过滤小吃名称 = 小药小吃
        ?.filter((item) => 计算部位?.includes(item?.小吃部位))
        ?.map((item) => item?.小吃名称)
      新增益数据.小吃 = 增益数据?.小吃?.filter((item) => !所有需要过滤小吃名称?.includes(item))
    }
    设置无计算部位增益数据({ ...新增益数据 })
  }

  const 计算前提示 = () => {
    if (无计算部位增益数据) {
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
          设置计算部位选择弹窗展示(true)
        },
        closable: true,
      })
    }
  }

  const 开始计算 = () => {
    数据埋点('计算最佳阵眼小药')
    const 开始计算时间 = new Date().valueOf()
    let 最大秒伤 = 0
    let 最大组合: any = {}
    let 最大增益: 增益选项数据类型 = {} as any
    if (dataRef?.current?.length) {
      for (let i = 0; i < dataRef?.current?.length; i++) {
        const 当前增益数据 = dataRef?.current[i]
        const 全部小吃: string[] = []
        Object.keys(当前增益数据)?.forEach((key) => {
          if (key !== '阵眼') {
            全部小吃.push(当前增益数据[key])
          }
        })
        const 更新增益: 增益选项数据类型 = {
          团队增益: 无计算部位增益数据?.团队增益 || [],
          阵眼: 当前增益数据?.阵眼,
          小吃: [...(无计算部位增益数据?.小吃 || []), ...全部小吃],
        }

        const { 秒伤 } = dispatch(
          秒伤计算({
            更新增益数据: 更新增益,
            计算技能详情: false,
          }),
        )
        if (秒伤 > 最大秒伤) {
          最大秒伤 = 秒伤
          最大组合 = 当前增益数据
          最大增益 = { ...更新增益 }
        }
      }
    }
    更新最大组合(最大组合)
    更新最大秒伤(最大秒伤)
    更新最大增益(最大增益)
    const 结束计算时间 = new Date().valueOf()
    const 计算用时 = 结束计算时间 - 开始计算时间
    if (最大秒伤 > 当前秒伤) {
      设置计算结果弹窗展示(true)
      更新计算用时(计算用时)
    } else {
      message.success(`当前附魔已为最佳方案，无需替换。计算用时${计算用时}ms`)
    }
  }

  const closeModal = () => {
    设置计算结果弹窗展示(false)
    更新最大组合({})
    更新最大秒伤(0)
    更新最大增益({} as any)
  }

  const 一键替换增益 = () => {
    保存数据并计算(最大增益)
    closeModal()
  }

  return (
    <>
      <Button
        size='small'
        style={{ marginLeft: 0 }}
        disabled={!增益启用}
        onClick={() => 设置计算部位选择弹窗展示(true)}
      >
        一键最佳
      </Button>
      <Modal
        title={'需计算的增益位置'}
        // centered
        open={计算部位选择弹窗展示}
        width={460}
        okText={'计算选中部位'}
        onOk={() => {
          设置计算部位选择弹窗展示(false)
          计算前提示()
        }}
        onCancel={() => 设置计算部位选择弹窗展示(false)}
      >
        <div className={'max-gain-all-check'}>
          <Checkbox
            onChange={(e) => {
              更新是否过滤加速(e?.target?.checked)
            }}
            checked={是否过滤加速}
          >
            是否过滤加速
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
            {Object.keys(计算部位枚举).map((key) => {
              return (
                <Col className={'max-gain-check-col'} span={6} key={key}>
                  <Checkbox value={key}>{key}</Checkbox>
                </Col>
              )
            })}
          </Row>
        </Checkbox.Group>
      </Modal>
      {/* 设置提醒和结果弹窗 */}
      <Modal
        title={
          <div className={'max-gain-modal-title'}>
            <span>增益替换结果对比</span>
            <span>计算用时：{计算用时}ms</span>
          </div>
        }
        maskClosable={false}
        centered
        open={计算结果弹窗展示}
        width={700}
        onCancel={() => 设置计算结果弹窗展示(false)}
        footer={
          <Button
            type='primary'
            onClick={async () => {
              await 一键替换增益()
              closeModal()
            }}
          >
            一键替换
          </Button>
        }
      >
        <div className={'max-gain-wrap'}>
          <div className='max-gain-content'>
            <h1 className={'max-gain-title'}>替换前</h1>
            <h1 className='max-gain-dps'>{当前秒伤}</h1>
            <div>
              {Object.keys(当前增益展示).map((key, index) => {
                return (
                  <div className={`max-gain-item`} key={`max-gain_${key}_${index}`}>
                    <span className='max-gain-label'>{key}</span>
                    <span className='max-gain-value'>{当前增益展示?.[key]}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className='max-gain-content'>
            <h1 className={'max-gain-title'}>替换后</h1>
            <h1 className='max-gain-dps dps-up-color'>
              {最大Dps}
              <RiseOutlined className='max-gain-dps-icon' />
            </h1>
            <div>
              {Object.keys(最大组合).map((key) => {
                const 不同部位 = 当前增益展示?.[key] !== 最大组合[key]
                return (
                  <div className={`max-gain-item ${不同部位 ? 'dps-up-color' : ''}`} key={key}>
                    <span className='max-gain-label'>{key}</span>
                    <span className='max-gain-value'>{最大组合[key]}</span>
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

export default 计算最佳增益
