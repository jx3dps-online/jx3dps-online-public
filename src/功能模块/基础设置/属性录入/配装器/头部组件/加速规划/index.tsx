// 加速规划
import { Button, Checkbox, Form, InputNumber, message, Modal, Popover, Select, Spin } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新角色数据, 更新增益启用 } from '@/store/data'
import { 装备部位枚举 } from '@/@types/枚举'
import { 属性类型 } from '@/@types/属性'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 装备位置部位枚举, 装备属性信息模型, 装备类型枚举 } from '@/@types/装备'
import { 数据埋点 } from '@/工具函数/tools/log'
import NewBadge from '@/组件/NewBadge'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import useCycle from '@/hooks/use-cycle'
import {
  五彩石满足潮生要求,
  获取潮生要求提示,
} from '@/功能模块/基础设置/公用设置/循环约束/潮生五彩石'
import { 品级筛选范围 } from '@/数据/常量/装备常量'

import 加速值参考弹窗 from './加速值参考弹窗'
import 加速装备选择 from './加速装备选择'
import 计算组合结果弹窗, { 计算组合结果类型 } from './计算组合结果弹窗'
import { 应用组合到表单 } from './工具函数/应用组合到表单'
import { 合并小吃数据, 提取组合小吃 } from './工具函数/合并小吃'
import './index.css'

const isLocalBuild = process.env.REACT_APP_BUILD_TYPE === 'local'

const 品级范围 = {
  英雄品: 品级筛选范围.英雄,
  普通品: 品级筛选范围.普通,
  十人品: 品级筛选范围.十人,
  普通和英雄: 品级筛选范围.全部,
}

const 计算范围 = ['装备', '附魔', '五彩石', '小药', '家园酒']
const 装备类型范围 = [
  装备类型枚举.普通,
  装备类型枚举.副本精简,
  装备类型枚举.门派套装,
  装备类型枚举.切糕,
  装备类型枚举.橙武,
  装备类型枚举.特效武器,
  装备类型枚举.试炼精简,
  // 装备类型枚举.门派特效武器,
  // 装备类型枚举.PVX,
]

interface 加速规划类型 {
  form: any
  更换装备计算秒伤: (单个表单值: any, 全部表单值: any) => void
  /**
   * @name 循环覆盖
   * 目标编辑时用目标循环/奇穴/秘籍计算组合秒伤。
   */
  循环覆盖?: 计算循环覆盖类型
  允许规划增益?: boolean
}

