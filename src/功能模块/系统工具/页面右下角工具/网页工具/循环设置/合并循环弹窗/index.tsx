import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  ModalProps,
  Select,
  Tag,
  Tooltip,
} from 'antd'
import { 循环数据, 循环详情 } from '@/@types/循环'
import { v4 as uuidV4 } from 'uuid'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import useCycle from '@/hooks/use-cycle'
import { useAppDispatch, useAppSelector } from '@/hooks'

import styles from './index.module.less'
import { 延迟设定 } from '@/数据/常量'
import { 更新当前自定义循环列表 } from '@/store/data'
import { StarFilled } from '@ant-design/icons'

const { 默认数据: 心法默认数据 = {} } = 获取当前数据()

interface 循环详情弹窗类型 extends ModalProps {
  选中循环名称?: string[]
}

const 合并循环弹窗: React.FC<循环详情弹窗类型> = (props) => {
  const { 选中循环名称, open, onCancel } = props
  const [基底循环, 设置基底循环] = useState<循环数据>()
  const { 全部循环 = [] } = useCycle()

  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const 自定义循环列表 = useAppSelector((state) => state?.data?.自定义循环列表)

  const 实际循环 = useMemo(() => {
    return 全部循环?.filter((循环) => 选中循环名称?.includes(循环?.名称 || '')) || []
  }, [选中循环名称, 全部循环])

  const 循环全选 = (名称, 循环详情) => {
    form.setFieldValue(
      名称,
      循环详情?.map((_, index) => index),
    )
  }

  const 循环全取消 = (名称) => {
    form.setFieldValue(名称, [])
  }

  const 保存循环 = () => {
    if (!基底循环) {
      message.error('请选择基底循环')
      return
    }
    form.validateFields()?.then((values) => {
      console.log('values', values)
      let 最终循环: 循环详情[] = []
      let 重复循环: any = []
      Object.keys(values)?.forEach((循环名称) => {
        if (values[循环名称]?.length) {
          const 循环数据 = 全部循环?.find((a) => a?.名称 === 循环名称)
          const 循环详情 = 循环数据?.循环详情 || []
          const 选中详情 = values[循环名称]?.map((index) => 循环详情?.[index])
          选中详情.forEach((循环) => {
            if (
              循环?.循环加速等级 !== undefined &&
              最终循环?.some(
                (a) =>
                  a?.循环加速等级 === 循环?.循环加速等级 && a?.循环延迟要求 === 循环?.循环延迟要求,
              )
            ) {
              重复循环.push(
                `${循环数据?.标题 || 循环数据?.名称}_加速等级: ${循环?.循环加速等级}；延迟要求: ${循环?.循环延迟要求}`,
              )
            } else if (
              循环?.循环加速等级?.length &&
              最终循环?.some(
                (a) =>
                  a?.循环加速值范围?.[0] === 循环?.循环加速等级?.[0] &&
                  a?.循环延迟要求 === 循环?.循环延迟要求,
              )
            ) {
              重复循环.push(
                `${循环数据?.标题 || 循环数据?.名称}_加速范围: ${循环?.循环加速值范围?.[0]}；延迟要求: ${循环?.循环延迟要求}`,
              )
            } else {
              最终循环 = [...最终循环, 循环]
            }
          })
        }
      })

      if (重复循环?.length) {
        message.error(`存在重复的循环，请检查！${重复循环?.join('；')}`)
      } else if (最终循环?.length) {
        const 导出循环: 循环数据 = {
          ...基底循环,
          名称: `${基底循环?.名称}_${new Date().valueOf()}_合并`,
          标题: `${基底循环?.标题}_合并`,
          循环详情: 最终循环,
        }
        const 新自定义循环 = [...自定义循环列表, 导出循环]
        dispatch(更新当前自定义循环列表(新自定义循环))
        message.success(`循环已保存，名称：${`${基底循环}_合并`}`)
        onCancel?.({} as any)
      } else {
        message.error('请至少选择一个循环详细挡位')
      }
    })
  }

  return (
    <Modal
      className='cycle-edit-modal'
      open={open}
      onCancel={onCancel}
      width={1114}
      title={'合并循环'}
      maskClosable={false}
      centered
      onOk={保存循环}
    >
      <Alert message={'本弹窗用于合并多个循环的不同加速/延迟数据，导出为一个新循环'} />
      <Form form={form}>
        {实际循环?.map((循环) => {
          const 是否是基底循环 = 基底循环?.名称 === 循环?.名称
          return (
            <div key={`合并循环_${循环?.名称}`} className={`${styles.cycle}`}>
              <div className={styles.cycleTitle}>
                <div className={styles.cycleTitleWrap}>
                  {循环?.标题 || 循环?.名称}
                  {是否是基底循环 ? (
                    <>
                      <Tag color='red' style={{ marginLeft: 12 }}>
                        基底循环
                      </Tag>
                      <StarFilled className={styles.cycleTitleIcon} />
                      <StarFilled className={styles.cycleTitleIcon} />
                      <StarFilled className={styles.cycleTitleIcon} />
                      <StarFilled className={styles.cycleTitleIcon} />
                      <StarFilled className={styles.cycleTitleIcon} />
                    </>
                  ) : null}
                </div>
                <div>
                  {是否是基底循环 ? null : (
                    <Tooltip title={'基底循环：除了循环计算数据的其他一切信息采用该循环'}>
                      <Button danger size='small' onClick={() => 设置基底循环(循环)} type='primary'>
                        标记为基底
                      </Button>
                    </Tooltip>
                  )}
                  <Button
                    size='small'
                    onClick={() => 循环全选(循环?.名称, 循环?.循环详情)}
                    type='primary'
                    style={{ marginLeft: 12 }}
                  >
                    全选
                  </Button>
                  <Button
                    size='small'
                    onClick={() => 循环全取消(循环?.名称)}
                    style={{ marginLeft: 12 }}
                  >
                    取消
                  </Button>
                </div>
              </div>
              <Form.Item name={循环.名称} style={{ margin: 0 }}>
                <Checkbox.Group className={styles.checkboxGroup}>
                  {循环?.循环详情?.map((循环详情, index) => {
                    return (
                      <Checkbox className={styles.checkbox} value={index}>
                        {循环详情?.循环加速值范围?.length ? (
                          <span className={styles.wrap}>
                            <span className={styles.title}>加速范围：</span>
                            <span className={styles.value}>
                              {循环详情?.循环加速值范围?.[0]} ~ {循环详情?.循环加速值范围?.[1]}
                            </span>
                          </span>
                        ) : (
                          <span className={styles.wrap}>
                            <span className={styles.title}>加速等级：</span>

                            <span className={styles.value}>
                              <span
                                className={`${styles.tag} ${styles[`tag_${循环详情?.循环加速等级}`]}`}
                              >
                                {循环详情?.循环加速等级}
                              </span>
                              <span className={styles.subText}>段加速</span>
                            </span>
                          </span>
                        )}
                        {循环详情?.循环延迟要求 !== undefined ? (
                          <span className={styles.wrap}>
                            <span className={styles.title}>延迟要求：</span>
                            <span className={styles.value}>
                              <span
                                className={`${styles.tag} ${styles[`tag_${循环详情?.循环延迟要求}`]}`}
                              >
                                {循环详情?.循环延迟要求}
                              </span>
                              <span className={styles.subText}>
                                {延迟设定?.find((a) => a?.value === 循环详情?.循环延迟要求)?.label}
                              </span>
                            </span>
                          </span>
                        ) : null}
                      </Checkbox>
                    )
                  })}
                </Checkbox.Group>
              </Form.Item>
            </div>
          )
        })}
      </Form>
    </Modal>
  )
}

export default React.memo(合并循环弹窗)
