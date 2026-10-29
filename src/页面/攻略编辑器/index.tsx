import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  ConfigProvider,
  Drawer,
  Empty,
  message,
  Modal,
  Popconfirm,
  Segmented,
  Space,
  Tag,
} from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import 简写映射 from '@/心法模块/简写映射.json'
import { 确保心法数据已加载 } from '@/数据/数据工具/获取当前数据'
import type { 数据类型 } from '@/@types/数据'
import { 生成id } from '@/工具函数/本地存储'
import { 组件目录, 新建块 } from '@/功能模块/攻略编辑器/组件定义'
import { 导入文档, 新建文档, 心法列表 } from '@/功能模块/攻略编辑器/文档'
import { use攻略草稿, 布局键 } from '@/功能模块/攻略编辑器/草稿'
import 内容表单 from '@/功能模块/攻略编辑器/内容表单'
import 稿件设置 from '@/功能模块/攻略编辑器/稿件设置'
import 导出面板 from '@/功能模块/攻略编辑器/导出面板'
import 预览面板 from '@/功能模块/攻略编辑器/预览面板'
import 稿件操作 from '@/功能模块/攻略编辑器/稿件操作'
import 内容导航 from '@/功能模块/攻略编辑器/内容导航'
import styles from '@/功能模块/攻略编辑器/index.module.less'

