import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Modal,
  message,
  Space,
  Tag,
  Typography,
} from 'antd'
import { CheckOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { 装备信息数据类型 } from '@/@types/装备'
import { useAppSelector } from '@/hooks/index'
import { use心法数据 } from '@/心法模块/心法上下文'
import { use角色计划 } from '@/角色/use角色计划'
import { use目标池 } from '@/角色/use目标池'
import { 统计目标绑定角色数 } from '@/角色/目标池'
import type { 配装循环, 配装目标 } from '@/角色/类型'
import { 读取目标JSON, 导出目标JSON } from '@/角色/目标导入导出'
import type { 目标JSON数据 } from '@/角色/目标导入导出'
import { 登阶循环限制 } from '../../领域/循环'
import { 获取文案, 填充文案, 武器类型显示 } from '../../文案'
import 登阶循环选择 from '../循环选择/index'
import './index.less'

interface 管理弹窗属性 {
  踏天目标区域?: React.ReactNode
  open: boolean
  onClose: () => void
  新增目标: () => void
  编辑目标: (id: string) => void
  切换聚焦: (id: string) => void
}

const 记录日期 = (时间: number) =>
  new Date(时间).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
const 名称提示 = (名称: string, 名称校验: string) =>
  !名称.trim() || 名称.trim().length > 40 ? 名称校验 : ''

/** 目标管理：只负责目标池列表与增删改；新建目标走独立的命名弹窗。 */
export default function 管理弹窗({
  open,
  onClose,
  新增目标,
  编辑目标,
  切换聚焦,
  踏天目标区域,
}: 管理弹窗属性) {
  const { 名称: 心法, 系统配置, 计算循环 } = use心法数据()
  const 文案 = 获取文案(心法)
  const 数据 = useAppSelector((state) => state.data)
  const 当前角色 = 数据.当前角色
  const { 计划, 读取错误 } = use角色计划(当前角色?.id)
  const { 池, 存储: 目标池存储, 读取错误: 目标池错误 } = use目标池(心法)
  const 用目标池 = <T,>(执行: (存储: NonNullable<typeof 目标池存储>) => T): T => {
    if (!目标池存储) throw new Error(文案['通用.目标池未就绪'])
    return 执行(目标池存储)
  }
  const [重命名id, 设置重命名id] = useState<string>()
  const [重命名值, 设置重命名值] = useState('')
  const [重命名错误, 设置重命名错误] = useState('')
  const [待删除, 设置待删除] = useState<配装目标>()
  const [循环选择重置次数, 设置循环选择重置次数] = useState(0)
  const [待导入, 设置待导入] = useState<目标JSON数据>()
  const [导入名称, 设置导入名称] = useState('')
  const [JSON操作, 设置JSON操作] = useState<'导入' | '导出'>()
  const [JSON文本, 设置JSON文本] = useState('')

  useEffect(() => {
    if (open) {
      设置重命名id(undefined)
      设置重命名错误('')
      设置待删除(undefined)
      设置待导入(undefined)
      设置JSON操作(undefined)
    }
  }, [open, 心法])

  const 全部循环 = [...计算循环, ...(数据.自定义循环列表 || [])]
  const 循环失效 = (目标: 配装目标) =>
    !!目标.循环 && !全部循环.some((项) => 项.名称 === 目标.循环?.名称)
  const 校验循环 = (装备: 装备信息数据类型, 循环?: 配装循环) => {
    const 原因 = 登阶循环限制(
      装备,
      全部循环.find((项) => 项.名称 === 循环?.名称),
      文案,
    )
    if (原因) throw new Error(原因)
  }
  const 焦点id = 计划.聚焦id || 池.目标[0]?.id
  const 主题色 = 系统配置?.主题色 || '#3c649c'
  const 主题样式 = { '--dragon-theme': 主题色 } as React.CSSProperties
  const 操作 = (执行: () => void, 提示: string) => {
    try {
      执行()
      message.success(提示)
      return true
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : 文案['通用.保存失败'])
      return false
    }
  }
  const 提交重命名 = (id: string) => {
    const 错误 = 名称提示(重命名值, 文案['通用.名称校验'])
    设置重命名错误(错误)
    if (错误) return
    if (
      操作(
        () => 用目标池((存储) => 存储.重命名目标(id, 重命名值.trim())),
        文案['管理弹窗.提示.名称已更新'],
      )
    ) {
      设置重命名id(undefined)
    }
  }
  const 删除影响角色数 = 待删除 ? 统计目标绑定角色数(心法, 待删除.id) : 0
  const 导入目标 = () => {
    try {
      const 目标 = 读取目标JSON(JSON文本, 心法)
      设置导入名称(目标.名称)
      设置待导入(目标)
      设置JSON操作(undefined)
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : 文案['管理弹窗.错误.导入'])
    }
  }
  const 保存导入目标 = () => {
    if (!待导入) return
    if (
      操作(() => {
        校验循环(待导入.装备, 待导入.循环)
        用目标池((存储) => 存储.新增目标(待导入.装备, 导入名称, 待导入.循环))
      }, 文案['管理弹窗.提示.已导入'])
    )
      设置待导入(undefined)
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: 主题色 } }}>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title={null}
        width={640}
        className='dragon-manager'
        aria-labelledby='dragon-manager-title'
        wrapClassName='dragon-manager-wrap'
        style={主题样式}
      >
        <header className='dragon-manager-heading'>
          <span className='dragon-manager-eyebrow'>{文案['登阶.名称']}</span>
          <h2 id='dragon-manager-title'>{文案['通用.目标管理']}</h2>
          <p>{填充文案(文案['管理弹窗.眉题'], { 心法 })}</p>
        </header>
        <div className='dragon-manager-content'>
          {读取错误 && <Alert type='warning' showIcon message={读取错误} />}
          {目标池错误 && <Alert type='warning' showIcon message={目标池错误} />}
          <section className='dragon-manager-goals' aria-labelledby='dragon-manager-goals-label'>
            <div className='dragon-manager-section-heading'>
              <h3 id='dragon-manager-goals-label'>
                {文案['管理弹窗.目标列表']} <span>{池.目标.length + (计划.踏天 ? 1 : 0)}</span>
              </h3>
              <Space wrap>
                <Button
                  size='small'
                  onClick={() => {
                    设置JSON文本('')
                    设置JSON操作('导入')
                  }}
                >
                  {文案['通用.导入目标']}
                </Button>
                <Button
                  type='primary'
                  size='small'
                  icon={<PlusOutlined />}
                  id='Guide_新增目标'
                  onClick={新增目标}
                  disabled={!当前角色}
                >
                  {文案['管理弹窗.按钮.新增目标']}
                </Button>
              </Space>
            </div>
            {踏天目标区域}
            {池.目标.length ? (
              <div className='dragon-manager-goal-list'>
                {[...池.目标]
                  .sort((a, b) => Number(b.id === 焦点id) - Number(a.id === 焦点id))
                  .map((目标) => {
                    const 聚焦 = 目标.id === 焦点id
                    const 标记 = 全部循环.find((项) => 项.名称 === 目标.循环?.名称)?.标记
                    return (
                      <article
                        className={'dragon-manager-goal' + (聚焦 ? ' is-focused' : '')}
                        key={目标.id}
                      >
                        {重命名id === 目标.id ? (
                          <div className='dragon-manager-rename'>
                            <label htmlFor={'dragon-manager-rename-' + 目标.id}>
                              {文案['管理弹窗.重命名标签']}
                            </label>
                            <div className='dragon-manager-name-form'>
                              <Input
                                id={'dragon-manager-rename-' + 目标.id}
                                autoFocus
                                value={重命名值}
                                onChange={(事件) => {
                                  设置重命名值(事件.target.value)
                                  设置重命名错误('')
                                }}
                                maxLength={40}
                                showCount
                                status={重命名错误 ? 'error' : undefined}
                                onPressEnter={() => 提交重命名(目标.id)}
                              />
                              <Button type='primary' onClick={() => 提交重命名(目标.id)}>
                                {文案['通用.保存']}
                              </Button>
                              <Button type='text' onClick={() => 设置重命名id(undefined)}>
                                {文案['通用.取消']}
                              </Button>
                            </div>
                            {重命名错误 && (
                              <p className='dragon-manager-field-error' role='alert'>
                                {重命名错误}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className='dragon-manager-goal-copy'>
                              <div className='dragon-manager-goal-title'>
                                {标记 ? (
                                  <Tag color={标记 === '橙武' ? 'orange' : 'purple'}>
                                    {武器类型显示(文案, 标记)}
                                  </Tag>
                                ) : null}
                                <strong>{目标.名称}</strong>
                                {聚焦 && (
                                  <span className='dragon-manager-focus-badge'>
                                    <CheckOutlined />
                                    {文案['管理弹窗.角标.当前目标']}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className='dragon-manager-goal-actions'>
                              {!聚焦 && (
                                <Button
                                  size='small'
                                  type='primary'
                                  danger
                                  onClick={() => 切换聚焦(目标.id)}
                                >
                                  {文案['通用.切换到该目标']}
                                </Button>
                              )}
                              <Button size='small' onClick={() => 编辑目标(目标.id)}>
                                {文案['通用.更新目标']}
                              </Button>
                              <Button
                                size='small'
                                onClick={() => {
                                  设置JSON文本(导出目标JSON(心法, 目标))
                                  设置JSON操作('导出')
                                }}
                              >
                                {文案['通用.导出目标']}
                              </Button>
                              <Dropdown
                                trigger={['click']}
                                menu={{
                                  items: [
                                    { key: 'rename', label: 文案['管理弹窗.菜单.重命名'] },
                                    { type: 'divider' },
                                    {
                                      key: 'delete',
                                      label: 文案['管理弹窗.菜单.删除'],
                                      danger: true,
                                    },
                                  ],
                                  onClick: ({ key }) => {
                                    if (key === 'rename') {
                                      设置重命名id(目标.id)
                                      设置重命名值(目标.名称)
                                      设置重命名错误('')
                                    } else if (key === 'delete') {
                                      设置待删除(目标)
                                    }
                                  },
                                }}
                              >
                                <Button
                                  type='text'
                                  size='small'
                                  icon={<MoreOutlined />}
                                  aria-label={填充文案(文案['管理弹窗.aria.更多操作'], {
                                    名称: 目标.名称,
                                  })}
                                />
                              </Dropdown>
                            </div>
                            <div className='dragon-manager-goal-cycle'>
                              <登阶循环选择
                                key={循环选择重置次数}
                                装备={目标.装备}
                                value={目标.循环}
                                onChange={(循环) => {
                                  if (
                                    !操作(() => {
                                      校验循环(目标.装备, 循环)
                                      用目标池((存储) => 存储.设置目标循环(目标.id, 循环))
                                    }, 文案['管理弹窗.提示.循环已保存'])
                                  )
                                    设置循环选择重置次数((次数) => 次数 + 1)
                                }}
                              />
                              <span className='dragon-manager-goal-date'>
                                {填充文案(文案['管理弹窗.日期.上次保存'], {
                                  日期: 记录日期(目标.时间),
                                })}
                              </span>
                              {循环失效(目标) ? (
                                <p className='dragon-manager-field-error' role='alert'>
                                  {文案['管理弹窗.循环失效']}
                                </p>
                              ) : !目标.循环 ? (
                                <p className='dragon-manager-muted'>
                                  {文案['管理弹窗.请选择循环']}
                                </p>
                              ) : null}
                            </div>
                          </>
                        )}
                      </article>
                    )
                  })}
              </div>
            ) : (
              <div className='dragon-manager-no-goals'>
                <strong>{文案['管理弹窗.空态.标题']}</strong>
                <p>{文案['管理弹窗.空态.说明']}</p>
              </div>
            )}
          </section>
        </div>
      </Modal>
      <Modal
        open={!!JSON操作}
        title={JSON操作 === '导入' ? 文案['通用.导入目标'] : 文案['通用.导出目标']}
        onCancel={() => 设置JSON操作(undefined)}
        onOk={导入目标}
        okText={文案['管理弹窗.导入.按钮.下一步']}
        cancelText={文案['通用.取消']}
        footer={JSON操作 === '导出' ? null : undefined}
        style={主题样式}
      >
        {JSON操作 === '导出' && (
          <Typography.Paragraph copyable={{ text: JSON文本 }}>
            {文案['管理弹窗.导入.复制JSON']}
          </Typography.Paragraph>
        )}
        <Input.TextArea
          aria-label={文案['管理弹窗.导入.aria.JSON']}
          placeholder={文案['管理弹窗.导入.占位.JSON']}
          rows={12}
          value={JSON文本}
          readOnly={JSON操作 === '导出'}
          onChange={(事件) => 设置JSON文本(事件.target.value)}
        />
      </Modal>
      <Modal
        open={!!待导入}
        title={文案['通用.导入目标']}
        width={440}
        onCancel={() => 设置待导入(undefined)}
        onOk={保存导入目标}
        okText={文案['管理弹窗.导入.按钮.确认']}
        cancelText={文案['通用.取消']}
        style={主题样式}
      >
        <p>{文案['管理弹窗.导入.说明']}</p>
        <Input
          aria-label={文案['管理弹窗.导入.aria.名称']}
          value={导入名称}
          onChange={(事件) => 设置导入名称(事件.target.value)}
          maxLength={40}
          showCount
          onPressEnter={保存导入目标}
        />
        {待导入 && (
          <登阶循环选择
            装备={待导入.装备}
            value={待导入.循环}
            onChange={(循环) => 设置待导入({ ...待导入, 循环 })}
          />
        )}
      </Modal>
      <Modal
        open={!!待删除}
        title={文案['管理弹窗.删除.标题']}
        width={420}
        onCancel={() => 设置待删除(undefined)}
        okText={文案['管理弹窗.删除.按钮.确认']}
        cancelText={文案['管理弹窗.删除.按钮.取消']}
        okButtonProps={{ danger: true }}
        style={主题样式}
        onOk={() => {
          if (
            待删除 &&
            操作(() => 用目标池((存储) => 存储.删除目标(待删除.id)), 文案['管理弹窗.提示.已删除'])
          )
            设置待删除(undefined)
        }}
      >
        <p className='dragon-manager-delete-name'>{待删除?.名称}</p>
        <p>
          {删除影响角色数 ? 填充文案(文案['管理弹窗.删除.影响'], { 数量: 删除影响角色数 }) : null}
          {文案['管理弹窗.删除.保留说明']}
        </p>
      </Modal>
    </ConfigProvider>
  )
}
