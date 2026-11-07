import React, { useMemo, useState } from 'react'
import { Alert, Empty, Input, List, Modal, Spin, Tag } from 'antd'
import { 导入文档 } from './文档'
import { 预置攻略清单 } from './预置稿件/清单'
import type { 预置攻略项 } from './预置稿件/清单'
import type { 攻略文档 } from './类型'

/**
 * 从站内已有攻略（src/功能模块/攻略/心法）导入稿件。
 * 预置稿件由 node/生成攻略稿件/index.mjs 从 TSX 预先生成，这里只做选择与加载。
 */
export default function 导入面板({
  打开,
  关闭,
  选择,
  当前心法,
}: {
  打开: boolean
  关闭: () => void
  选择: (文档: 攻略文档) => void
  当前心法: string
}) {
  const [关键词, 设置关键词] = useState('')
  const [加载中, 设置加载中] = useState('')
  const [错误, 设置错误] = useState('')

  const 分组 = useMemo(() => {
    const 关键字 = 关键词.trim()
    const 过滤 = 预置攻略清单.filter(
      (项) => !关键字 || `${项.心法}${项.攻略名}${项.标题}`.includes(关键字),
    )
    const 表 = new Map<string, 预置攻略项[]>()
    过滤.forEach((项) => {
      if (!表.has(项.心法)) 表.set(项.心法, [])
      表.get(项.心法)!.push(项)
    })
    return [...表.entries()].sort((甲, 乙) => {
      if (甲[0] === 当前心法) return -1
      if (乙[0] === 当前心法) return 1
      return 甲[0].localeCompare(乙[0], 'zh-Hans-CN')
    })
  }, [关键词, 当前心法])

  const 点击 = async (项: 预置攻略项) => {
    设置错误('')
    设置加载中(`${项.心法}/${项.攻略名}`)
    try {
      const 模块 = await 项.加载()
      const 文档 = 导入文档(JSON.stringify(模块.default))
      选择(文档)
      关闭()
    } catch (异常) {
      设置错误(`「${项.心法}/${项.攻略名}」导入失败：${(异常 as Error).message}`)
    } finally {
      设置加载中('')
    }
  }

  return (
    <Modal
      title='导入现有攻略'
      open={打开}
      onCancel={关闭}
      footer={null}
      width={720}
      destroyOnHidden
    >
      <Alert
        type='info'
        showIcon
        style={{ marginBottom: 12 }}
        message='这里读取的是站内已发布的攻略（构建期从 TSX 生成），导入后可继续编辑并重新导出 TSX。'
      />
      <Input.Search
        allowClear
        placeholder='搜心法、攻略目录名或标题'
        value={关键词}
        onChange={(事件) => 设置关键词(事件.target.value)}
        style={{ marginBottom: 12 }}
      />
      {错误 && <Alert type='error' showIcon style={{ marginBottom: 12 }} message={错误} />}
      <div style={{ maxHeight: '56vh', overflowY: 'auto' }}>
        {!分组.length ? (
          <Empty description='没有匹配的攻略' />
        ) : (
          分组.map(([心法, 列表]) => (
            <div key={心法} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, padding: '6px 4px' }}>{心法}</div>
              <List
                size='small'
                dataSource={列表}
                renderItem={(项) => (
                  <List.Item
                    style={{ cursor: 'pointer', paddingInline: 8, borderRadius: 6 }}
                    onClick={() => void 点击(项)}
                    extra={
                      <span style={{ color: '#8c8c8c', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {项.块数} 块
                      </span>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          {加载中 === `${项.心法}/${项.攻略名}` ? <Spin size='small' /> : null}{' '}
                          {项.标题 || 项.攻略名}
                        </span>
                      }
                      description={
                        <span>
                          <Tag>{项.攻略名}</Tag>
                          <Tag color={项.模式 === '全屏' ? 'blue' : 'default'}>{项.模式}</Tag>
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
