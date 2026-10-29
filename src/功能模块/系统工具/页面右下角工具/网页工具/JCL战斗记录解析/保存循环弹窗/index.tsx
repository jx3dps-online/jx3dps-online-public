import { Button, Form, Input, InputNumber, message, Modal, Select, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 更新当前自定义循环列表, 更新角色数据 } from '@/store/data'
import { 循环数据, 循环详情 } from '@/@types/循环'
import type { 选中秘籍信息 } from '@/@types/秘籍'
import CycleSelect from '@/组件/CycleSelect'
import 奇穴选择 from '@/组件/奇穴选择'
import 秘籍选择 from '../../循环设置/循环详情弹窗/秘籍选择'
import 秘籍选择抽屉 from '@/功能模块/基础设置/公用设置/秘籍选择/drawer'
import { 获取档位加速值 } from '@/工具函数/data'
import { 触发秒伤计算 } from '@/计算模块/计算函数'

import './index.css'

interface 保存循环弹窗类型 {
  导入循环保存弹窗: boolean
  设置导入循环保存弹窗: (e: boolean) => void
  结果数据: 循环详情 | undefined
  目标心法: string
  原始数据: string | undefined
}

function 保存循环弹窗(props: 保存循环弹窗类型) {
  const { 缓存映射 } = use心法数据()
  const { 导入循环保存弹窗, 设置导入循环保存弹窗, 结果数据, 目标心法 } = props

  const 自定义循环列表 = useAppSelector((state) => state?.data?.自定义循环列表)
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 当前计算循环名称 = useAppSelector((state) => state.data.当前计算循环名称)
  const 当前秘籍信息 = useAppSelector((state) => state?.data?.当前秘籍信息)

  const dispatch = useAppDispatch()

  const [form] = Form.useForm()
  const [秘籍设置打开, 设置秘籍设置打开] = useState(false)
  const 保存秘籍信息 = Form.useWatch('秘籍设置', form)
  const 加速限制方式 = Form.useWatch('加速限制方式', form)
  const 常见加速档位 = Object.entries(获取档位加速值()).map(([段位, 加速值]) => ({
    加速值,
    加速档位: Number(段位),
  }))

  useEffect(() => {
    if (导入循环保存弹窗) {
      设置秘籍设置打开(false)
      form?.setFieldsValue({
        循环名称: undefined,
        循环标题: undefined,
        提供者: undefined,
        加速限制方式: '手动输入',
        限制加速: undefined,
        加速下限: undefined,
        加速上限: undefined,
        奇穴设置: 当前奇穴信息,
        秘籍设置: 当前秘籍信息,
      })
    }
  }, [导入循环保存弹窗, 当前秘籍信息, 当前奇穴信息, 自定义循环列表, 目标心法, 结果数据])

  const 保存导入循环前 = () => {
    form?.validateFields()?.then((values) => {
      const 循环名称 = values?.循环名称
      const 限制加速 = values.限制加速
      const 按段位限制 = values.加速限制方式 === '常见段位'
      const 启用加速限制 = 按段位限制
        ? 限制加速 !== undefined && 限制加速 !== null
        : values.加速下限 != null || values.加速上限 != null
      const 下一档位 = 常见加速档位.find((档位) => 档位.加速值 > 限制加速)
      const 保存循环: 循环数据 = {
        名称: values?.循环名称,
        标题: values?.循环标题 || values?.循环名称,
        类型: '自定义',
        标记: '导入',
        提供者: values.提供者,
        强制加速要求: 启用加速限制,
        奇穴: values?.奇穴设置 || 当前奇穴信息,
        秘籍: values?.秘籍设置 || 当前秘籍信息,
        循环详情: [
          {
            ...结果数据!,
            循环加速等级: undefined,
            循环加速值范围: 启用加速限制
              ? 按段位限制
                ? [限制加速, 下一档位?.加速值 ?? 99999]
                : [values.加速下限 ?? 0, values.加速上限 ?? 99999]
              : undefined,
          },
        ],
      }

      const 新自定义循环 = 自定义循环列表?.some((item) => item?.名称 === 循环名称)
        ? 自定义循环列表.map((item) => {
            return item.名称 === 循环名称 ? 保存循环 : item
          })
        : (自定义循环列表 || []).concat([保存循环])

      dispatch(更新当前自定义循环列表(新自定义循环))
      if (循环名称 === 当前计算循环名称) {
        dispatch(更新角色数据({ 属性: '当前奇穴信息', 数据: 保存循环.奇穴 }))
        dispatch(更新角色数据({ 属性: '当前秘籍信息', 数据: 保存循环.秘籍 }))
        dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
      }

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
  }, [自定义循环列表, 缓存映射])

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
        <Form.Item name='提供者' label='提供者'>
          <Input placeholder='请输入循环提供者' />
        </Form.Item>
        <Form.Item name='加速限制方式' label='限制加速方式'>
          <Select
            options={[
              { label: '输入加速区间', value: '手动输入' },
              { label: '常见段位', value: '常见段位' },
            ]}
            onChange={() =>
              form.setFieldsValue({ 限制加速: undefined, 加速下限: undefined, 加速上限: undefined })
            }
          />
        </Form.Item>
        {加速限制方式 === '常见段位' ? (
          <Form.Item name='限制加速' label='限制加速' extra='限制在所选加速段位区间内，留空不限制'>
            <Select
              allowClear
              placeholder='请选择本心法的加速段位'
              options={常见加速档位.map((档位) => ({
                value: 档位.加速值,
                label: `${档位.加速档位}段（${档位.加速值}）`,
              }))}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label='限制加速'
            extra='含下限、不含上限；两项留空不限制，单项留空按下限 0 或上限 99999 保存'
          >
            <Space>
              <Form.Item name='加速下限' noStyle>
                <InputNumber min={0} precision={0} placeholder='加速下限' />
              </Form.Item>
              <span>至</span>
              <Form.Item name='加速上限' noStyle>
                <InputNumber min={0} precision={0} placeholder='加速上限' />
              </Form.Item>
            </Space>
          </Form.Item>
        )}
        <Form.Item
          name='秘籍设置'
          label={
            <div>
              <span>秘籍设置</span>
              <Button type='link' onClick={() => 设置秘籍设置打开(true)}>
                设置秘籍
              </Button>
            </div>
          }
        >
          <秘籍选择 />
        </Form.Item>
        <Form.Item
          name='奇穴设置'
          label={
            <div>
              <span>奇穴设置</span>
              <span style={{ color: 'red', marginLeft: 8, fontSize: 12 }}>
                因该解析方式无法获取奇穴，需重新手动选择
              </span>
            </div>
          }
        >
          <奇穴选择 />
        </Form.Item>
        {/* <Form.Item name='快照设置' label={'快照设置'}>
          <Checkbox.Group>
            {快照类型数据
              ?.filter((item) => {
                if (item === '含章挺秀阵') {
                  return 目标心法 === '周天功'
                }
                return true
              })
              ?.map((item) => {
                return (
                  <Checkbox key={`快照${item}`} value={item}>
                    {item}
                  </Checkbox>
                )
              })}
          </Checkbox.Group>
        </Form.Item> */}
      </Form>
      <秘籍选择抽屉
        value={保存秘籍信息 || {}}
        onChange={(秘籍信息: 选中秘籍信息) => form.setFieldsValue({ 秘籍设置: 秘籍信息 })}
        open={导入循环保存弹窗 && 秘籍设置打开}
        onClose={() => 设置秘籍设置打开(false)}
      />
    </Modal>
  )
}

export default 保存循环弹窗
