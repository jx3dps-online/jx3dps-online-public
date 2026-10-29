import React, { useState } from 'react'
import { Input, Popover, Typography } from 'antd'
import { CodeOutlined } from '@ant-design/icons'
import type { 心法说明 } from '../类型'
import 样式 from './宏栏.module.less'

export default function 图标选择({
  图标,
  图标库,
  禁用,
  更新,
}: {
  图标: string
  图标库: 心法说明['图标库']
  禁用: boolean
  更新: (图标: string) => void
}) {
  const [展开, 设置展开] = useState(false)
  const [查询, 设置查询] = useState('')
  const 数字图标 = /^\d+$/.test(查询) ? 'https://icon.jx3box.com/icon/' + 查询 + '.png' : ''
  const 候选 = 图标库.filter(
    (项, 索引, 所有) =>
      项.名称.includes(查询) && 所有.findIndex((前项) => 前项.图标 === 项.图标) === 索引,
  )
  return (
    <Popover
      trigger='click'
      placement='bottomLeft'
      open={展开 && !禁用}
      onOpenChange={设置展开}
      content={
        <div className={样式.图标选择}>
          <Input
            aria-label='查询宏图标'
            placeholder='技能 / Buff / 奇穴名称，或图标 ID'
            value={查询}
            disabled={禁用}
            onChange={(事件) => 设置查询(事件.target.value)}
            allowClear
          />
          <div className={样式.图标列表}>
            {(数字图标 ? [{ 名称: '图标 ' + 查询, 图标: 数字图标 }] : 候选).map((项) => (
              <button
                key={项.图标}
                type='button'
                title={项.名称}
                aria-label={'选择图标：' + 项.名称}
                className={样式.图标选项}
                disabled={禁用}
                onClick={() => {
                  更新(项.图标)
                  设置展开(false)
                }}
              >
                <img src={项.图标} alt={项.名称} />
              </button>
            ))}
          </div>
          <Typography.Text type='secondary'>
            图标库来自当前心法的技能、Buff 和奇穴；图标 ID 可查询其他游戏图标。
          </Typography.Text>
        </div>
      }
    >
      <button
        type='button'
        className={样式.图标按钮}
        title='选择宏图标'
        aria-label='选择宏图标'
        aria-expanded={展开 && !禁用}
        disabled={禁用}
      >
        {图标 ? (
          <img className={样式.图标} src={图标} alt='当前宏图标' />
        ) : (
          <span className={样式.图标 + ' ' + 样式.占位图标}>
            <CodeOutlined />
          </span>
        )}
      </button>
    </Popover>
  )
}
