// 加速规划
import { Button, Modal, ModalProps, Table, Tag, Tooltip } from 'antd'
import React from 'react'
import { 属性类型 } from '@/@types/属性'
import { 装备属性信息模型 } from '@/@types/装备'
import { color_list } from '../加速装备选择'
import { 获取最大精炼等级 } from '../../../功能组件/装备选择'
import { 精炼加成系数算法 } from '../../../工具函数/根据装备信息获取基础属性'
import 装备详情容器 from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择/装备详情容器'
import './index.css'

interface 加速数据类型 {
  id: string | number // 唯一id
  label: string // 用于展示的名字
  value: number // 提供加速值
  type: string // 计算类型 相同类型不可重复选择
  equip?: any // 额外装备数据
}

export interface 计算组合结果类型 {
  所有组合: Array<{
    组合: 加速数据类型[]
    sum: number
  }>
  锁定装备加速总和: number
  实际目标加速: number
}

interface 计算组合结果弹窗类型 extends ModalProps {
  计算组合结果: 计算组合结果类型 | undefined
  锁定装备: 装备属性信息模型[]
}

function 计算组合结果弹窗(props: 计算组合结果弹窗类型) {
  const { onCancel, 计算组合结果, 锁定装备, ...rest } = props
  return (
    <Modal
      title={
        <div className={'haste-project-modal-title'}>
          <span>规划结果</span>
        </div>
      }
      maskClosable={false}
      centered
      width={1200}
      footer={false}
      onCancel={onCancel}
      destroyOnClose
      {...rest}
    >
      <div className={'haste-project-help-wrap'}>
        {锁定装备?.length ? (
          <div className={'haste-project-result-header'}>
            <h1 className={'haste-project-result-header-title'}>锁定装备列表：</h1>
            {锁定装备?.map((item, index) => {
              const color = color_list?.[index % color_list?.length] || color_list[0]
              const 装备最大精炼等级 = 获取最大精炼等级(item)
              let 加速值 = 0
              item?.装备增益?.forEach((增益) => {
                if (增益?.属性 == 属性类型?.加速等级) {
                  const 精炼后加速值 = 精炼加成系数算法(增益.值, 装备最大精炼等级) || 0
                  加速值 = 加速值 + 精炼后加速值
                }
              })
              return (
                <Tooltip key={`加速装备已选择${item?.id}`} title={加速值 || undefined}>
                  <Tag className={`haste-equipment-select-tag`} color={color}>
                    {item?.装备名称}
                  </Tag>
                </Tooltip>
              )
            })}
          </div>
        ) : null}
        <Table
          size='small'
          dataSource={计算组合结果?.所有组合}
          pagination={false}
          scroll={{ y: 700 }}
          columns={[
            {
              key: '组合信息',
              title: '组合信息',
              dataIndex: '组合信息',
              render: (_, row) => {
                return (
                  <div className='haste-project-result-content'>
                    {row?.组合?.map((item) => {
                      const 组合样式 = item?.label?.includes('五彩')
                        ? 'h-result-wucai'
                        : item?.label?.includes('附魔')
                          ? item?.label?.includes('挑战')
                            ? 'h-result-fumo-tz'
                            : item?.label?.includes('紫')
                              ? 'h-result-fumo-zi'
                              : 'h-result-fumo-lan'
                          : typeof item?.id === 'string' && item?.id?.includes('家园酒')
                            ? 'h-result-jiu'
                            : item?.label?.includes('辅助') || item?.label?.includes('增强')
                              ? item?.label?.includes('紫')
                                ? 'h-result-xiaoyao-zi'
                                : 'h-result-xiaoyao-lan'
                              : 'h-result-zhuangbei'
                      return (
                        <div className='haste-project-result-item' key={item?.id}>
                          <div className={`haste-project-result-label ${组合样式}`}>
                            {item?.equip ? (
                              <装备详情容器
                                装备数据={item?.equip}
                                当前装备信息={{
                                  当前精炼等级: 8,
                                  镶嵌孔数组: item?.equip?.镶嵌孔数组?.map((a) => {
                                    return {
                                      ...a,
                                      镶嵌宝石等级: 8,
                                    }
                                  }),
                                }}
                              >
                                <span className='haste-project-result-equip'>{item?.label}</span>
                              </装备详情容器>
                            ) : (
                              item?.label
                            )}
                          </div>
                          <div className='haste-project-result-value'>+{item?.value}</div>
                          {/* {index !== row?.组合?.length - 1 ? '｜' : ''} */}
                        </div>
                      )
                    })}
                  </div>
                )
              },
            },
            {
              key: '最终加速值',
              title: '最终加速值',
              width: 200,
              dataIndex: 'sum',
              render: (_, row) => {
                return row?.sum + (计算组合结果?.锁定装备加速总和 || 0)
              },
            },
            {
              key: '溢出加速值',
              title: '溢出加速值',
              width: 200,
              dataIndex: '溢出加速值',
              render: (_, row) => {
                return row?.sum - (计算组合结果?.实际目标加速 || 0)
              },
            },
            {
              key: '操作',
              title: '操作',
              width: 200,
              dataIndex: '操作',
              render: () => {
                return (
                  <Tooltip title='开发中'>
                    <Button size='small' type='primary' disabled>
                      使用方案
                    </Button>
                  </Tooltip>
                )
              },
            },
          ]}
        />
      </div>
    </Modal>
  )
}

export default 计算组合结果弹窗
