import React, { useEffect, useState } from 'react'
import { Input, Modal, message } from 'antd'
import { useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import type { 装备信息数据类型 } from '@/@types/装备'
import type { 配装循环 } from '@/角色/类型'
import { 提取配装循环, 登阶循环限制 } from '../../领域/循环'
import { 获取文案, 填充文案 } from '../../文案'
import 登阶循环选择 from '../循环选择/index'

const 取角色图标 = (心法: string) => (心法数据 as any)?.[心法]?.系统配置?.心法图标 || ''

interface 新建目标弹窗属性 {
  open: boolean
  onClose: () => void
  创建目标: (名称: string, 循环: 配装循环 | undefined, 装备: 装备信息数据类型) => void
}

/** 新建目标：先命名与选循环，创建入池后进入配装器编辑。 */
export default function 新建目标弹窗({ open, onClose, 创建目标 }: 新建目标弹窗属性) {
  const { 名称: 心法, 计算循环 } = use心法数据()
  const 文案 = 获取文案(心法)
  const 数据 = useAppSelector((state) => state.data)
  const 当前角色 = 数据.当前角色
  const [名称, 设置名称] = useState('')
  const [循环, 设置循环] = useState<配装循环>()
  const [名称错误, 设置名称错误] = useState('')

  useEffect(() => {
    if (open) {
      const 默认名 = 当前角色?.名称
        ? 填充文案(文案['新建目标.默认名'], { 角色: 当前角色.名称 })
        : 文案['新建目标.默认名.无角色']
      设置名称(默认名.slice(0, 40))
      设置循环(提取配装循环(数据))
      设置名称错误('')
    }
  }, [open])

  const 提交 = () => {
    const 名称值 = 名称.trim()
    if (!名称值 || 名称值.length > 40) {
      设置名称错误(文案['通用.名称校验'])
      return
    }
    try {
      const 原因 = 登阶循环限制(
        数据.装备信息,
        [...计算循环, ...数据.自定义循环列表].find((项) => 项.名称 === 循环?.名称),
        文案,
      )
      if (原因) throw new Error(原因)
      创建目标(名称值, 循环, 数据.装备信息)
      onClose()
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : 文案['新建目标.错误.创建'])
    }
  }

  return (
    <Modal
      className='guide-new-goal-modal'
      title={文案['新建目标.标题']}
      open={open}
      onCancel={onClose}
      onOk={提交}
      okText={文案['新建目标.按钮.创建']}
      cancelText={文案['通用.取消']}
      width={440}
      okButtonProps={{ danger: true }}
    >
      {当前角色 ? (
        <div className='dragon-new-goal-role'>
          {取角色图标(当前角色.心法) ? (
            <img className='dragon-new-goal-role-avatar' src={取角色图标(当前角色.心法)} alt='' />
          ) : null}
          <span className='dragon-new-goal-role-name'>{当前角色.名称}</span>
          <span className='dragon-new-goal-role-server'>
            {当前角色.区服 || 文案['新建目标.区服.未设置']}
          </span>
        </div>
      ) : null}
      <label htmlFor='dragon-new-goal-name' style={{ display: 'block', marginBottom: 8 }}>
        {文案['新建目标.标签.目标名称']}
      </label>
      <Input
        id='dragon-new-goal-name'
        autoFocus
        value={名称}
        onChange={(事件) => {
          设置名称(事件.target.value)
          设置名称错误('')
        }}
        maxLength={40}
        showCount
        status={名称错误 ? 'error' : undefined}
        placeholder={文案['新建目标.占位.名称']}
        onPressEnter={提交}
      />
      {名称错误 && (
        <p className='dragon-manager-field-error' role='alert'>
          {名称错误}
        </p>
      )}
      <div style={{ marginTop: 12 }}>
        <登阶循环选择 装备={数据.装备信息} value={循环} onChange={设置循环} />
      </div>
    </Modal>
  )
}
