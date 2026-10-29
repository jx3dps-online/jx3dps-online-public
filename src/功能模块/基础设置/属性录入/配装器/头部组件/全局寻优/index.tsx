import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
} from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取心法加速阈值 } from '@/数据/加速阈值'
import 加速阈值选择 from '@/组件/加速阈值选择'
import use移动端 from '@/hooks/use移动端'
import { useAppSelector } from '@/hooks'
import { 装备位置部位枚举, 装备选择范围类型 } from '@/@types/装备'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'

import use模拟退火寻优 from './use模拟退火寻优'

const 全部部位: string[] = Object.keys(装备位置部位枚举)

interface 全局寻优类型 {
  form: any
  更换装备计算秒伤: (单个表单值: any, 全部表单值: any) => void
  装备选择范围: 装备选择范围类型
  默认镶嵌宝石等级: number
  /**
   * @name open
   * 设置弹窗是否展示（受控）
   */
  open: boolean
  /**
   * @name onOpenChange
   * 设置弹窗展示状态变化回调
   */
  onOpenChange: (open: boolean) => void
  /**
   * @name 循环覆盖
   * 目标编辑时用目标循环/奇穴/秘籍计算候选收益。
   */
  循环覆盖?: 计算循环覆盖类型
  允许规划增益?: boolean
}

