import React, { useEffect, useState } from 'react'
import { App, Button, message, Table } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import useCycle from '@/hooks/use-cycle'
import { 更新当前自定义循环列表 } from '@/store/data'
import 导入弹窗 from './导入循环'
import { 循环数据 } from '@/@types/循环'
import 循环详情弹窗 from './循环详情弹窗'
import 合并循环弹窗 from './合并循环弹窗'
import './index.css'

const { 缓存映射 } = 获取当前数据()

function 循环设置() {
  const { modal } = App.useApp()
  const { 全部循环 = [] } = useCycle()
  const [导入弹窗设置, 设置导入弹窗设置] = useState<boolean>(false)
  const [批量选择状态, 设置批量选择状态] = useState<boolean>(false)
  const [批量选择数据, 设置批量选择数据] = useState<any[]>([])
  const [合并循环弹窗设置, 设置合并循环弹窗设置] = useState<boolean>(false)
  const [循环详情弹窗设置, 设置循环详情弹窗设置] = useState<{ open: boolean; 数据?: 循环数据 }>({
    open: false,
  })

  const 自定义循环列表 = useAppSelector((state) => state?.data?.自定义循环列表)
  const dispatch = useAppDispatch()

  const 导出循环 = (data) => {
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)),
    )
    element.setAttribute('download', '计算器数据迁移.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    message.success('循环已导出')
  }

  const 删除循环 = (循环数据) => {
    modal.confirm({
      title: `确定要删除循环${循环数据?.名称}吗？`,
      content: '删除后将无法恢复',
      onOk() {
        const 新自定义循环 = 自定义循环列表?.filter((item) => item?.名称 !== 循环数据?.名称)
        dispatch(更新当前自定义循环列表(新自定义循环))
        message.success('删除成功')
      },
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
    <div>
      <div className='cycle-setting-btns'>
        {/* <Button
          className='cycle-setting-btn'
          type='primary'
          onClick={() => 设置循环详情弹窗设置({ open: true })}
        >
          新建循环
        </Button> */}
        <Button type='primary' className='cycle-setting-btn' onClick={() => 设置导入弹窗设置(true)}>
          导入循环
        </Button>

        {批量选择状态 ? (
          <>
            <Button
              disabled={批量选择数据.length === 0}
              danger
              className='cycle-setting-btn'
              onClick={() => 设置合并循环弹窗设置(true)}
            >
              合并循环
            </Button>
            <Button className='cycle-setting-btn' onClick={() => 设置批量选择状态(false)}>
              取消批量
            </Button>
          </>
        ) : (
          <Button className='cycle-setting-btn' onClick={() => 设置批量选择状态(true)}>
            批量选择
          </Button>
        )}
      </div>
      <导入弹窗 open={导入弹窗设置} onCancel={() => 设置导入弹窗设置(false)} />
      <循环详情弹窗
        open={循环详情弹窗设置?.open}
        数据={循环详情弹窗设置?.数据}
        onCancel={() => 设置循环详情弹窗设置({ open: false })}
      />
      <合并循环弹窗
        open={合并循环弹窗设置}
        选中循环名称={批量选择数据}
        onCancel={() => 设置合并循环弹窗设置(false)}
      />
      <Table
        dataSource={全部循环}
        size='small'
        pagination={false}
        scroll={{ y: 500 }}
        rowSelection={
          批量选择状态
            ? {
                selectedRowKeys: 批量选择数据,
                onChange(selectedRowKeys) {
                  设置批量选择数据(selectedRowKeys)
                },
              }
            : undefined
        }
        rowKey={(record) => record?.名称}
        columns={[
          {
            title: '唯一标识',
            dataIndex: '名称',
          },
          {
            title: '循环标题',
            dataIndex: '标题',
            render: (_, row) => {
              return row?.标题 || row?.名称
            },
          },
          {
            title: '提供者',
            dataIndex: '提供者',
          },
          {
            title: '类型',
            dataIndex: '类型',
            width: 80,
          },
          {
            title: '标记',
            dataIndex: '标记',
            width: 80,
          },
          {
            title: '操作',
            dataIndex: '操作',
            render: (_, row) => {
              const 允许操作 = 自定义循环列表?.some((item) => item?.名称 === row?.名称)
              return (
                <div className='cycle-setting-list-btns'>
                  <Button size='small' type='link' onClick={() => 导出循环(row)}>
                    导出
                  </Button>
                  <Button
                    size='small'
                    type='link'
                    onClick={() => 设置循环详情弹窗设置({ open: true, 数据: row })}
                  >
                    详情
                  </Button>
                  {允许操作 ? (
                    <>
                      <Button size='small' type='link' danger onClick={() => 删除循环(row)}>
                        删除
                      </Button>
                    </>
                  ) : null}
                </div>
              )
            },
          },
        ]}
      />
    </div>
  )
}

export default 循环设置
