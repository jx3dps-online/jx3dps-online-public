import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button, Dropdown, Flex, Input, Modal, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import CycleSimulatorContext from '../../../../context'
import type { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'
import { 创建循环草稿存储 } from './存储'
import type { 草稿技能, 草稿列表, 循环草稿 as 循环草稿数据 } from './存储'

interface 草稿按钮属性 {
  心法: string
  技能基础数据: 循环基础技能数据类型[]
}

const 显示保存时间 = (时间: number) => new Date(时间).toLocaleString('zh-CN', { hour12: false })

function 草稿按钮({ 心法, 技能基础数据 }: 草稿按钮属性) {
  const { cycle, setCycle } = useContext(CycleSimulatorContext)
  const 存储 = useMemo(() => 创建循环草稿存储(心法), [心法])
  const [手动草稿, 设置手动草稿] = useState<草稿列表>(() => 存储.手动.读取())
  const [自动草稿, 设置自动草稿] = useState<草稿列表>(() => 存储.自动.读取())
  const [命名弹窗, 设置命名弹窗] = useState(false)
  const [草稿名称, 设置草稿名称] = useState('')
  const [命名错误, 设置命名错误] = useState('')
  const [弹窗, 弹窗容器] = Modal.useModal()
  const 当前内容 = useMemo(
    () =>
      JSON.stringify(
        cycle.map(({ 技能名称, 额外信息 }) => ({ 技能名称, 额外信息: 额外信息 || undefined })),
      ),
    [cycle],
  )
  const 最新内容 = useRef(当前内容)
  const 已保存内容 = useRef('[]')
  const 自动保存错误 = useRef('')

  useLayoutEffect(() => {
    最新内容.current = 当前内容
  }, [当前内容])

  const 自动保存 = useCallback(() => {
    const 内容 = 最新内容.current
    if (内容 === '[]' || 内容 === 已保存内容.current) return true
    try {
      存储.保存自动(JSON.parse(内容) as 草稿技能[])
      已保存内容.current = 内容
      自动保存错误.current = ''
      return true
    } catch (错误) {
      const 提示 = 错误 instanceof Error ? 错误.message : '草稿自动保存失败，请重试。'
      if (自动保存错误.current !== 提示) message.error(提示)
      自动保存错误.current = 提示
      return false
    }
  }, [存储])

  useEffect(() => {
    const 取消手动订阅 = 存储.手动.订阅(() => 设置手动草稿(存储.手动.读取()))
    const 取消自动订阅 = 存储.自动.订阅(() => 设置自动草稿(存储.自动.读取()))
    const 定时器 = window.setInterval(自动保存, 120000)
    const 离开页面 = () => {
      自动保存()
    }
    window.addEventListener('beforeunload', 离开页面)
    window.addEventListener('pagehide', 离开页面)
    return () => {
      window.clearInterval(定时器)
      window.removeEventListener('beforeunload', 离开页面)
      window.removeEventListener('pagehide', 离开页面)
      取消手动订阅()
      取消自动订阅()
      自动保存()
    }
  }, [存储, 自动保存])

  const 保存手动 = (名称: string, 内容: string) => {
    try {
      存储.保存手动(名称, JSON.parse(内容) as 草稿技能[])
      已保存内容.current = 内容
      设置命名弹窗(false)
      message.success('草稿已保存。')
      return true
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '草稿保存失败，请重试。')
      return false
    }
  }

  const 提交名称 = () => {
    const 名称 = 草稿名称.trim()
    if (!名称 || 名称.length > 40) {
      设置命名错误('草稿名称请填写 1 至 40 个字符。')
      return
    }
    const 内容 = 最新内容.current
    if (Object.prototype.hasOwnProperty.call(存储.手动.读取(), 名称)) {
      弹窗.confirm({
        title: '覆盖同名草稿？',
        content: `将替换「${名称}」中保存的技能序列。`,
        okText: '覆盖保存',
        cancelText: '取消',
        onOk: () => {
          保存手动(名称, 内容)
        },
      })
    } else {
      保存手动(名称, 内容)
    }
  }

  const 恢复草稿 = (草稿: 循环草稿数据) => {
    const 恢复序列: 循环基础技能数据类型[] = []
    for (const 技能 of 草稿.技能序列) {
      const 基础数据 = 技能基础数据.find((项) => 项.技能名称 === 技能.技能名称)
      if (!基础数据) {
        message.error(`当前心法找不到技能「${技能.技能名称}」，草稿未载入。`)
        return
      }
      恢复序列.push({
        ...基础数据,
        额外信息: 技能.额外信息 ? { ...技能.额外信息 } : undefined,
      })
    }
    if (!自动保存()) return
    const 内容 = JSON.stringify(草稿.技能序列)
    setCycle(恢复序列)
    最新内容.current = 内容
    已保存内容.current = 内容
    message.success('草稿已载入。')
  }

  const 删除草稿 = (类型: '手动' | '自动', 名称: string, 显示名: string) => {
    弹窗.confirm({
      title: '删除草稿？',
      content: 显示名,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        try {
          存储.删除(类型, 名称)
          message.success('草稿已删除。')
        } catch (错误) {
          message.error(错误 instanceof Error ? 错误.message : '草稿删除失败，请重试。')
        }
      },
    })
  }

  const 草稿菜单 = (类型: '手动' | '自动', 列表: 草稿列表): MenuProps['items'] => {
    const 条目 = Object.entries(列表).sort((a, b) => b[1].保存时间 - a[1].保存时间)
    if (!条目.length) return [{ key: 类型 + '-empty', label: '暂无草稿', disabled: true }]
    return 条目.map(([名称, 草稿]) => {
      const 显示名 =
        类型 === '手动' ? `${名称} · ${显示保存时间(草稿.保存时间)}` : 显示保存时间(Number(名称))
      return {
        key: 类型 + '-' + 名称,
        label: (
          <Flex align='center' justify='space-between' gap={12}>
            <span>{显示名}</span>
            <Button
              type='text'
              size='small'
              danger
              icon={<DeleteOutlined />}
              aria-label={'删除草稿：' + 显示名}
              onKeyDown={(事件) => {
                if (事件.key === 'Enter' || 事件.key === ' ') 事件.stopPropagation()
              }}
              onClick={(事件) => {
                事件.stopPropagation()
                删除草稿(类型, 名称, 显示名)
              }}
            />
          </Flex>
        ),
        onClick: () => 恢复草稿(草稿),
      }
    })
  }

  return (
    <>
      <Dropdown
        trigger={['hover']}
        onOpenChange={(打开) => {
          if (!打开) return
          设置手动草稿(存储.手动.读取())
          设置自动草稿(存储.自动.读取())
          const 错误 = 存储.手动.读取错误() || 存储.自动.读取错误()
          if (错误) message.warning(错误)
        }}
        menu={{
          items: [
            {
              key: 'save',
              label: '保存当前序列为草稿',
              disabled: !cycle.length,
              onClick: () => {
                设置草稿名称('')
                设置命名错误('')
                设置命名弹窗(true)
              },
            },
            { type: 'divider' },
            { key: 'manual', label: '手动草稿', children: 草稿菜单('手动', 手动草稿) },
            { key: 'auto', label: '自动草稿', children: 草稿菜单('自动', 自动草稿) },
          ],
        }}
      >
        <Button size='small'>草稿</Button>
      </Dropdown>
      <Modal
        title='保存草稿'
        open={命名弹窗}
        onCancel={() => 设置命名弹窗(false)}
        onOk={提交名称}
        okText='保存'
        cancelText='取消'
        okButtonProps={{ disabled: !cycle.length }}
        destroyOnClose
      >
        <Input
          aria-label='草稿名称'
          placeholder='输入草稿名称'
          value={草稿名称}
          maxLength={40}
          showCount
          status={命名错误 ? 'error' : undefined}
          onChange={(事件) => {
            设置草稿名称(事件.target.value)
            设置命名错误('')
          }}
          onPressEnter={提交名称}
        />
        {命名错误 && <p role='alert'>{命名错误}</p>}
      </Modal>
      {弹窗容器}
    </>
  )
}

export default function 循环草稿({ 技能基础数据 }: Pick<草稿按钮属性, '技能基础数据'>) {
  const { 名称 } = use心法数据()
  return <草稿按钮 key={名称} 心法={名称} 技能基础数据={技能基础数据} />
}
