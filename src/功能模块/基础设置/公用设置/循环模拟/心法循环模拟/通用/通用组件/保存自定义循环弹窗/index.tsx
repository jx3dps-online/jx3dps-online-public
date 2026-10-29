import { Alert, Checkbox, Input, message, Modal, Spin, Switch } from 'antd'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 循环技能详情, 循环数据, 循环详情 } from '@/@types/循环'
import { 快照类型 } from '@/@types/技能'

import { 更新当前自定义循环列表 } from '@/store/data'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 延迟设定, 每秒郭氏帧 } from '@/数据/常量'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取心法加速阈值, 获取主要加速阈值 } from '@/数据/加速阈值'
import { 获取阈值选择范围, 解析手动加速范围 } from '@/工具函数/加速阈值'
import 加速阈值选择 from '@/组件/加速阈值选择'
import CycleSelect from '@/组件/CycleSelect'
import { 数据埋点 } from '@/工具函数/tools/log'
import { 循环日志数据类型 } from '../../../../typs'
import { 生成实际技能序列 } from '../../通用函数'
import CycleSimulatorContext from '../../../../context'
import './index.css'

interface 保存自定义循环弹窗类型 {
  自定义循环保存弹窗: boolean
  设置自定义循环保存弹窗: (e: boolean) => void
  获取计算循环数据: (data: 循环日志数据类型[], 战斗时间?) => 循环技能详情[]
  奇穴信息: string[]
  循环模拟: (e: 循环模拟函数类型) => any
  技能序列?: any
  启用团队增益快照?: boolean
  其他团队快照?: 快照类型[]
  额外配置信息?: any
  默认加速挡位?: string
  加速档位配置?: { 加速档位: number; 加速值: number }[]
}

interface 循环模拟函数类型 {
  奇穴: string[]
  传入加速: number
  传入延迟: number
  更新展示: boolean
  实时计算?: boolean
}

