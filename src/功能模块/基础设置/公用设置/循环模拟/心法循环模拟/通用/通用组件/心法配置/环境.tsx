import React, { createContext, useRef } from 'react'
import type { Buff枚举 } from '../../通用框架/类型定义/Buff'

export interface 心法配置区域 {
  配置区?: React.ReactNode
  起手配置区?: React.ReactNode
  原始Buff数据: Buff枚举
  起手可选DOT?: string[]
}

export const 模拟器配置环境 = createContext<React.MutableRefObject<心法配置区域 | undefined>>({
  current: undefined,
})
export const 批量配置编辑 = createContext(false)

export function 模拟器配置环境提供器({ children }: { children: React.ReactNode }) {
  const 区域 = useRef<心法配置区域>()
  return <模拟器配置环境.Provider value={区域}>{children}</模拟器配置环境.Provider>
}

const 获取字段更新器 = (属性: Record<string, any>) => {
  const 更新器: Record<string, (值: any) => void> = {}
  for (const [键, 值] of Object.entries(属性)) {
    if (typeof 值 !== 'function') continue
    const 字段 = /^(?:更新|设置)(.+)$/.exec(键)?.[1]
    if (字段 && 字段 in 属性) 更新器[字段] = 值
  }
  if (typeof 属性.更新配置 === 'function') {
    for (const [键, 值] of Object.entries(属性)) {
      if (typeof 值 !== 'function' && 键 !== 'children')
        更新器[键] = (新值) => 属性.更新配置(键, 新值)
    }
  }
  return 更新器
}

export const 读取心法配置 = (节点: React.ReactNode, 应用值?: Record<string, any>) => {
  const 配置: Record<string, any> = {}
  React.Children.forEach(节点, (元素) => {
    if (!React.isValidElement<Record<string, any>>(元素)) return
    const 属性 = 元素.props
    for (const [字段, 更新] of Object.entries(获取字段更新器(属性))) {
      配置[字段] = 属性[字段]
      if (应用值 && Object.prototype.hasOwnProperty.call(应用值, 字段)) 更新(应用值[字段])
    }
    Object.assign(配置, 读取心法配置(属性.children, 应用值))
  })
  return 配置
}

export const 复用心法配置 = (
  节点: React.ReactNode,
  配置: Record<string, any>,
  更新配置: (值: Record<string, any>) => void,
): React.ReactNode =>
  React.Children.map(节点, (元素) => {
    if (!React.isValidElement<Record<string, any>>(元素)) return 元素
    const 属性 = 元素.props
    const 更新器 = 获取字段更新器(属性)
    const 局部属性: Record<string, any> = {}
    // 只携带已配对的字段更新器，其他动作不得调用主模拟器的回调。
    for (const [键, 值] of Object.entries(属性)) {
      if (typeof 值 === 'function') 局部属性[键] = undefined
      const 字段 = /^(?:更新|设置)(.+)$/.exec(键)?.[1]
      if (字段 && 更新器[字段]) 局部属性[键] = (值) => 更新配置({ [字段]: 值 })
    }
    for (const 字段 of Object.keys(更新器)) {
      if (Object.prototype.hasOwnProperty.call(配置, 字段)) 局部属性[字段] = 配置[字段]
    }
    if (typeof 属性.更新配置 === 'function') 局部属性.更新配置 = (键, 值) => 更新配置({ [键]: 值 })
    if (属性.children) 局部属性.children = 复用心法配置(属性.children, 配置, 更新配置)
    return React.cloneElement(元素, 局部属性)
  })

export const 获取模拟参数配置 = (参数: Record<string, any>) => {
  const 公共字段 = new Set([
    '测试循环',
    '加速值',
    '网络延迟',
    '奇穴',
    '秘籍',
    '大橙武模拟',
    '启用团队增益快照',
    '团队增益轴',
    '副本事件实例列表',
    '起手Buff配置',
    '武器装备',
    '武器切换功能启用',
    '斩杀开始帧',
  ])
  return Object.fromEntries(Object.entries(参数).filter(([键]) => !公共字段.has(键)))
}