function 全局寻优(props: 全局寻优类型) {
  const {
    form,
    更换装备计算秒伤,
    装备选择范围,
    默认镶嵌宝石等级,
    open,
    onOpenChange,
    循环覆盖,
    允许规划增益 = true,
  } = props
  const 心法 = use心法数据()
  const 阈值列表 = 获取心法加速阈值(心法)
  const 移动端 = use移动端()
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)

  const [loading, setLoading] = useState(false)
  const 取消标记 = useRef(false)
  const 放弃搜索标记 = useRef(false)
  const [设置form] = Form.useForm()
  useEffect(() => {
    设置form.setFieldValue('目标加速阈值', undefined)
  }, [心法.名称, 设置form])
  const 额外寻优范围: string[] | undefined = Form.useWatch('额外寻优范围', 设置form)
  const 参与小附魔 = !!额外寻优范围?.includes('小附魔')

  const 寻优 = use模拟退火寻优({
    form,
    更换装备计算秒伤,
    装备选择范围,
    默认镶嵌宝石等级,
    循环覆盖,
    允许规划增益,
  })
  const 增益不可选 = !允许规划增益 || !增益启用
  const 额外寻优选项 = [
    { label: '小附魔', value: '小附魔' },
    { label: '大附魔', value: '大附魔' },
    { label: '五彩石', value: '五彩石' },
    { label: '药品', value: '药品', disabled: 增益不可选 },
    { label: '食品', value: '食品', disabled: 增益不可选 },
    { label: '家园酒品', value: '家园酒品', disabled: 增益不可选 },
    { label: '阵眼', value: '阵眼', disabled: 增益不可选 },
  ]

  const 开始搜索 = () => {
    设置form.validateFields().then(async (values) => {
      取消标记.current = false
      放弃搜索标记.current = false
      setLoading(true)
      const 阈值 = 阈值列表.flatMap((组) => 组.档位).find((项) => 项.标识 === values.目标加速阈值)
      const 已出结果 = await 寻优.开始搜索(
        { ...values, 目标加速值范围: 阈值 ? [阈值.加速值, 阈值.下一加速值] : undefined },
        {
          是否取消: () => 取消标记.current,
          是否放弃: () => 放弃搜索标记.current,
        },
      )
      setLoading(false)
      if (已出结果) {
        onOpenChange(false)
      }
    })
  }

  const 取消搜索 = () => {
    if (loading) {
      放弃搜索标记.current = true
      取消标记.current = true
      setLoading(false)
    }
    onOpenChange(false)
  }

  return (
    <>
      <Modal
        title='全局寻优'
        maskClosable={false}
        centered
        open={open}
        onOk={开始搜索}
        onCancel={取消搜索}
        width={760}
        okText='开始搜索'
        okButtonProps={{ loading }}
        destroyOnClose
        footer={
          loading ? (
            <div style={{ textAlign: 'right' }}>
              {寻优.可停止 ? (
                <Button type='primary' onClick={() => (取消标记.current = true)}>
                  停止寻优，使用当前最优
                </Button>
              ) : null}
              <Button style={{ marginLeft: 12 }} onClick={取消搜索}>
                取消搜索
              </Button>
            </div>
          ) : undefined
        }
      >
        <Spin spinning={loading} tip={寻优.进度提示}>
          <Form
            form={设置form}
            layout='vertical'
            initialValues={{
              搜索轮数: 10,
              循环轮数: 5,
              装备扰动数量: 3,
              额外寻优范围: [],
              不使用橙武: false,
              不使用精品及挑战附魔: false,
              不使用蓝色附魔: false,
            }}
          >
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Form.Item
                  name='搜索轮数'
                  label='每轮搜索次数'
                  tooltip='次数越多耗时越长；结果不理想时可结合锁定部位、约束条件或增加轮次'
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} max={50} precision={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name='循环轮数'
                  label='外层循环轮数'
                  tooltip='每轮以累计最优结果为新起点重新搜索'
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} max={50} precision={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name='装备扰动数量'
                  label='装备扰动数量'
                  tooltip='每次联合替换的装备件数；可替换部位不足时按实际数量。附魔与增益单独扰动。'
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={1}
                    max={全部部位.length}
                    precision={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Form.Item name='目标加速阈值' label='目标加速阈值'>
                  <加速阈值选择 阈值列表={阈值列表} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item name='套装件数' label='套装件数'>
                  <Select
                    allowClear
                    placeholder='不限制'
                    options={[
                      { label: '2 件套', value: 2 },
                      { label: '4 件套', value: 4 },
                    ]}
                  />
                </Form.Item>
              </Col>
              {!移动端 && (
                <Col xs={12} sm={6}>
                  <Form.Item
                    name='上限装分'
                    label='装分上限'
                    tooltip='填写后结果装分不超过该值，并额外搜索镶嵌等级；换装沿用当前精炼等级'
                  >
                    <InputNumber
                      min={1}
                      max={999999}
                      precision={0}
                      placeholder='不限制'
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Form.Item
              name='额外寻优范围'
              label={
                <Space>
                  <span>额外寻优范围</span>
                  <Button
                    type='link'
                    size='small'
                    disabled={loading}
                    onClick={() =>
                      设置form.setFieldValue(
                        '额外寻优范围',
                        额外寻优选项.filter((选项) => !选项.disabled).map((选项) => 选项.value),
                      )
                    }
                  >
                    全选
                  </Button>
                </Space>
              }
              tooltip={
                <div>
                  <p>小附魔：仅搜索各部位、各属性的最高档候选（含精品及挑战附魔）。</p>
                  <p>五彩石：搜索结束后在同等级五彩石中挑选秒伤最高的。</p>
                  <p>阵眼：在当前心法可选的全部阵眼中搜索。</p>
                </div>
              }
              extra={
                !允许规划增益
                  ? '目标编辑不支持药品、食品、家园酒品和阵眼。'
                  : !增益启用
                    ? '开启增益后可选择药品、食品、家园酒品和阵眼。'
                    : undefined
              }
            >
              <Checkbox.Group options={额外寻优选项} />
            </Form.Item>
            <Form.Item
              label='搜索选项'
              tooltip={
                <div>
                  <p>「不使用橙武」会排除所有橙色品质装备（锁定部位除外）。</p>
                  <p>「不使用精品及挑战 / 蓝色附魔」需勾选小附魔，结果不会保留对应类型的小附魔。</p>
                </div>
              }
            >
              <Space size={12} wrap>
                <Form.Item name='不使用橙武' valuePropName='checked' noStyle>
                  <Checkbox>不使用橙武</Checkbox>
                </Form.Item>
                <Form.Item name='不使用精品及挑战附魔' valuePropName='checked' noStyle>
                  <Checkbox disabled={!参与小附魔}>不使用精品及挑战附魔</Checkbox>
                </Form.Item>
                <Form.Item name='不使用蓝色附魔' valuePropName='checked' noStyle>
                  <Checkbox disabled={!参与小附魔}>不使用蓝色附魔</Checkbox>
                </Form.Item>
              </Space>
            </Form.Item>
            <Divider style={{ margin: '4px 0 12px' }} />
            <Form.Item
              name='锁定部位'
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>锁定部位（不参与搜索）</span>
                  <span>
                    <a
                      onClick={() => 设置form.setFieldValue('锁定部位', 全部部位)}
                      style={{ marginRight: 12 }}
                    >
                      全选
                    </a>
                    <a onClick={() => 设置form.setFieldValue('锁定部位', [])}>清空</a>
                  </span>
                </div>
              }
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  {全部部位.map((部位索引) => (
                    <Col span={6} key={部位索引}>
                      <Checkbox value={部位索引}>{装备位置部位枚举[部位索引]}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Alert
              type='warning'
              showIcon
              message='结果仅供参考，请结合手动调整；当前武器为橙武时，武器部位自动锁定。'
            />
          </Form>
        </Spin>
      </Modal>
      {寻优.结果弹窗}
    </>
  )
}

export default 全局寻优
