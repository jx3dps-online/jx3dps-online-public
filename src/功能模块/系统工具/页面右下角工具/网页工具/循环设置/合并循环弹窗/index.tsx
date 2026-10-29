import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Form,
  message,
  Modal,
  ModalProps,
  Radio,
  Switch,
  Tag,
  Tooltip,
} from 'antd'
import useCycle from '@/hooks/use-cycle'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 延迟设定 } from '@/数据/常量'
import { 更新当前自定义循环列表 } from '@/store/data'
import { 排序循环详情, 生成合并循环, 选择同档位高秒伤 } from './工具函数'
import type { 排序方式, 循环选择 } from './工具函数'
import styles from './index.module.less'

interface 循环详情弹窗类型 extends ModalProps {
  选中循环名称?: string[]
}

const 合并循环弹窗: React.FC<循环详情弹窗类型> = (props) => {
  const { 选中循环名称, open, onCancel } = props
  const [基底名称, 设置基底名称] = useState<string>()
  const [排序, 设置排序] = useState<排序方式>('延迟')
  const [合并技能序列, 设置合并技能序列] = useState(false)
  const { 全部循环 } = useCycle()
  const [form] = Form.useForm<循环选择>()
  const dispatch = useAppDispatch()
  const 自定义循环列表 = useAppSelector((state) => state.data.自定义循环列表)
  const 实际循环 = 全部循环.filter((循环) => 选中循环名称?.includes(循环.名称))
  const 基底循环 = 实际循环.find((循环) => 循环.名称 === 基底名称) || 实际循环[0]

  useEffect(() => {
    if (open) {
      设置基底名称(undefined)
      设置排序('延迟')
      设置合并技能序列(false)
      form.resetFields()
    }
  }, [open, form])

  const 自动选择同档位高秒伤 = () => {
    const { 选中索引, 未保存秒伤数量, 匹配档位数量 } = 选择同档位高秒伤(实际循环)
    if (!匹配档位数量) {
      message.warning('所选循环没有模拟器快照秒伤，无法自动选择；请重新保存循环')
      return
    }
    实际循环.forEach((循环) => form.setFieldValue(循环.名称, 选中索引[循环.名称]))
    if (未保存秒伤数量) {
      message.warning(`有 ${未保存秒伤数量} 个档位没有模拟器快照秒伤，已跳过`)
    }
  }

  const 保存循环 = (选中索引: 循环选择) => {
    if (!基底循环) {
      message.error('请选择基底循环')
      return
    }
    const 结果 = 生成合并循环(实际循环, 基底循环, 选中索引, 合并技能序列)
    if ('错误' in 结果) {
      message.error(结果.错误)
      return
    }
    dispatch(更新当前自定义循环列表([...自定义循环列表, 结果.数据]))
    if (结果.缺少序列.length) {
      message.warning(`以下循环未保存技能序列，已仅合并档位：${结果.缺少序列.join('、')}`)
    }
    if (结果.加速范围调整.length) {
      const 调整说明 = 结果.加速范围调整
        .map(
          (项) =>
            `${项.延迟 === '未限定延迟' ? 项.延迟 : `延迟 ${项.延迟}`}：${项.原范围[0]} ~ ${项.原范围[1]} → ${项.新范围[0]} ~ ${项.新范围[1]}`,
        )
        .join('；')
      message.warning(`已自动收窄同延迟下重叠的加速范围：${调整说明}`)
    }
    message.success(`循环已保存，名称：${结果.数据.标题}`)
    onCancel?.({} as any)
  }

  return (
    <Modal
      className={styles.弹窗}
      open={open}
      onCancel={onCancel}
      width={1114}
      title='合并循环'
      maskClosable={false}
      centered
      okText='保存合并循环'
      onOk={() => form.submit()}
      okButtonProps={{ disabled: !实际循环.length }}
    >
      <div className={styles.工具栏}>
        <p className={styles.说明}>选择不同加速、延迟的档位，保存为一个新循环。</p>
        <div className={styles.操作行}>
          <Radio.Group
            size='small'
            value={排序}
            onChange={(事件) => 设置排序(事件.target.value)}
            optionType='button'
            options={[
              { label: '按延迟排序', value: '延迟' },
              { label: '按加速排序', value: '加速' },
            ]}
          />
          <Tooltip title='比较保存时的模拟器快照秒伤，每个加速、延迟档位选择最高的一项'>
            <Button size='small' onClick={自动选择同档位高秒伤}>
              自动选择同档位高秒伤
            </Button>
          </Tooltip>
          <label className={styles.序列开关}>
            <Switch size='small' checked={合并技能序列} onChange={设置合并技能序列} />
            合并技能序列
          </label>
        </div>
        <p className={styles.提示}>
          {合并技能序列
            ? '将已选档位所属循环的技能序列合并为多挡位序列，以循环标题或名称命名；已有多挡位序列保留原名称。'
            : '奇穴、秘籍等配置及技能序列沿用基底循环；开启“合并技能序列”可同时保存多个循环的序列。'}
        </p>
      </div>
      <Form form={form} preserve={false} onFinish={保存循环} className={styles.循环列表}>
        {实际循环.map((循环) => {
          const 是否基底 = 基底循环?.名称 === 循环.名称
          return (
            <section key={循环.名称} className={styles.循环}>
              <div className={styles.循环头部}>
                <div className={styles.循环标题}>
                  <span>{循环.标题 || 循环.名称}</span>
                  {是否基底 && <Tag color='blue'>基底循环</Tag>}
                  <span className={styles.档位数量}>{循环.循环详情.length} 个档位</span>
                </div>
                <div className={styles.循环操作}>
                  {!是否基底 && (
                    <Tooltip title='奇穴、秘籍等基础配置沿用此循环'>
                      <Button size='small' onClick={() => 设置基底名称(循环.名称)}>
                        设为基底
                      </Button>
                    </Tooltip>
                  )}
                  <Button
                    size='small'
                    type='text'
                    onClick={() =>
                      form.setFieldValue(
                        循环.名称,
                        循环.循环详情.map((_, 索引) => 索引),
                      )
                    }
                  >
                    全选
                  </Button>
                  <Button
                    size='small'
                    type='text'
                    onClick={() => form.setFieldValue(循环.名称, [])}
                  >
                    取消选择
                  </Button>
                </div>
              </div>
              <Form.Item name={循环.名称} className={styles.循环选项}>
                <Checkbox.Group className={styles.档位列表}>
                  {排序循环详情(循环.循环详情, 排序).map(({ 详情, 索引 }) => (
                    <Checkbox key={索引} className={styles.档位} value={索引}>
                      <span className={styles.档位内容}>
                        <span className={styles.档位参数}>
                          <span className={styles.参数}>
                            <span className={styles.参数名}>
                              {详情.循环加速值范围?.length ? '加速范围' : '加速等级'}
                            </span>
                            <span className={styles.参数值}>
                              {详情.循环加速值范围?.length
                                ? `${详情.循环加速值范围[0]} ~ ${详情.循环加速值范围[1]}`
                                : `${详情.循环加速等级 ?? '不限'}${详情.循环加速等级 !== undefined ? ' 段' : ''}`}
                            </span>
                          </span>
                          {详情.循环延迟要求 !== undefined && (
                            <span className={styles.参数}>
                              <span className={styles.参数名}>延迟</span>
                              <span
                                className={`${styles.延迟标记} ${styles[`延迟_${详情.循环延迟要求}`]}`}
                              >
                                {详情.循环延迟要求}
                              </span>
                              <span className={styles.延迟说明}>
                                {
                                  延迟设定.find(
                                    (选项) => String(选项.value) === String(详情.循环延迟要求),
                                  )?.label
                                }
                              </span>
                            </span>
                          )}
                        </span>
                        {typeof 详情.模拟器快照秒伤 === 'number' &&
                          Number.isFinite(详情.模拟器快照秒伤) && (
                            <span className={styles.快照}>
                              <span>模拟器快照秒伤</span>
                              <strong>{详情.模拟器快照秒伤.toLocaleString('zh-CN')}</strong>
                            </span>
                          )}
                      </span>
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
            </section>
          )
        })}
      </Form>
    </Modal>
  )
}

export default React.memo(合并循环弹窗)
