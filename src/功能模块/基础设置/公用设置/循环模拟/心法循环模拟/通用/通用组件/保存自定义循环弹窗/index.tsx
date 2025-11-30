import { Alert, Checkbox, Input, message, Modal, Switch } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 循环技能详情, 循环数据, 循环详情 } from '@/@types/循环'
import { 快照类型 } from '@/@types/技能'

import { 更新当前自定义循环列表 } from '@/store/data'
import { 延迟设定, 每秒郭氏帧 } from '@/数据/常量'
import { 获取档位加速值 } from '@/工具函数/data'
import CycleSelect from '@/组件/CycleSelect'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

import { 数据埋点 } from '@/工具函数/tools/log'
import { 循环日志数据类型 } from '../../../../typs'
import { 生成实际技能序列 } from '../../通用函数'
import CycleSimulatorContext from '../../../../context'
import './index.css'

const { 缓存映射 } = 获取当前数据()

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

  const { 秘籍信息, 起手Buff配置, 模拟DPS结果, 加速值, 网络延迟 } =
    useContext(CycleSimulatorContext)

  // 保存加速序列
  const [延迟选项, 设置延迟选项] = useState<number[]>([0, 1, 2])

  const [按档位计算, 设置按档位计算] = useState<boolean>(false)

  const [加速档位, 设置加速档位] = useState<number[]>([0, 1, 2])
  const [加速等级, 设置加速等级] = useState<string | undefined>(undefined)
  const [循环标识, 设置循环标识] = useState<string>()

  const dispatch = useAppDispatch()

  const 自定义循环列表 = useAppSelector((state) => state?.data?.自定义循环列表)

  useEffect(() => {
    // redux变动，更新storage信息
    const 保存信息 = {}
    ;(自定义循环列表 || []).forEach((item) => {
      保存信息[item.名称] = {
        ...item,
      }
    })
    try {
      localStorage?.setItem(缓存映射.自定义循环, JSON.stringify(保存信息))
    } catch (e) {
      // console.error('e', e)
      message.error('保存循环失败，疑似数据过大导致的浏览器内存溢出')
    }
  }, [自定义循环列表, 奇穴信息])

  useEffect(() => {
    if (!自定义循环保存弹窗) {
      设置循环标识(undefined)
      if (默认加速挡位) {
        设置加速等级(默认加速挡位)
      }
      // 设置加速等级(undefined)
      // 设置加速档位([0, 1, 2])
      // 设置延迟选项([0, 1, 2])
    }
  }, [自定义循环保存弹窗])

  const 保存自定义循环前 = () => {
    if (!循环标识) {
      message.error('请选择/输入循环标识')
      return
    }
    if (按档位计算) {
      if (!延迟选项?.length) {
        message.error('请选择要保存的加速档位')
        return
      }
    } else {
      if (!加速等级) {
        message.error('请选择要保存的加速等级')
        return
      }
      const 拆分加速等级 = 加速等级?.split(',')
      if (!areAllNumbers(拆分加速等级)) {
        message.error('请输入正确的加速等级')
        return
      }
    }
    确认保存循环()
  }

  const 获取待计算加速值 = () => {
    if (按档位计算) {
      const 获取全档位加速阈值 = 获取档位加速值()
      return 加速档位
        ?.filter((加速档位) => 获取全档位加速阈值?.[加速档位] !== undefined)
        .map((加速档位) => {
          return {
            计算加速等级: 获取全档位加速阈值?.[加速档位],
            保存数据: {
              循环加速等级: 加速档位,
            },
          }
        })
    } else {
      const 拆分加速等级 = 加速等级?.split(',') || []
      return 拆分加速等级?.map((基础加速等级, index) => {
        const 获取下一项加速等级 = 拆分加速等级?.[index + 1] || 99999
        return {
          计算加速等级: 基础加速等级,
          保存数据: {
            循环加速值范围: [基础加速等级, 获取下一项加速等级],
          },
        }
      })
    }
  }

  const 计算检验模拟器保存加速值 = (待计算加速值) => {
    let 加速数组 = 待计算加速值.map((a) => a.计算加速等级)?.filter((a) => 加速值 >= a)
    return Math.max(0, ...加速数组)
  }

  // 确认保存自定义循环
  const 确认保存循环 = () => {
    const 名称 = 循环标识 || ''

    // 获取各加速下 各网络延迟的循环
    const 各延迟枚举 = 延迟选项?.length ? 延迟选项 : [0, 1, 2, 3]
    const 待计算加速值 = 获取待计算加速值()
    const 保存循环结果: 循环详情[] = []
    const 异常结果: any[] = []

    // 对比模拟器当前加速值和延迟，有异常则提示
    const 检验模拟器保存加速值 = 计算检验模拟器保存加速值(待计算加速值)

    各延迟枚举.forEach((延迟) => {
      待计算加速值.forEach((加速信息) => {
        const 模拟结果 = 循环模拟({
          传入加速: Number(加速信息?.计算加速等级),
          传入延迟: Number(延迟),
          更新展示: false,
          奇穴: [...奇穴信息],
        })
        const 本次日志 = 模拟结果?.最终日志
        const 循环执行结果 = 模拟结果?.循环执行结果
        const 战斗秒 = 模拟结果?.当前时间 / 每秒郭氏帧
        const 用于计算循环 = 获取计算循环数据(本次日志, 模拟结果?.当前时间)
        if (检验模拟器保存加速值 === Number(加速信息?.计算加速等级) && Number(延迟) === 网络延迟) {
          if (战斗秒 !== 模拟DPS结果?.秒伤计算时间) {
            message.warning(
              <div style={{ textAlign: 'left' }}>
                <p>模拟器计算结果与当前模拟结果不一致</p>
                <p>请注意是否需要使用更相信的加速挡位保存</p>
                <p>
                  模拟器计算结果：{战斗秒}秒，加速值：{加速值}
                </p>
                <p>
                  当前模拟结果：{模拟DPS结果?.秒伤计算时间}秒，加速值：
                  {Number(加速信息?.计算加速等级)}
                </p>
              </div>,
              10,
            )
          }
        }
        if (循环执行结果 === '成功') {
          保存循环结果.push({
            ...加速信息?.保存数据,
            循环延迟要求: 延迟,
            战斗时间: 战斗秒,
            技能详情: 用于计算循环,
          })
        } else {
          异常结果.push({
            加速值: 加速信息?.计算加速等级,
            延迟,
          })
        }
      })
    })

    if (异常结果?.length) {
      message.error(
        `以下条件循环异常，将不会保存该加速的循环。异常循环：${异常结果
          .map((item) => {
            return `[加速：${item.加速值}，延迟：${item.延迟}]`
          })
          .join('、')}`,
      )
    }

    const 技能序列名称 = 生成实际技能序列(技能序列)

    const 档位细化列表 = 待计算加速值?.map((加速信息) => 加速信息?.计算加速等级)?.join('｜')

    const 保存循环对象: 循环数据 = {
      名称,
      标题: 名称,
      提供者: '模拟',
      备注: `循环加速档位细化为：${档位细化列表}`,
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
    } catch (e) {
      // console.error('e', e)
      message.success('保存循环失败，疑似数据过大导致的浏览器内存溢出')
    }
  }

  return (
    <Modal
      centered
      title='保存自定义循环'
      okButtonProps={{
        disabled: !循环标识,
      }}
      open={自定义循环保存弹窗}
      onCancel={() => 设置自定义循环保存弹窗(false)}
      onOk={保存自定义循环前}
      width={760}
      destroyOnClose
      className={'cycle-custom-save-modal'}
    >
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
            checked={按档位计算}
            onChange={(e) => 设置按档位计算(e)}
            checkedChildren='按加速档位保存'
            unCheckedChildren='按加速等级保存'
          />
        </p>
        {按档位计算 ? (
          <Checkbox.Group value={加速档位} onChange={(e) => 设置加速档位(e as number[])}>
            {Array.from({ length: 6 }, (v, i) => i).map((a) => {
              return (
                <Checkbox value={a} key={a}>
                  {a}段
                </Checkbox>
              )
            })}
          </Checkbox.Group>
        ) : (
          <Input
            value={加速等级}
            onChange={(e) => 设置加速等级(e?.target?.value)}
            className={'cycle-custom-cycle-input-numbers'}
            placeholder={'请输入要区分的加速等级，多个等级按英文逗号(,)区分，例:0,206,9232'}
          />
        )}
        <p>延迟</p>
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
      <Alert message={'选项越少保存越快。没选择的选项在外部计算dps时不会进行计算。'} />
    </Modal>
  )
}

export default 保存自定义循环弹窗

function areAllNumbers(arr) {
  return arr.every((item) => typeof +item === 'number' && !isNaN(+item))
}