function 加速规划(props: 加速规划类型) {
  const 当前数据 = use心法数据()
  const { 装备数据 } = 当前数据
  const { form: 配装器form, 更换装备计算秒伤, 循环覆盖, 允许规划增益 = true } = props
  const 可选计算范围 = 允许规划增益 ? 计算范围 : ['装备', '附魔', '五彩石']
  const { 当前循环信息 } = useCycle({
    覆盖数据: 循环覆盖?.更新计算循环名称
      ? { 当前计算循环名称: 循环覆盖.更新计算循环名称 }
      : undefined,
  })
  const dispatch = useAppDispatch()
  const 当前增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const [规划弹窗展示, 设置规划弹窗展示] = useState<boolean>(false)
  const [加速值参考弹窗展示, 设置加速值参考弹窗展示] = useState<boolean>(false)
  const [当前品级范围, 设置当前品级范围] = useState<string>('英雄品')
  const [锁定装备, 设置锁定装备] = useState<装备属性信息模型[]>()
  const [包含部位, 设置包含部位] = useState<装备位置部位枚举[]>([])
  const [计算组合结果, 设置计算组合结果] = useState<计算组合结果类型>()
  const [计算组合结果弹窗展示, 设置计算组合结果弹窗展示] = useState<boolean>(false)
  const workerRef = useRef<Worker | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [form] = Form.useForm()

  useEffect(() => {
    if (规划弹窗展示) {
      form?.setFieldsValue({
        品级范围: '英雄品',
        计算范围: (form.getFieldValue('计算范围') || []).filter((项) => 可选计算范围.includes(项)),
      })

      // 创建 Worker 实例
      workerRef.current = new Worker(new URL('./worker.ts', import.meta.url))

      // 定义接收 Worker 消息的回调
      workerRef.current.onmessage = (event) => {
        if (event.data) {
          const { 错误信息 = '', 所有组合, 锁定装备加速总和 = 0, 实际目标加速 = 0 } = event.data
          if (错误信息) {
            if (错误信息 === '锁定装备加速已符合目标加速需求') {
              设置计算组合结果(undefined)
              设置计算组合结果弹窗展示(false)
              message.info('已满足目标，无需规划')
            } else {
              message.error(错误信息)
            }
          } else {
            const 可用组合 = 允许规划增益
              ? 所有组合
              : 所有组合.filter((项) => !提取组合小吃(项.组合).length)
            设置计算组合结果({ 所有组合: 可用组合, 锁定装备加速总和, 实际目标加速 })
            设置计算组合结果弹窗展示(true)
          }
        } else {
          message.error('该心法不支持或解析失败')
        }
        setLoading(false)
      }
    } else {
      setLoading(false)
      设置锁定装备([])
      workerRef.current?.terminate()
    }

    // 清理 Worker
    return () => {
      workerRef.current?.terminate()
    }
  }, [规划弹窗展示, 允许规划增益])

  const 包含加速的装备部位 = useMemo(() => {
    return Object.keys(装备位置部位枚举)?.filter((key) => {
      const 部位 = 装备位置部位枚举[key]
      if (锁定装备?.length && 锁定装备?.some((item) => item?.装备部位 === 部位)) {
        return false
      }
      const 该部位数据 = 装备数据[部位]
      const 限制品级范围 = 品级范围[当前品级范围]
      return 该部位数据
        ?.filter(
          (装备) =>
            装备?.装备品级 >= 限制品级范围[0] &&
            装备?.装备品级 < 限制品级范围[1] &&
            ![装备类型枚举.PVX, 装备类型枚举.橙武]?.includes(装备?.装备类型),
        )
        .some((装备) => {
          const 装备增益列表 = 装备?.装备增益
          return 装备增益列表?.some((item) => item?.属性 === 属性类型.加速等级)
        })
    })
  }, [装备部位枚举, 当前品级范围, 锁定装备, 装备数据])

  const 全选 = (类型) => {
    if (类型 === '计算范围') {
      form?.setFieldValue('计算范围', 可选计算范围)
    } else if (类型 === '包含装备部位') {
      form?.setFieldValue('包含装备部位', 包含加速的装备部位)
    } else if (类型 === '装备类型') {
      form?.setFieldValue('装备类型', 装备类型范围)
    }
  }

  const 清空 = (类型) => {
    form?.setFieldValue(类型, undefined)
  }

  const 修改锁定装备 = (装备列表) => {
    设置锁定装备(装备列表)
    // 处理已经选择的包含部位
    if (包含部位?.length) {
      const 新包含部位 = 包含部位?.filter((key) => {
        const 实际部位 = 装备位置部位枚举[key]
        if (装备列表?.some((装备) => 装备?.装备部位 === 实际部位)) {
          return false
        } else {
          return true
        }
      })
      设置包含部位(新包含部位)
      form?.setFieldValue('包含部位', 新包含部位)
    }
  }

  const 开始规划 = () => {
    form?.validateFields()?.then((values) => {
      const 本次计算范围 = (values?.计算范围 || []).filter((项) => 可选计算范围.includes(项))
      if (values?.目标加速 === undefined || values?.目标加速 === null) {
        message.error('请设置目标加速值')
        return
      }
      if (values.目标加速 === 0) {
        设置计算组合结果(undefined)
        设置计算组合结果弹窗展示(false)
        message.info('已满足目标，无需规划')
        return
      }
      if (!本次计算范围.length) {
        message.error('请设置计算范围')
        return
      }
      if (本次计算范围.includes('装备') && !values?.包含装备部位?.length) {
        message.error('请设置包含部位')
        return
      }
      if (本次计算范围.includes('装备') && !values?.装备类型?.length) {
        message.error('请设置装备类型')
        return
      }

      const 数据 = {
        五彩石: {
          5: 当前数据.五彩石[5].filter((石头) => 五彩石满足潮生要求(石头, 当前循环信息)),
          6: 当前数据.五彩石[6].filter((石头) => 五彩石满足潮生要求(石头, 当前循环信息)),
        },
        小药小吃: 当前数据?.小药小吃,
        附魔: 当前数据?.附魔,
        装备数据: 当前数据?.装备数据,
      }

      if (!数据.五彩石[5].length && !数据.五彩石[6].length) {
        message.warning('当前心法没有可选的潮生五彩石，无法使用依赖潮生的循环进行寻优。')
        return
      }
      const 当前五彩石 = 当前数据.五彩石[5]
        .concat(当前数据.五彩石[6])
        .find((石头) => 石头.五彩石名称 === 配装器form.getFieldValue('五彩石'))
      if (!本次计算范围.includes('五彩石') && !五彩石满足潮生要求(当前五彩石, 当前循环信息)) {
        message.warning(`${获取潮生要求提示()}如需自动更换，请将五彩石加入计算范围。`)
        return
      }

      if (workerRef.current) {
        workerRef?.current?.postMessage({
          目标加速: values?.目标加速,
          包含装备部位: values?.包含装备部位,
          锁定装备: values?.锁定装备?.length ? values?.锁定装备 : 锁定装备 || [],
          计算范围: 本次计算范围,
          装备类型: values?.装备类型 || [],
          品级范围: 品级范围?.[当前品级范围],
          包含蓝色附魔小药: !!values?.包含蓝色附魔小药?.[0],
          过滤精品及挑战附魔: !!values?.过滤精品及挑战附魔?.[0],
          当前数据: 数据,
          当前循环信息,
        })
        setLoading(true)
      }
    })
  }

  const 应用组合 = (组合) => {
    配装器form?.validateFields()?.then((values) => {
      const { 表单值, 含小药家园酒, 小吃名称列表, 应用项数 } = 应用组合到表单(
        组合,
        values,
        锁定装备 || [],
      )
      // 写入前再次校验，防止旧规划结果或异步回调越过目标草稿边界。
      if (!允许规划增益 && 含小药家园酒) {
        message.warning('目标编辑不应用小药或家园酒，请重新规划装备组合。')
        return
      }
      if (含小药家园酒) {
        dispatch(
          更新角色数据({
            属性: '角色增益',
            数据: {
              阵眼: 当前增益数据?.阵眼 || '',
              小吃: 合并小吃数据(当前增益数据?.小吃 || [], 提取组合小吃(组合)),
            },
          }),
        )
        dispatch(更新增益启用(true))
      }
      配装器form?.setFieldsValue(表单值)
      更换装备计算秒伤?.(undefined, 表单值)
      设置计算组合结果弹窗展示(false)
      设置规划弹窗展示(false)
      const 当前加速值 =
        组合?.reduce((总和, item) => 总和 + (item?.value || 0), 0) +
        (计算组合结果?.锁定装备加速总和 || 0)
      if (含小药家园酒) {
        message.success(
          `已自动开启增益并写入 ${小吃名称列表?.length} 项小吃，应用 ${应用项数} 项加速改动，当前加速值 ${当前加速值}`,
        )
      } else {
        message.success(`已应用 ${应用项数} 项加速改动，当前加速值 ${当前加速值}`)
      }
    })
  }

  return (
    <>
      <NewBadge text='Pro'>
        <Button
          danger
          size='small'
          style={{ marginLeft: 12 }}
          onClick={() => {
            数据埋点('使用加速规划')
            if (isLocalBuild) {
              message.info('本地版本暂不支持加速规划，请使用网页版')
              return
            }
            设置规划弹窗展示(true)
          }}
        >
          加速规划
        </Button>
      </NewBadge>
      {/* 设置提醒和结果弹窗 */}
      <Modal
        title={
          <div className={'haste-project-modal-title'}>
            <span>加速规划</span>
          </div>
        }
        maskClosable={false}
        centered
        open={规划弹窗展示}
        onOk={开始规划}
        onCancel={() => 设置规划弹窗展示(false)}
        width={1000}
        okText={'开始规划'}
        okButtonProps={{
          loading: loading,
        }}
        destroyOnClose
      >
        {!允许规划增益 && <p>目标编辑只调整装备、附魔和五彩石；计算沿用当前增益。</p>}
        <Spin spinning={loading} tip='已经加快按宏速度了！请耐心等待.....'>
          <div className={'haste-project-wrap'}>
            <Form form={form} layout='vertical'>
              <Form.Item
                className={'haste-project-form-item-65'}
                name='目标加速'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>目标加速值</span>
                    <Button
                      danger
                      type='dashed'
                      style={{ marginLeft: 12 }}
                      size='small'
                      onClick={() => 设置加速值参考弹窗展示(true)}
                    >
                      加速值参考
                    </Button>
                  </div>
                }
              >
                <InputNumber
                  className={'haste-project-input'}
                  max={55000}
                  precision={0}
                  min={0}
                  placeholder='请输入你期望达到的加速值'
                />
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-35'}
                name='品级范围'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>可选品级范围</span>
                  </div>
                }
              >
                <Select
                  onChange={(e) => 设置当前品级范围(e)}
                  value={当前品级范围}
                  className={'haste-project-select'}
                  placeholder='请选择配置装备的范围'
                  options={Object.keys(品级范围)?.map((item) => {
                    return {
                      label: `${item} (${品级范围[item]?.[0]}-${品级范围[item]?.[1]})`,
                      value: item,
                    }
                  })}
                />
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-50'}
                name='计算范围'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>计算范围</span>
                    <span className={'haste-project-target-operate'}>
                      <a onClick={() => 全选('计算范围')}>全选</a>
                      <a className='haste-project-operate-delete' onClick={() => 清空('计算范围')}>
                        清空
                      </a>
                    </span>
                  </div>
                }
              >
                <Checkbox.Group>
                  {可选计算范围.map((item) => {
                    return (
                      <Checkbox value={item} key={`计算范围${item}`}>
                        {item}
                      </Checkbox>
                    )
                  })}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-25'}
                name='包含蓝色附魔小药'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>{允许规划增益 ? '是否计算蓝色附魔/小药' : '是否计算蓝色附魔'}</span>
                  </div>
                }
              >
                <Checkbox.Group>
                  <Checkbox value={true}>包含</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-25'}
                name='过滤精品及挑战附魔'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>过滤精品及挑战附魔</span>
                  </div>
                }
              >
                <Checkbox.Group>
                  <Checkbox value={true}>过滤</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-100'}
                name='装备类型'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>装备类型</span>
                    <span className={'haste-project-target-operate'}>
                      <a onClick={() => 全选('装备类型')}>全选</a>
                      <a className='haste-project-operate-delete' onClick={() => 清空('装备类型')}>
                        清空
                      </a>
                    </span>
                  </div>
                }
              >
                <Checkbox.Group>
                  {装备类型范围?.map((item) => {
                    return (
                      <Checkbox value={item} key={`装备类型${item}`}>
                        {item}
                      </Checkbox>
                    )
                  })}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-100'}
                name='包含装备部位'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>包含部位</span>
                    <span className={'haste-project-target-operate'}>
                      <a onClick={() => 全选('包含装备部位')}>全选</a>
                      <a
                        className='haste-project-operate-delete'
                        onClick={() => 清空('包含装备部位')}
                      >
                        清空
                      </a>
                    </span>
                  </div>
                }
              >
                <Checkbox.Group value={包含部位} onChange={(e) => 设置包含部位(e)}>
                  {包含加速的装备部位?.map((item) => {
                    return (
                      <Checkbox value={item} key={`装备部位${item}`}>
                        {装备位置部位枚举[item]}
                      </Checkbox>
                    )
                  })}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item
                className={'haste-project-form-item-100'}
                name='锁定装备'
                label={
                  <div className={'haste-project-target-header'}>
                    <span>锁定装备</span>
                    <span className={'haste-project-target-operate'}>
                      <Popover
                        title='锁定装备说明'
                        content={
                          <div>
                            <p>用于锁定你在计算中固定用于计算的装备</p>
                            <p>常用于你已经拥有该加速装备，以该装备为加速基础进行配装</p>
                            <p>例如，你已经拥有了橙武，基于橙武的加速进行规划</p>
                          </div>
                        }
                      >
                        <a>说明</a>
                      </Popover>
                      <a className='haste-project-operate-delete' onClick={() => 清空('锁定装备')}>
                        清空
                      </a>
                    </span>
                  </div>
                }
              >
                <加速装备选择 onChange={修改锁定装备} />
              </Form.Item>
            </Form>
          </div>
        </Spin>
        <加速值参考弹窗
          open={加速值参考弹窗展示}
          onCancel={() => 设置加速值参考弹窗展示(false)}
          设置目标加速={(目标加速) => {
            form?.setFieldValue('目标加速', 目标加速)
          }}
        />
        <计算组合结果弹窗
          open={计算组合结果弹窗展示}
          onCancel={() => 设置计算组合结果弹窗展示(false)}
          计算组合结果={计算组合结果}
          锁定装备={锁定装备 || []}
          onApply={应用组合}
          form={配装器form}
          循环覆盖={循环覆盖}
          允许规划增益={允许规划增益}
        />
      </Modal>
    </>
  )
}

export default 加速规划
