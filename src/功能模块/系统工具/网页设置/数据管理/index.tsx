import React, { useMemo, useState } from 'react'
import { App, Button, Checkbox, Modal, Progress, Tag, message } from 'antd'
import 数据迁移 from '@/功能模块/系统工具/页面右下角工具/数据迁移'
import { 旧缓存匹配 } from '@/工具函数/init/清理旧版本缓存'
import 设置项 from '../设置项'

/** 浏览器 localStorage 常规上限按 5MB 字符计，仅用于占用进度展示。 */
const 本地存储上限 = 5 * 1024 * 1024

const 格式化体积 = (字符数: number) =>
  字符数 >= 1024 * 1024
    ? (字符数 / 1024 / 1024).toFixed(2) + ' MB'
    : Math.max(1, Math.round(字符数 / 1024)) + ' KB'

const 统计占用 = () => {
  let 总占用 = 0
  const 键列表: { 键: string; 占用: number }[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const 键 = localStorage.key(i)
      if (!键) continue
      const 占用 = (localStorage.getItem(键)?.length || 0) + 键.length
      总占用 += 占用
      键列表.push({ 键, 占用 })
    }
  } catch {
    return { 总占用: 0, 键列表: [] }
  }
  return { 总占用, 键列表: 键列表.sort((a, b) => b.占用 - a.占用) }
}

function 数据管理() {
  const { modal } = App.useApp()
  const [占用版本, 刷新占用] = useState(0)
  const [数据迁移弹窗, 设置数据迁移弹窗] = useState(false)
  const [明细弹窗, 设置明细弹窗] = useState(false)
  const [选中键, 设置选中键] = useState<string[]>([])
  const 占用 = useMemo(() => 统计占用(), [占用版本])
  const 旧缓存 = 占用.键列表.filter((项) => 旧缓存匹配(项.键))
  const 旧缓存占用 = 旧缓存.reduce((和, 项) => 和 + 项.占用, 0)
  const 使用率 = Math.min(100, (占用.总占用 / 本地存储上限) * 100)
  const 全部选中 = 占用.键列表.length > 0 && 选中键.length === 占用.键列表.length

  const 清理旧缓存 = () =>
    modal.confirm({
      title: `清理 ${旧缓存.length} 条旧版本缓存？`,
      content: `约 ${格式化体积(旧缓存占用)}，包含已废弃的旧方案、登龙长阶和引导记录，清理不影响当前角色、自定义循环与目标。`,
      okText: '清理',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        旧缓存.forEach((项) => localStorage.removeItem(项.键))
        刷新占用((版本) => 版本 + 1)
      },
    })

  const 切换选中 = (键: string, 选中: boolean) =>
    设置选中键((旧) => (选中 ? [...旧, 键] : 旧.filter((项) => 项 !== 键)))

  const 删除所选 = () => {
    选中键.forEach((键) => localStorage.removeItem(键))
    message.success(`已清理 ${选中键.length} 项缓存。`)
    设置选中键([])
    设置明细弹窗(false)
    刷新占用((版本) => 版本 + 1)
  }

  const 打开明细 = () => {
    设置选中键([])
    设置明细弹窗(true)
  }

  return (
    <>
      <设置项
        标题='存储占用'
        说明={`浏览器本地缓存常规上限约 ${格式化体积(本地存储上限)}，超过后新数据将无法保存。`}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            percent={Number(使用率.toFixed(1))}
            status={使用率 >= 90 ? 'exception' : 'normal'}
            format={() => `${格式化体积(占用.总占用)} / ${格式化体积(本地存储上限)}`}
            style={{ width: 300, marginRight: 12 }}
          />
          <Button onClick={() => 刷新占用((版本) => 版本 + 1)}>刷新</Button>
          <Button style={{ marginLeft: 8 }} disabled={!占用.键列表.length} onClick={打开明细}>
            定向清理
          </Button>
        </div>
      </设置项>
      <设置项
        标题='清理旧版本缓存'
        说明={
          旧缓存.length
            ? `检测到 ${旧缓存.length} 条已废弃缓存，约 ${格式化体积(旧缓存占用)}`
            : '没有检测到旧版本缓存'
        }
      >
        <Button danger disabled={!旧缓存.length} onClick={清理旧缓存}>
          清理旧缓存
        </Button>
      </设置项>
      <设置项 标题='数据迁移' 说明='下载或导入本地数据，用于换域名、换设备时迁移配装。'>
        <Button onClick={() => 设置数据迁移弹窗(true)}>数据迁移</Button>
      </设置项>
      <数据迁移 open={数据迁移弹窗} onCancel={() => 设置数据迁移弹窗(false)} />
      <Modal
        title='缓存明细 · 定向清理'
        open={明细弹窗}
        onCancel={() => 设置明细弹窗(false)}
        onOk={删除所选}
        okText={`删除所选（${选中键.length}）`}
        okButtonProps={{ danger: true, disabled: !选中键.length }}
        cancelText='取消'
        width={720}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Checkbox
            checked={全部选中}
            indeterminate={选中键.length > 0 && !全部选中}
            onChange={(事件) =>
              设置选中键(事件.target.checked ? 占用.键列表.map((项) => 项.键) : [])
            }
          >
            全选（{占用.键列表.length} 项 · {格式化体积(占用.总占用)}）
          </Checkbox>
          <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 12 }}>
            勾选后点「删除所选」，删除后不可恢复
          </span>
        </div>
        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {占用.键列表.map((项) => (
            <div
              key={项.键}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <Checkbox
                checked={选中键.includes(项.键)}
                onChange={(事件) => 切换选中(项.键, 事件.target.checked)}
              >
                <span style={{ wordBreak: 'break-all' }}>
                  {项.键}
                  {旧缓存匹配(项.键) ? (
                    <Tag color='red' style={{ marginLeft: 6 }}>
                      旧缓存
                    </Tag>
                  ) : null}
                </span>
              </Checkbox>
              <span
                style={{
                  color: 'rgba(0, 0, 0, 0.45)',
                  fontSize: 12,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                {格式化体积(项.占用)}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default 数据管理
