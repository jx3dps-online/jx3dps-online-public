import { Form, Input, message, Modal } from 'antd'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 更新当前自定义循环列表 } from '@/store/data'
import { 循环数据, 循环详情 } from '@/@types/循环'
import CycleSelect from '@/组件/CycleSelect'
import 秘籍选择 from '../../循环设置/循环详情弹窗/秘籍选择'

import './index.css'

const { 缓存映射 } = 获取当前数据()

interface 保存循环弹窗类型 {
  导入循环保存弹窗: boolean
  设置导入循环保存弹窗: (e: boolean) => void
  结果数据: 循环详情 | undefined
  目标心法: string
  奇穴数据: string[] | undefined
}

function 保存循环弹窗(props: 保存循环弹窗类型) {
  const { 导入循环保存弹窗, 设置导入循环保存弹窗, 结果数据, 目标心法, 奇穴数据 = [] } = props

  const 自定义循环列表 = useAppSelector((state) => state?.data?.自定义循环列表)
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 当前秘籍信息 = useAppSelector((state) => state?.data?.当前秘籍信息)

  const dispatch = useAppDispatch()

  const [form] = Form.useForm()

  useEffect(() => {
    if (导入循环保存弹窗) {
      form?.setFieldsValue({
        循环名称: undefined,
        循环标题: undefined,
        奇穴设置: 奇穴数据?.length ? 奇穴数据 : 当前奇穴信息,
        秘籍设置: 当前秘籍信息,
      })
    }
  }, [导入循环保存弹窗, 当前秘籍信息, 奇穴数据, 当前奇穴信息, 自定义循环列表, 目标心法, 结果数据])

  const 保存导入循环前 = () => {
    form?.validateFields()?.then((values) => {
      const 循环名称 = values?.循环名称
      const 保存循环: 循环数据 = {
        名称: values?.循环名称,
        标题: values?.循环标题 || values?.循环名称,
        类型: '自定义',
        标记: '导入',
        奇穴: values?.奇穴设置 || 奇穴数据 || 当前奇穴信息,
        秘籍: values?.秘籍设置 || 当前秘籍信息,
        循环详情: [结果数据 as any],
      }

      const 新自定义循环 = 自定义循环列表?.some((item) => item?.名称 === 循环名称)
        ? 自定义循环列表.map((item) => {
            return item.名称 === 循环名称 ? 保存循环 : item
          })
        : (自定义循环列表 || []).concat([保存循环])

      dispatch(更新当前自定义循环列表(新自定义循环))

      message.success('保存成功')
      设置导入循环保存弹窗(false)
    })
  }

  useEffect(() => {
    // redux变动，更新storage信息
    const 保存信息 = {}
    ;(自定义循环列表 || []).forEach((item) => {
      保存信息[item.名称] = {
        ...item,
      }
    })
    localStorage?.setItem(缓存映射.自定义循环, JSON.stringify(保存信息))
  }, [自定义循环列表])

  return (
    <Modal
      centered
      title='保存导入循环'
      open={导入循环保存弹窗}
      onCancel={() => 设置导入循环保存弹窗(false)}
      onOk={保存导入循环前}
      width={1000}
      destroyOnClose
      className={'jcl-import-cycle-save-modal'}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='循环名称'
          label='循环名称(唯一)'
          required
          rules={[{ required: true, message: '请创建/选择循环名称(唯一)' }]}
        >
          <CycleSelect />
        </Form.Item>
        <Form.Item name='循环标题' label='循环标题'>
          <Input maxLength={20} placeholder='请输入循环标题，不输入则默认为循环名称' />
        </Form.Item>
        <Form.Item
          name='秘籍设置'
          label={
            <div>
              <span>秘籍设置</span>
            </div>
          }
        >
          <秘籍选择 />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default 保存循环弹窗
