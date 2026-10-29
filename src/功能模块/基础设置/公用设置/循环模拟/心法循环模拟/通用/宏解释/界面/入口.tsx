import React, { lazy, Suspense } from 'react'
import type { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'
import 样式 from './宏栏.module.less'

const 宏栏 = lazy(() => import('./宏栏'))

export interface 宏入口属性 {
  心法: string
  参数: Record<string, unknown>
  技能数据: 循环基础技能数据类型[]
  当前循环: 循环基础技能数据类型[]
  更新循环: (循环: 循环基础技能数据类型[]) => void
  children: React.ReactNode
}

export default function 宏入口({ children, ...属性 }: 宏入口属性) {
  return (
    <div className={`${样式.技能栏} ${属性.心法 === '冰心诀' ? 样式.冰心技能栏 : ''}`}>
      <div className={样式.原技能}>{children}</div>
      <Suspense fallback={null}>
        <宏栏 {...属性} />
      </Suspense>
    </div>
  )
}
