import React, { useEffect, useMemo, useState } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Button, ConfigProvider } from 'antd'
import { 心法Provider } from '@/心法模块/心法上下文'
import { 攻略展示上下文 } from '@/功能模块/攻略/展示上下文'
import * as 组件 from '@/功能模块/攻略/components'
import { 获取角色默认基础属性, 默认网页设置, 默认团队增益轴 } from '@/工具函数/init/默认数据'
import type { 数据类型 } from '@/@types/数据'
import type { RootState } from '@/store'
import type { 攻略文档, 内容节点 } from './类型'
import { 构建正文 } from './文档'
import styles from './index.module.less'

function 内存状态(文档: 攻略文档, 数据: 数据类型): RootState {
  const 循环 = 数据.计算循环.find((项) => 项.名称 === 文档.预览循环)
  const 基础属性 = 获取角色默认基础属性()
  return {
    data: {
      角色更新时间: 0,
      角色基础属性: 基础属性,
      装备信息: {
        装备基础属性: 基础属性,
        装备镶嵌附魔属性: 基础属性,
        装备列表: [],
        五彩石: '',
        装备增益: {},
      },
      当前计算循环名称: 循环?.名称 || '',
      当前输出计算目标名称: '',
      当前计算结果: { 秒伤: 0, 总伤: 0, 秒伤计算时间: 0, 计算结果技能列表: [] },
      网络延迟: 0,
      当前奇穴信息: 循环?.奇穴 || [],
      当前秘籍信息: 循环?.秘籍 || {},
      自定义循环列表: [],
      增益数据: { 阵眼: '', 小吃: [], 团队增益: [] },
      增益启用: false,
      特殊配置: {},
      团队增益轴: 默认团队增益轴,
      副本事件方案列表: [],
    },
    system: {
      增益面板显示状态: false,
      背景图片显示状态: false,
      背景图选择: [],
      自定义背景图: [],
      新手引导流程状态: false,
      当前引导步骤: 0,
      配装器弹窗显示状态: false,
      网页设置: 默认网页设置,
    },
  }
}

const 渲染 = (项: 内容节点 | string, key: string): React.ReactNode => {
  if (typeof 项 === 'string') return 项
  const 类型 = (组件[项.标签] || 项.标签) as React.ElementType
  return React.createElement(
    类型,
    { ...项.属性, key },
    项.子?.map((子, i) => 渲染(子, `${key}-${i}`)),
  )
}

export default function 预览内容({ 文档, 数据 }: { 文档: 攻略文档; 数据: 数据类型 }) {
  const [计算结果节点, 设置计算结果节点] = useState<HTMLDivElement | null>(null)
  const [显示, 设置显示] = useState(true)
  useEffect(() => 设置显示(true), [文档.模式])
  const 状态 = useMemo(
    () => configureStore({ reducer: (值 = 内存状态(文档, 数据)) => 值 }),
    [数据, 文档.预览循环],
  )
  const 正文 = 构建正文(文档)
  return (
    <ConfigProvider theme={{ token: { colorPrimary: 数据.系统配置.主题色 } }}>
      <心法Provider value={数据}>
        <Provider store={状态}>
          <div ref={设置计算结果节点} className={styles.结果参考面板} />
          <攻略展示上下文.Provider
            value={{ 只读预览: true, 默认全屏: true, 计算结果节点, 关闭: () => 设置显示(false) }}
          >
            {显示 ? (
              <组件.攻略容器 key={文档.模式} 标题={文档.标题 || '未命名攻略'} 模式={文档.模式}>
                <组件.攻略正文 心法={文档.心法}>
                  {正文.map((项, i) => 渲染(项, i === 0 ? '来源' : 文档.blocks[i - 1].id))}
                </组件.攻略正文>
              </组件.攻略容器>
            ) : (
              <Button onClick={() => 设置显示(true)}>重新打开攻略</Button>
            )}
          </攻略展示上下文.Provider>
        </Provider>
      </心法Provider>
    </ConfigProvider>
  )
}