function 保存自定义循环弹窗(props: 保存自定义循环弹窗类型) {
  const {
    自定义循环保存弹窗,
    设置自定义循环保存弹窗,
    获取计算循环数据,
    奇穴信息,
    循环模拟,
    技能序列,
    默认加速挡位,
    额外配置信息 = {},
  } = props

  const { 秘籍信息, 起手Buff配置, 模拟DPS结果, 加速值, 网络延迟, 增益启用 } =
    useContext(CycleSimulatorContext)

  const 心法 = use心法数据()
  const 阈值列表 = useMemo(() => 获取心法加速阈值(心法), [心法])
  const [延迟选项, 设置延迟选项] = useState<number[]>([0, 1, 2])
  const [按阈值选择, 设置按阈值选择] = useState(!默认加速挡位)
  const [选中阈值, 设置选中阈值] = useState<string[]>([])
  const [加速等级, 设置加速等级] = useState(默认加速挡位 || '')
  const [循环标识, 设置循环标识] = useState<string>()
  const [保存中, 设置保存中] = useState(false)
  const 保存任务 = useRef(0)
  const dispatch = useAppDispatch()
  const 自定义循环列表 = useAppSelector((state) => state.data.自定义循环列表)

  useEffect(() => {
    设置保存中(false)
    if (自定义循环保存弹窗) {
      设置选中阈值(
        获取主要加速阈值(阈值列表).flatMap((组) => 组.档位.slice(0, 3).map((项) => 项.标识)),
      )
      设置按阈值选择(!默认加速挡位)
      设置加速等级(默认加速挡位 || '')
    } else {
      设置循环标识(undefined)
    }
    return () => {
      保存任务.current++
    }
  }, [自定义循环保存弹窗, 心法.名称])

  const 预览 = useMemo(() => {
    try {
      const 范围 = 按阈值选择
        ? 获取阈值选择范围(阈值列表, 选中阈值, 99999)
        : 解析手动加速范围(加速等级)
      return { 范围, 错误: 范围.length ? '' : '请选择至少一个加速阈值' }
    } catch (错误) {
      return { 范围: [] as [number, number][], 错误: (错误 as Error).message }
    }
  }, [按阈值选择, 阈值列表, 选中阈值, 加速等级])

  const 保存自定义循环前 = async () => {
    if (保存中) return
    if (!循环标识 || 预览.错误 || !延迟选项.length) {
      message.error(!循环标识 ? '请选择/输入循环标识' : 预览.错误 || '请选择至少一个延迟')
      return
    }
    设置保存中(true)
    const 任务 = ++保存任务.current
    try {
      await 确认保存循环(任务)
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '保存循环失败，请重试')
    } finally {
      if (任务 === 保存任务.current) 设置保存中(false)
    }
  }

  // 确认保存自定义循环
  const 确认保存循环 = async (任务: number) => {
    const 名称 = 循环标识 || ''

    // 获取各加速下 各网络延迟的循环
    const 各延迟枚举 = 延迟选项
    const 待计算加速值 = 预览.范围.map((范围) => ({
      计算加速等级: 范围[0],
      保存数据: { 循环加速值范围: 范围 },
    }))
    const 保存循环结果: 循环详情[] = []
    const 异常结果: any[] = []

    // 对比模拟器当前加速值和延迟，有异常则提示
    const 检验模拟器保存加速值 = 预览.范围.find(
      ([下限, 上限]) => 加速值 >= 下限 && 加速值 < 上限,
    )?.[0]

    for (const 延迟 of 各延迟枚举) {
      for (const 加速信息 of 待计算加速值) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
        if (任务 !== 保存任务.current) return
        const 模拟结果 = 循环模拟({
          传入加速: Number(加速信息?.计算加速等级),
          传入延迟: Number(延迟),
          更新展示: false,
          奇穴: [...奇穴信息],
        })
        const 本次日志 = 模拟结果?.最终日志
        const 循环执行结果 = 模拟结果?.循环执行结果
        const 战斗秒 = 模拟结果?.当前时间 / 每秒郭氏帧
        if (
          循环执行结果 === '成功' &&
          检验模拟器保存加速值 === Number(加速信息?.计算加速等级) &&
          Number(延迟) === 网络延迟
        ) {
          if (战斗秒 !== 模拟DPS结果?.秒伤计算时间) {
            message.warning(
              <div style={{ textAlign: 'left' }}>
                <p>保存采样与当前页面模拟用时不同</p>
                <p>保存按所选加速值模拟；可补选阈值或手动加入当前加速值</p>
                <p>
                  保存采样：{战斗秒}秒，加速值：{Number(加速信息?.计算加速等级)}
                </p>
                <p>
                  当前页面：{模拟DPS结果?.秒伤计算时间}秒，加速值：{加速值}
                </p>
              </div>,
              10,
            )
          }
        }
        if (循环执行结果 === '成功') {
          const 技能详情 = 获取计算循环数据(本次日志, 模拟结果?.当前时间)
          const 模拟器快照秒伤 =
            战斗秒 > 0
              ? dispatch(
                  秒伤计算({
                    更新循环技能列表: 技能详情,
                    更新计算时间: 战斗秒,
                    更新奇穴数据: 奇穴信息,
                    更新秘籍信息: 秘籍信息,
                    更新增益启用: 增益启用,
                    计算技能详情: false,
                  }),
                ).秒伤
              : 0
          保存循环结果.push({
            ...加速信息?.保存数据,
            循环延迟要求: 延迟,
            战斗时间: 战斗秒,
            技能详情,
            模拟器快照秒伤,
          })
        } else {
          异常结果.push({
            加速值: 加速信息?.计算加速等级,
            延迟,
          })
        }
      }
    }

    if (异常结果?.length) {
      message.error(
        `以下条件循环异常，已跳过；仅保存成功结果：${异常结果
          .map((item) => {
            return `[加速：${item.加速值}，延迟：${item.延迟}]`
          })
          .join('、')}`,
      )
    }
    if (!保存循环结果.length) {
      message.error('所有轮次均失败，未保存，原有循环保持不变')
      return
    }

    const 技能序列名称 = 生成实际技能序列(技能序列)

    const 档位细化列表 = 待计算加速值?.map((加速信息) => 加速信息?.计算加速等级)?.join('｜')

    const 保存循环对象: 循环数据 = {
      名称,
      标题: 名称,
      提供者: '模拟',
      备注: `循环加速值细化为：${档位细化列表}`,
      类型: '自定义',
      标记: '自定义',
      循环详情: 保存循环结果,
      奇穴: 奇穴信息,
      秘籍: 秘籍信息,
      技能序列: 技能序列名称,
      强制加速要求: true,
      额外配置信息: 额外配置信息 || {},
      起手Buff配置: 起手Buff配置 || {},
    }

    const 新自定义循环 = 自定义循环列表?.some((item) => item?.名称 === 名称)
      ? 自定义循环列表.map((item) => {
          return item.名称 === 名称 ? 保存循环对象 : item
        })
      : (自定义循环列表 || []).concat([保存循环对象])

    try {
      dispatch(更新当前自定义循环列表(新自定义循环))
      数据埋点('保存自定义循环')

      message.success('保存成功')
      设置自定义循环保存弹窗(false)
    } catch {
      message.error('保存循环失败，疑似数据过大导致的浏览器内存溢出')
    }
  }

  return (
    <Modal
      centered
      title='保存自定义循环'
      okButtonProps={{
        disabled: !循环标识 || !!预览.错误 || !延迟选项.length,
        loading: 保存中,
      }}
      open={自定义循环保存弹窗}
      onCancel={() => {
        if (!保存中) 设置自定义循环保存弹窗(false)
      }}
      cancelButtonProps={{ disabled: 保存中 }}
      closable={!保存中}
      maskClosable={false}
      onOk={保存自定义循环前}
      width={760}
      destroyOnClose
      className={'cycle-custom-save-modal'}
    >
      <Spin spinning={保存中} tip='正在逐个模拟，请稍候'>
        <div className='cycle-custom-save-checkbox'>
          <p>循环名称</p>
          <CycleSelect
            value={循环标识}
            onChange={设置循环标识}
            className={'cycle-custom-cycle-select'}
          />
          <p className={'cycle-custom-cycle-select-title'}>
            <span>加速</span>
            <Switch
              checked={按阈值选择}
              onChange={设置按阈值选择}
              checkedChildren='选择阈值'
              unCheckedChildren='手动输入数值'
            />
          </p>
          {按阈值选择 ? (
            <加速阈值选择
              多选
              展示方式='平铺'
              阈值列表={阈值列表}
              value={选中阈值}
              onChange={设置选中阈值}
            />
          ) : (
            <Input
              value={加速等级}
              onChange={(e) => 设置加速等级(e.target.value)}
              className='cycle-custom-cycle-input-numbers'
              placeholder={'请输入要区分的加速等级，多个等级按英文逗号(,)区分，例:0,206,9232'}
            />
          )}
          <p style={{ marginTop: 12 }}>延迟</p>
          <Checkbox.Group value={延迟选项} onChange={(e) => 设置延迟选项(e as number[])}>
            {延迟设定.map((item) => {
              return (
                <Checkbox value={item.value} key={item.value}>
                  {item.label}
                </Checkbox>
              )
            })}
          </Checkbox.Group>
        </div>
      </Spin>
      <Alert message='范围包含下限、不含上限；最后上限为 99999。所选阈值用于采样，条件阈值不会自动启用 Buff。特殊技能可选择对应阈值或手动细化；失败轮次将提示并跳过，其余成功结果仍会保存；全部失败时不保存。' />
    </Modal>
  )
}

export default 保存自定义循环弹窗
