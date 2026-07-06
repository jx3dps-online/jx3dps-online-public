import React, { useEffect, useState } from 'react'
import { Button, Collapse, Form, InputNumber, Modal, ModalProps, Select, Tooltip } from 'antd'
import { 循环技能详情, 循环详情 } from '@/@types/循环'

import { 延迟设定 } from '@/数据/常量'
import { 按数字生成数组 } from '@/工具函数/help'
import { QuestionCircleOutlined } from '@ant-design/icons'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import './index.css'
import { 技能基础数据模型 } from '@/@types/技能'

const { 技能系数 } = 获取当前数据()

interface 循环详情配置弹窗类型 extends ModalProps {
  数据?: 循环详情
}

const 循环详情配置弹窗: React.FC<循环详情配置弹窗类型> = (props) => {
  const { 数据: 默认数据, open, onCancel } = props
  const [form] = Form.useForm()
  const [循环详情列表, 设置循环详情列表] = useState<循环技能详情[]>([])

  useEffect(() => {
    if (open) {
      form?.setFieldsValue({
        ...默认数据,
      })
      设置循环详情列表(默认数据?.技能详情 || [])
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

  // const 删除技能 = (index) => {
  //   const 新数据 = [...循环详情列表]?.filter((_, i) => i !== index)
  //   设置循环详情列表(新数据)
  // }

  return (
    <Modal
      className='cycle-edit-modal'
      open={open}
      onCancel={onCancel}
      width={1114}
      title={'循环组详情'}
      maskClosable={false}
      centered
      onOk={onCancel}
    >
      <div className='cycle-edit'>
        <Form className='cycle-form' layout='vertical' form={form} requiredMark='optional'>
          <Form.Item
            className='cycle-edit-item'
            label='战斗时间'
            name='战斗时间'
            rules={[{ required: true, message: '请输入战斗时间' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder='请输入战斗时间'
              max={1000}
              min={1}
              suffix={'秒'}
            />
          </Form.Item>
          <Form.Item
            className='cycle-edit-item'
            label={
              <span>
                延迟要求
                <Tooltip
                  title={
                    <div>
                      <p>该功能为区分同一循环内多个循环组</p>
                      <p>如果你的循环内只有一组循环技能，你无需设置此项</p>
                    </div>
                  }
                >
                  <QuestionCircleOutlined className='cycle-edit-title-tip' />
                </Tooltip>
              </span>
            }
            name='循环延迟要求'
          >
            <Select placeholder='请选择延迟要求' options={延迟设定} />
          </Form.Item>
          <Form.Item
            className='cycle-edit-item'
            label={
              <span>
                加速要求
                <Tooltip
                  title={
                    <div>
                      <p>该功能为区分同一循环内多个循环组</p>
                      <p>如果你的循环内只有一组循环技能，你无需设置此项</p>
                    </div>
                  }
                >
                  <QuestionCircleOutlined className='cycle-edit-title-tip' />
                </Tooltip>
              </span>
            }
            name='循环延迟要求'
          >
            <Select
              placeholder='请选择延迟要求'
              options={按数字生成数组(6)?.map((item) => {
                return { label: `${item - 1}段加速`, value: item - 1 }
              })}
            />
          </Form.Item>
        </Form>
        <div>
          <h1 className='cycle-skills-title'>技能详情</h1>
          <Button type='dashed' block style={{ marginBottom: 12 }}>
            添加技能
          </Button>
          <Collapse className='cycle-skills-collapse'>
            {循环详情列表?.map((item, index) => {
              const 当前技能数据 = 技能系数?.find((技能) => 技能?.技能名称 === item?.技能名称)
              const 最大技能等级 = 获取最大技能等级(当前技能数据)
              return 当前技能数据 ? (
                <Collapse.Panel
                  header={
                    <div>
                      <span className='cycle-skill-data-span'>
                        <Select
                          style={{ width: 200 }}
                          value={item?.技能名称}
                          size='small'
                          showSearch
                          onClick={(e) => e?.stopPropagation()}
                        >
                          {技能系数?.map((技能) => {
                            return (
                              <Select.Option key={技能?.技能名称} value={技能?.技能名称}>
                                {技能?.技能名称} {技能?.技能ID || ''}
                              </Select.Option>
                            )
                          })}
                        </Select>
                      </span>
                      <span className='cycle-skill-data-span'>
                        <span className='cycle-skill-data-label'>伤害层数</span>
                        <Select
                          style={{ width: 100 }}
                          value={item?.伤害层数 || 1}
                          size='small'
                          showSearch
                          onClick={(e) => e?.stopPropagation()}
                          options={按数字生成数组(20)?.map((item) => ({
                            value: item,
                            label: item,
                          }))}
                        />
                      </span>
                      <span className='cycle-skill-data-span'>
                        <span className='cycle-skill-data-label'>技能数量</span>
                        <InputNumber
                          style={{ width: 100 }}
                          value={item?.技能数量}
                          size='small'
                          onClick={(e) => e?.stopPropagation()}
                        />
                      </span>
                      {最大技能等级 > 1 ? (
                        <span className='cycle-skill-data-span'>
                          <span className='cycle-skill-data-label'>技能等级</span>
                          <Select
                            style={{ width: 100 }}
                            value={item?.技能等级 || 1}
                            size='small'
                            showSearch
                            onClick={(e) => e?.stopPropagation()}
                            options={按数字生成数组(最大技能等级)?.map((item) => ({
                              value: item,
                              label: item,
                            }))}
                          />
                        </span>
                      ) : null}
                    </div>
                  }
                  key={index}
                >
                  <div className='cycle-skill-data-zengyi-wrap'>
                    {item?.技能增益列表?.map((增益, i) => {
                      return (
                        <div
                          className='cycle-skill-data-zengyi-line'
                          key={`${item?.技能名称}${item?.技能等级 || 1}${i}`}
                        >
                          <span>{增益?.增益名称}</span>
                          <span>{增益?.增益技能数}</span>
                        </div>
                      )
                    })}
                  </div>
                </Collapse.Panel>
              ) : null
            })}
          </Collapse>
        </div>
      </div>
    </Modal>
  )
}

export default 循环详情配置弹窗

const 获取最大技能等级 = (当前技能数据?: 技能基础数据模型): number => {
  let 最大技能等级 = 1
  if (当前技能数据?.技能等级数据) {
    Object.keys(当前技能数据?.技能等级数据)?.forEach((key) => {
      if (key?.includes(',')) {
        const list = key?.split(',')
        list.forEach((a) => {
          if (+a > 最大技能等级) {
            最大技能等级 = +a
          }
        })
      } else {
        if (+key > 最大技能等级) {
          最大技能等级 = +key
        }
      }
    })
  }
  return 最大技能等级
}