export default function 攻略编辑器() {
  const 参数心法 = new URLSearchParams(window.location.search).get('xf') || ''
  const 初始心法 = 简写映射[参数心法] || (心法列表.includes(参数心法) ? 参数心法 : '凌海诀')
  const { 文档, 修改, 保存, 保存状态, 错误, 撤销重做, 可撤销, 可重做 } = use攻略草稿(初始心法)
  const [数据, 设置数据] = useState<数据类型>()
  const [加载错误, 设置加载错误] = useState('')
  const [活动块, 设置活动块] = useState(文档.blocks[0]?.id)
  const [设置打开, 设置设置打开] = useState(false)
  const [导出打开, 设置导出打开] = useState(false)
  const [组件库, 设置组件库] = useState(false)
  const [目录显示, 设置目录显示] = useState(true)
  const [窄屏页, 设置窄屏页] = useState('编辑')
  const [栏宽, 设置栏宽] = useState(() => {
    try {
      const 值 = Number(localStorage.getItem(布局键))
      return 值 >= 30 && 值 <= 70 ? 值 : 48
    } catch {
      return 48
    }
  })
  const 索引 = 文档.blocks.findIndex((块) => 块.id === 活动块)
  const 当前块 = 文档.blocks[索引]
  useEffect(() => {
    let 取消 = false
    设置数据(undefined)
    设置加载错误('')
    确保心法数据已加载(文档.心法)
      .then((值) => {
        if (!取消) 设置数据(值)
      })
      .catch((异常) => {
        if (!取消) 设置加载错误((异常 as Error).message)
      })
    return () => {
      取消 = true
    }
  }, [文档.心法])
  useEffect(() => {
    if (!文档.blocks.some((块) => 块.id === 活动块)) 设置活动块(文档.blocks[0]?.id)
  }, [文档.blocks, 活动块])
  useEffect(() => {
    const 旧标题 = document.title
    document.title = '攻略编辑器 · 剑网3配装计算器'
    const 键盘 = (事件: KeyboardEvent) => {
      if (
        事件.isComposing ||
        !(事件.ctrlKey || 事件.metaKey) ||
        !['z', 'y'].includes(事件.key.toLowerCase())
      )
        return
      事件.preventDefault()
      撤销重做(事件.key.toLowerCase() === 'y' || 事件.shiftKey)
    }
    window.addEventListener('keydown', 键盘)
    return () => {
      document.title = 旧标题
      window.removeEventListener('keydown', 键盘)
    }
  }, [撤销重做])
  const 添加 = (类型: string) => {
    if (文档.blocks.length >= 500) {
      message.warning('最多支持 500 个内容块')
      return
    }
    const 新块 = 新建块(类型)
    修改({
      ...文档,
      blocks: [...文档.blocks.slice(0, 索引 + 1), 新块, ...文档.blocks.slice(索引 + 1)],
    })
    设置活动块(新块.id)
    设置组件库(false)
  }
  const 移动 = (方向: number) => {
    const 列表 = [...文档.blocks]
    ;[列表[索引], 列表[索引 + 方向]] = [列表[索引 + 方向], 列表[索引]]
    修改({ ...文档, blocks: 列表 })
  }
  const 确认替换 = (动作: () => void) =>
    Modal.confirm({
      title: '替换当前稿件？',
      content: '当前内容可通过撤销恢复。建议先导出 JSON 留存。',
      okText: '继续',
      cancelText: '取消',
      onOk: 动作,
    })
  const 导入 = async (输入: File) => {
    try {
      if (输入.size > 2 * 1024 * 1024) throw new Error('稿件超过 2 MiB')
      const 内容 = 导入文档(await 输入.text(), true)
      确认替换(() => {
        修改(内容)
        设置活动块(内容.blocks[0]?.id)
        message.success('已导入攻略稿件')
      })
    } catch (异常) {
      message.error((异常 as Error).message)
    }
  }
  const 主题色 = 数据?.系统配置.主题色 || '#5d607b'
  return (
    <ConfigProvider theme={{ token: { colorPrimary: 主题色, borderRadius: 8 } }}>
      <div
        className={styles.工作台}
        style={
          {
            '--编辑器主题': 主题色,
            '--编辑栏': `${栏宽}fr`,
            '--预览栏': `${100 - 栏宽}fr`,
          } as React.CSSProperties
        }
      >
        <稿件操作
          新建={() => 确认替换(() => 修改(新建文档(文档.心法)))}
          导入={导入}
          导出={() => 设置导出打开(true)}
          保存={保存}
          保存状态={保存状态}
          错误={错误}
          可撤销={可撤销}
          可重做={可重做}
          撤销重做={撤销重做}
        />
        {加载错误 && <Alert type='error' message={`心法数据未加载：${加载错误}`} />}
        <div className={styles.稿件栏}>
          <Space>
            <Button
              type='text'
              aria-label='切换内容目录'
              icon={<MenuFoldOutlined />}
              onClick={() => 设置目录显示(!目录显示)}
            />
            <Tag>{文档.心法}</Tag>
            <strong>{文档.标题 || '未命名攻略'}</strong>
            <span>{文档.blocks.length} 个内容块</span>
          </Space>
          <Space>
            <label className={styles.栏宽}>
              编辑区{' '}
              <input
                aria-label='编辑与预览比例'
                type='range'
                min={30}
                max={70}
                value={栏宽}
                onChange={(事件) => {
                  const 值 = Number(事件.target.value)
                  设置栏宽(值)
                  try {
                    localStorage.setItem(布局键, String(值))
                  } catch {
                    message.warning('布局未保存，当前仍可继续编辑')
                  }
                }}
                onDoubleClick={() => 设置栏宽(48)}
              />
            </label>
            <Button icon={<SettingOutlined />} onClick={() => 设置设置打开(true)}>
              稿件设置
            </Button>
          </Space>
        </div>
        <div className={styles.窄屏切换}>
          <Segmented
            block
            options={['编辑', '预览']}
            value={窄屏页}
            onChange={(值) => 设置窄屏页(String(值))}
          />
        </div>
        <main className={`${styles.主体} ${!目录显示 ? styles.收起目录 : ''}`} data-mobile={窄屏页}>
          <内容导航
            文档={文档}
            目录显示={目录显示}
            活动块={活动块}
            设置活动块={设置活动块}
            设置窄屏页={设置窄屏页}
            组件库={组件库}
            设置组件库={设置组件库}
            添加={添加}
          />
          <section className={styles.编辑面板}>
            {当前块 ? (
              <>
                <header className={styles.面板标题}>
                  <Space>
                    <Tag>{索引 + 1}</Tag>
                    <strong>{组件目录[当前块.类型].名称}</strong>
                  </Space>
                  <Space size={2}>
                    <Button
                      type='text'
                      aria-label='上移'
                      icon={<ArrowUpOutlined />}
                      disabled={索引 === 0}
                      onClick={() => 移动(-1)}
                    />
                    <Button
                      type='text'
                      aria-label='下移'
                      icon={<ArrowDownOutlined />}
                      disabled={索引 === 文档.blocks.length - 1}
                      onClick={() => 移动(1)}
                    />
                    <Button
                      type='text'
                      aria-label='复制内容块'
                      icon={<CopyOutlined />}
                      onClick={() => {
                        if (文档.blocks.length >= 500) return
                        const 复制 = { ...JSON.parse(JSON.stringify(当前块)), id: 生成id() }
                        修改({
                          ...文档,
                          blocks: [
                            ...文档.blocks.slice(0, 索引 + 1),
                            复制,
                            ...文档.blocks.slice(索引 + 1),
                          ],
                        })
                        设置活动块(复制.id)
                      }}
                    />
                    <Popconfirm
                      title='删除这个内容块？可撤销恢复。'
                      onConfirm={() =>
                        修改({ ...文档, blocks: 文档.blocks.filter((块) => 块.id !== 当前块.id) })
                      }
                    >
                      <Button
                        danger
                        type='text'
                        aria-label='删除内容块'
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                </header>
                <div className={styles.表单区}>
                  <内容表单
                    key={当前块.id}
                    块={当前块}
                    数据={数据}
                    更新={(新值) =>
                      修改(
                        (旧) => ({
                          ...旧,
                          blocks: 旧.blocks.map((块) => (块.id === 新值.id ? 新值 : 块)),
                        }),
                        false,
                      )
                    }
                  />
                  <Button
                    type='dashed'
                    block
                    icon={<PlusOutlined />}
                    onClick={() => 设置组件库(true)}
                  >
                    在后面添加内容块
                  </Button>
                </div>
              </>
            ) : (
              <Empty description='从一个内容块开始写攻略'>
                <Button type='primary' onClick={() => 设置组件库(true)}>
                  添加内容块
                </Button>
              </Empty>
            )}
          </section>
          <预览面板 文档={文档} />
        </main>
        <Drawer title='稿件设置' open={设置打开} onClose={() => 设置设置打开(false)} width={440}>
          <稿件设置 文档={文档} 更新={(值) => 修改(值, false)} 数据={数据} />
        </Drawer>

        {导出打开 && <导出面板 文档={文档} 关闭={() => 设置导出打开(false)} />}
      </div>
    </ConfigProvider>
  )
}
