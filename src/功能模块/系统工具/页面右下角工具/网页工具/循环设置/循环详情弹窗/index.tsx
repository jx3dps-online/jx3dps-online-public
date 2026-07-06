import React, { useEffect, useState } from 'react'
import { Form, Input, Modal, ModalProps, Select } from 'antd'
import { 循环数据, 循环详情 } from '@/@types/循环'
import { v4 as uuidV4 } from 'uuid'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { useAppSelector } from '@/hooks'
import { ReactSortable } from 'react-sortablejs'

import 秘籍选择 from './秘籍选择'
import 奇穴选择 from './奇穴选择'
import 循环详情配置 from './循环详情'
import 循环详情配置弹窗 from './循环详情配置弹窗'

import './index.css'

const { 默认数据: 心法默认数据 = {} } = 获取当前数据()

interface 循环详情弹窗类型 extends ModalProps {
  数据?: 循环数据
}

const 循环详情弹窗: React.FC<循环详情弹窗类型> = (props) => {
  const { 数据: 默认数据, open, onCancel } = props
  const [form] = Form.useForm()
  const [数据, 设置数据] = useState<循环数据 | undefined>()
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const [循环详情列表, 设置循环详情列表] = useState<循环详情[]>([])

  const [编辑循环组弹窗, 设置编辑循环组弹窗] = useState<{
    open: boolean
    data?: 循环详情
    index?: number
  }>({ open: false })

  useEffect(() => {
    if (open) {
      设置数据(默认数据)
      form?.setFieldsValue({
        ...默认数据,
        奇穴: 默认数据?.奇穴 || 当前奇穴信息,
        秘籍: 默认数据?.秘籍 || 心法默认数据?.秘籍,
      })
      设置循环详情列表(
        (默认数据?.循环详情 || []).map((item) => {
          return {
            ...item,
            id: uuidV4(),
          }
        }),
      )
    } else {
      form?.resetFields()
      设置循环详情列表([])
    }
  }, [open])

  // const 提交数据 = () => {
  //   form?.validateFields()?.then(() => {
  //     return
  //   })
  // }

  const 删除循环组 = (index) => {
    const 新数据 = [...循环详情列表]?.filter((_, i) => i !== index)
    设置循环详情列表(新数据)
  }

  return (
    <Modal
      className='cycle-edit-modal'
      open={open}
      onCancel={onCancel}
      width={1114}
      title={数据 ? '编辑循环' : '新增循环'}
      maskClosable={false}
      centered
      onOk={onCancel}
    >
      <div className='cycle-edit'>
        <Form className='cycle-form' layout='vertical' form={form} requiredMark='optional'>
          <Form.Item
            className='cycle-edit-item'
            label='循环标识'
            name='名称'
            rules={[{ required: true, message: '请输入循环标识' }]}
          >
            <Input placeholder='请输入循环标识' allowClear maxLength={10} />
          </Form.Item>
          <Form.Item
            className='cycle-edit-item'
            name='标题'
            label='循环标题'
            rules={[{ required: true, message: '请输入循环标题' }]}
          >
            <Input placeholder='请输入循环标题' allowClear maxLength={10} />
          </Form.Item>
          <Form.Item
            className='cycle-edit-item'
            label='提供者'
            name='提供者'
            rules={[{ required: true, message: '请输入提供者' }]}
            style={{ marginRight: 400 }}
          >
            <Input placeholder='请输入提供者' allowClear maxLength={10} />
          </Form.Item>
          <Form.Item className='cycle-edit-item' label='备注' name='备注'>
            <Input placeholder='请输入备注' allowClear maxLength={50} />
          </Form.Item>
          <Form.Item className='cycle-edit-item' label='类型' name='类型'>
            <Select
              placeholder='请选择类型'
              options={[
                { label: '默认', value: '默认' },
                { label: '自定义', value: '自定义' },
              ]}
            />
          </Form.Item>
          <Form.Item className='cycle-edit-item' label='标记' name='标记'>
            <Select
              placeholder='请选择标记'
              options={[
                { label: '紫武', value: '紫武' },
                { label: '橙武', value: '橙武' },
              ]}
            />
          </Form.Item>
          {/* <Form.Item
            className='cycle-edit-item'
            label='快照计算'
            name='快照计算'
            style={{ width: 400 }}
          >
            <Select
              mode='multiple'
              maxTagCount='responsive'
              placeholder='请选择快照计算'
              allowClear
              options={[
                { label: '伤腰', value: '大附魔_伤腰' },
                { label: '水特效', value: '水特效' },
                { label: '风特效', value: '风特效' },
                { label: '套装双会', value: '套装会心会效' },
              ]}
            />
          </Form.Item> */}
          <Form.Item className='cycle-edit-item' label='秘籍' name='秘籍' style={{ width: '100%' }}>
            <秘籍选择 />
          </Form.Item>
          <Form.Item
            className='cycle-edit-item'
            label='奇穴'
            name='奇穴'
            style={{ width: '100%' }}
            rules={[{ required: true, message: '请输入提供者' }]}
          >
            <奇穴选择 />
          </Form.Item>
          <Form.Item
            className='cycle-edit-item'
            label={
              <span>
                循环详情
                {/* <a
                  style={{ marginLeft: 12 }}
                  onClick={() => {
                    设置编辑循环组弹窗({ open: true })
                  }}
                >
                  添加
                </a> */}
              </span>
            }
            name='循环详情'
            style={{ width: '100%' }}
            rules={[{ required: true, message: '请录入循环详情' }]}
          >
            {循环详情列表?.length ? (
              <ReactSortable
                list={循环详情列表 as any}
                setList={(newList) => 设置循环详情列表(newList as any)}
                animation={150}
              >
                {循环详情列表?.map((item, index) => {
                  return (
                    <循环详情配置
                      data={item}
                      key={`循环详情_${index}`}
                      onDelete={() => 删除循环组(index)}
                      onEdit={() =>
                        设置编辑循环组弹窗({
                          open: true,
                          data: item,
                          index: index,
                        })
                      }
                    />
                  )
                })}
              </ReactSortable>
            ) : (
              <p className='cycle-edit-item-cycle-empty'>当前无循环组</p>
            )}
          </Form.Item>
        </Form>
      </div>
      <循环详情配置弹窗
        open={编辑循环组弹窗?.open}
        数据={编辑循环组弹窗?.data}
        onCancel={() =>
          设置编辑循环组弹窗({
            open: false,
          })
        }
      />
    </Modal>
  )
}

export default 循环详情弹窗
