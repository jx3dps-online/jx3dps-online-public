import React, { lazy, Suspense, useState, useSyncExternalStore } from 'react'
import { Button, Checkbox, Form, Input, Modal, Select, Space, message } from 'antd'
import { PlusOutlined, RightOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import 简写映射 from '@/心法模块/简写映射.json'
import ServerCascader from '@/组件/ServerCascader'
import { 加载角色, 加载当前角色 } from '@/store/data'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import {
  复制角色,
  删除角色,
  新建角色,
  更新角色资料,
  设为当前角色,
  订阅角色注册表,
  读取角色注册表,
} from '@/角色/注册表'
import type { 角色元数据 } from '@/角色/类型'
import 角色另存为弹窗 from '../角色另存为弹窗'
import { deepClone } from '@/工具函数/help'
import type { 对比输入 } from './角色对比/类型'

import './index.css'
import 样式 from './index.module.less'

const 取图标 = (心法: string) => (心法数据 as any)?.[心法]?.系统配置?.心法图标 || ''
const 取简写 = (心法: string) => Object.keys(简写映射).find((键) => (简写映射 as any)[键] === 心法)
const 角色对比 = lazy(() => import('./角色对比'))

function 角色选择() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const 注册表 = useSyncExternalStore(订阅角色注册表, 读取角色注册表, 读取角色注册表)
  const 当前角色 = useAppSelector((state) => state?.data?.当前角色)
  const [管理弹窗, 设置管理弹窗] = useState(false)
  const [二级弹窗, 设置二级弹窗] = useState<
    { 模式: '新建' } | { 模式: '编辑'; 角色: 角色元数据 } | undefined
  >()
  const [复制源, 设置复制源] = useState<角色元数据>()
  const [二级表单] = Form.useForm()
  const [对比模式, 设置对比模式] = useState(false)
  const [对比角色, 设置对比角色] = useState<角色元数据[]>([])
  const [对比输入, 设置对比输入] = useState<对比输入>()

  const 勾选对比角色 = (角色: 角色元数据) => {
    if (对比角色.some((项) => 项.id === 角色.id)) {
      设置对比角色(对比角色.filter((项) => 项.id !== 角色.id))
    } else if (对比角色.length && 对比角色[0].心法 !== 角色.心法) {
      message.info('只支持同心法对比')
    } else {
      设置对比角色([...对比角色, 角色])
    }
  }

  const 退出对比 = () => {
    设置对比模式(false)
    设置对比角色([])
    设置对比输入(undefined)
  }

  const 当前角色项 = 注册表.列表.find((角色) => 角色.id === 当前角色?.id) || 当前角色
  const 其他角色列表 = 注册表.列表
    .filter((角色) => 角色.id !== 当前角色?.id)
    .sort((甲, 乙) => Number(乙.心法 === 当前角色?.心法) - Number(甲.心法 === 当前角色?.心法))
  const 当前心法图标 = 当前角色 ? 取图标(当前角色.心法) : ''

  const 切换 = (角色: 角色元数据) => {
    try {
      if (注册表.当前角色id !== 角色.id) 设为当前角色(角色.id)
      if (角色.心法 === 当前角色?.心法) {
        dispatch(加载角色(角色))
        dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
        设置管理弹窗(false)
      } else {
        const 简写 = 取简写(角色.心法)
        if (!简写) throw new Error('该心法暂不支持切换。')
        设置管理弹窗(false)
        navigate(`/dps/${简写}`)
      }
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '角色切换失败。')
    }
  }

  const 打开新建角色 = () => {
    设置二级弹窗({ 模式: '新建' })
    二级表单.resetFields()
  }

  const 打开编辑角色 = (角色: 角色元数据) => {
    设置二级弹窗({ 模式: '编辑', 角色 })
    二级表单.resetFields()
    二级表单.setFieldsValue({
      名称: 角色.名称,
      区服: 角色.区服,
      游戏角色名: 角色.游戏角色名,
    })
  }

  const 提交角色资料 = async () => {
    if (!二级弹窗) return
    try {
      const 值 = await 二级表单.validateFields()
      const 资料 = {
        区服: 值.区服?.trim() || undefined,
        游戏角色名: 值.游戏角色名?.trim() || undefined,
      }
      if (二级弹窗.模式 === '新建') {
        const 角色 = 新建角色(值.心法, 值.名称, 资料)
        设置二级弹窗(undefined)
        切换(角色)
      } else {
        const 新角色 = 更新角色资料(二级弹窗.角色.id, {
          名称: 值.名称,
          ...资料,
          uid: 二级弹窗.角色.uid,
        })
        if (新角色.id === 当前角色?.id) {
          dispatch(加载角色(新角色))
        }
        设置二级弹窗(undefined)
        message.success('角色资料已更新。')
      }
    } catch (错误) {
      if (错误 instanceof Error) message.error(错误.message)
    }
  }

  const 确认删除 = (角色: 角色元数据) => {
    Modal.confirm({
      title: `删除角色「${角色.名称}」？`,
      content: '将同时删除该角色的相关信息，删除后不可恢复。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        try {
          删除角色(角色.id)
          if (角色.id === 当前角色?.id) dispatch(加载当前角色())
          message.success('角色已删除。')
        } catch (错误) {
          message.error(错误 instanceof Error ? 错误.message : '删除失败。')
        }
      },
    })
  }

  const 渲染角色卡片 = (角色: 角色元数据) => {
    const 是当前 = 角色.id === 当前角色?.id
    const 心法图标 = 取图标(角色.心法)
    return (
      <div
        className={'role-manager-item' + (是当前 ? ' is-current' : '')}
        key={角色.id}
        onClick={() => {
          if (对比模式) 勾选对比角色(角色)
          else if (!是当前) 切换(角色)
        }}
      >
        {心法图标 ? (
          <div className='role-manager-item-info-imgbg'>
            <img src={心法图标} alt='' />
          </div>
        ) : null}
        <span className='role-manager-item-avatar'>
          {心法图标 ? <img src={心法图标} alt='' /> : <UserOutlined />}
        </span>
        <span className='role-manager-item-info'>
          <span className='role-manager-item-name'>
            <span className='role-manager-item-name-text'>{角色.名称}</span>
            <span className='role-manager-item-xinfa'>{角色.心法}</span>
            {是当前 && <span className='role-manager-current-tag'>当前</span>}
          </span>
          <span className='role-manager-item-sub'>
            {角色.区服 || '未设置区服'}
            {角色.游戏角色名 ? ' · ' + 角色.游戏角色名 : ''}
          </span>
        </span>
        <span className='role-manager-item-actions' onClick={(事件) => 事件.stopPropagation()}>
          {对比模式 ? (
            <Checkbox
              checked={对比角色.some((项) => 项.id === 角色.id)}
              aria-label={`选择${角色.名称}参与对比`}
              onChange={() => 勾选对比角色(角色)}
            />
          ) : (
            <>
              <Button
                size='small'
                type='text'
                className='role-manager-action'
                onClick={() => 打开编辑角色(角色)}
              >
                编辑
              </Button>
              <Button
                size='small'
                type='text'
                className='role-manager-action'
                onClick={() => 设置复制源(角色)}
              >
                复制
              </Button>
              <Button
                size='small'
                type='text'
                className='role-manager-action role-manager-action-danger'
                onClick={() => 确认删除(角色)}
              >
                删除
              </Button>
            </>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className='role-select-item' id='Guide_11'>
      <div className='common-content'>
        <button className='role-card' type='button' onClick={() => 设置管理弹窗(true)}>
          {当前角色 ? (
            <>
              {当前心法图标 ? <img className='role-card-bg' src={当前心法图标} alt='' /> : null}
              <span className='role-card-avatar'>
                {当前心法图标 ? <img src={当前心法图标} alt='' /> : <UserOutlined />}
              </span>
              <span className='role-card-info'>
                <span className='role-card-name'>
                  <span className='role-card-name-text'>{当前角色.名称}</span>
                  {当前角色.游戏角色名 ? (
                    <span className='role-card-game-name'>{当前角色.游戏角色名}</span>
                  ) : null}
                </span>
                <span className='role-card-server'>{当前角色.区服 || '未设置区服'}</span>
              </span>
              <RightOutlined className='role-card-switch' />
            </>
          ) : (
            <span className='role-card-name'>正在加载角色…</span>
          )}
        </button>
      </div>

      <Modal
        title={
          <Space size='large'>
            <span>角色管理</span>
            {对比模式 ? (
              <Space>
                <Button
                  size='small'
                  type='primary'
                  disabled={!对比角色.length}
                  onClick={() => {
                    const 页面数据 = dispatch((_dispatch, getState) => getState().data)
                    设置对比输入({ 角色: deepClone(对比角色), 页面数据: deepClone(页面数据) })
                  }}
                >
                  开始对比
                </Button>
                <Button size='small' onClick={退出对比}>
                  取消
                </Button>
              </Space>
            ) : (
              <Space>
                <Button type='primary' size='small' icon={<PlusOutlined />} onClick={打开新建角色}>
                  新建角色
                </Button>
                <Button size='small' onClick={() => 设置对比模式(true)}>
                  角色对比
                </Button>
              </Space>
            )}
          </Space>
        }
        open={管理弹窗}
        onCancel={() => {
          设置管理弹窗(false)
          退出对比()
        }}
        footer={null}
        centered
        width={960}
      >
        <div className='role-manager'>
          {当前角色项 ? 渲染角色卡片(当前角色项) : null}
          {其他角色列表.length ? (
            <>
              <div className='role-manager-subtitle'>其他角色 · {其他角色列表.length}</div>
              <div className={样式.其他角色列表}>
                {其他角色列表.map((角色) => 渲染角色卡片(角色))}
              </div>
            </>
          ) : null}
        </div>
      </Modal>

      {对比输入 && (
        <Suspense fallback={null}>
          <角色对比 输入={对比输入} 关闭={() => 设置对比输入(undefined)} />
        </Suspense>
      )}

      <Modal
        title={二级弹窗?.模式 === '编辑' ? '编辑角色' : '新建角色'}
        open={!!二级弹窗}
        onCancel={() => 设置二级弹窗(undefined)}
        onOk={提交角色资料}
        okText={二级弹窗?.模式 === '编辑' ? '保存' : '创建'}
        cancelText='取消'
        width={420}
        zIndex={1200}
        forceRender
      >
        <Form form={二级表单} layout='vertical'>
          {二级弹窗?.模式 === '新建' ? (
            <Form.Item label='心法' name='心法' rules={[{ required: true, message: '请选择心法' }]}>
              <Select
                placeholder='选择心法'
                options={Object.keys(心法数据).map((名称) => ({ value: 名称, label: 名称 }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item
            label='角色名'
            name='名称'
            rules={[
              { required: true, message: '请填写角色名' },
              { max: 20, message: '角色名最多 20 个字符' },
            ]}
          >
            <Input placeholder='计算器内显示的角色名' maxLength={20} />
          </Form.Item>
          <Form.Item
            label='区服（可选）'
            name='区服'
            getValueProps={(值) => ({
              value: typeof 值 === 'string' && 值 ? 值.split('/') : undefined,
            })}
            normalize={(值?: string[]) => (值?.length ? 值.join('/') : undefined)}
          >
            <ServerCascader style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label='游戏角色名（可选）' name='游戏角色名'>
            <Input placeholder='用于配装导入时快捷带出' maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>

      <角色另存为弹窗
        源角色={复制源}
        open={!!复制源}
        onCancel={() => 设置复制源(undefined)}
        另存为={(源, 名称) => 复制角色(源, 名称).角色}
        onSuccess={(新角色) => {
          设置复制源(undefined)
          切换(新角色)
        }}
      />
    </div>
  )
}

export default 角色选择
