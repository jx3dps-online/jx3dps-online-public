import React, { useState } from 'react'
import { Button, Drawer, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { 攻略文档 } from './类型'
import { 组件目录 } from './组件定义'
import styles from './index.module.less'

export default function 内容导航({
  文档,
  目录显示,
  活动块,
  设置活动块,
  设置窄屏页,
  组件库,
  设置组件库,
  添加,
}: {
  文档: 攻略文档
  目录显示: boolean
  活动块?: string
  设置活动块: (id: string) => void
  设置窄屏页: (页: string) => void
  组件库: boolean
  设置组件库: (开: boolean) => void
  添加: (类型: string) => void
}) {
  const [搜索, 设置搜索] = useState('')
  return (
    <>
      {目录显示 && (
        <aside className={styles.目录}>
          <div className={styles.面板标题}>
            <strong>内容目录</strong>
            <Button
              size='small'
              type='text'
              icon={<PlusOutlined />}
              aria-label='添加内容块'
              onClick={() => 设置组件库(true)}
            />
          </div>
          <nav aria-label='攻略内容块'>
            {文档.blocks.map((块, i) => (
              <button
                key={块.id}
                className={块.id === 活动块 ? styles.选中目录 : ''}
                onClick={() => {
                  设置活动块(块.id)
                  设置窄屏页('编辑')
                }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <b>{组件目录[块.类型].名称}</b>
                  <small>
                    {String(块.文本 || 块.内容 || 块.名称 || '')
                      .replace(/<[^>]+>/g, '')
                      .slice(0, 28) || '点击编辑内容'}
                  </small>
                </div>
              </button>
            ))}
          </nav>
          <Button block type='dashed' icon={<PlusOutlined />} onClick={() => 设置组件库(true)}>
            添加内容块
          </Button>
          <p>
            内容仅保存到此浏览器
            <br />
            记得导出 JSON 留存
          </p>
        </aside>
      )}
      <Drawer title='添加内容块' open={组件库} onClose={() => 设置组件库(false)} width={360}>
        <Input.Search
          placeholder='搜索组件名称'
          value={搜索}
          onChange={(事件) => 设置搜索(事件.target.value)}
        />
        {['文字', '游戏', '媒体'].map((分类) => (
          <div key={分类} className={styles.组件分组}>
            <h3>{分类}</h3>
            {Object.entries(组件目录)
              .filter(([类型, 定义]) => 定义.分类 === 分类 && (类型 + 定义.名称).includes(搜索))
              .map(([类型, 定义]) => (
                <Button key={类型} onClick={() => 添加(类型)}>
                  {定义.名称}
                </Button>
              ))}
          </div>
        ))}
      </Drawer>
    </>
  )
}
