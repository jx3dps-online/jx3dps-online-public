import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  MemoryRouter,
  Route,
  Routes,
  Navigate,
  useSearchParams,
} from 'react-router-dom'
import 异步内容 from './功能模块/功能说明/异步内容'
import FullLoading from './组件/FullLoading'
import { 简写转心法名 } from './心法模块/模块工具/获取心法数据'
import { 清理旧版本缓存 } from './工具函数/init/清理旧版本缓存'

清理旧版本缓存()

// 懒加载组件
const 登录 = React.lazy(() => import('./页面/登录/index'))
const 计算器 = React.lazy(() => import('./页面/计算器/index'))
const 加载功能说明页 = () => import('./页面/功能说明')
const 功能说明页 = () => <异步内容 加载={加载功能说明页} 参数={{}} />
const Haste = React.lazy(() => import('./页面/加速计算/index'))
const 攻略编辑器 = React.lazy(() => import('./页面/攻略编辑器'))
const 攻略编辑预览 = React.lazy(() => import('./页面/攻略编辑器/预览'))

import './style/base.css'

// 兼容旧 URL：/dps?xf=gfj → / 首页（保留 code/server/name 等其它 query 参数）
const 旧Dps重定向 = () => {
  const [searchParams] = useSearchParams()
  const 剩余参数 = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key !== 'xf') {
      剩余参数.set(key, value)
    }
  })
  const 剩余字符串 = 剩余参数.toString()

  // 标记「来自旧路由」，供计算器页提示用户重新收藏新地址。
  // 同时清除旧提示的「已关闭」状态：只要还在访问旧地址，就持续提醒更新收藏。
  useEffect(() => {
    localStorage.setItem('旧路由跳转标记', '1')
    localStorage.removeItem('旧路由收藏提示已关闭')
  }, [])

  return <Navigate to={剩余字符串 ? `/?${剩余字符串}` : '/'} replace />
}

const root = ReactDOM.createRoot(document.getElementById('root') as any)

const isLocalBuild = process.env.REACT_APP_BUILD_TYPE === 'local'

if (isLocalBuild) {
  // 本地打包：与 web 同一套路由（登录页 / dps / 加速），但用 MemoryRouter，
  // 路由状态存内存、不依赖真实 URL，打包成 HTML 后照常工作。
  // 初始路径：仅启动 query ?xf= 命中合法简写时直达该心法，否则落首页。
  const 查询简写 = new URLSearchParams(window?.location?.search || '').get('xf')
  const 启动心法简写 = 查询简写 && 简写转心法名(查询简写) ? 查询简写 : ''
  root.render(
    <MemoryRouter
      initialEntries={[
        new URLSearchParams(window.location.search).has('guide-preview')
          ? '/guide-editor/preview'
          : new URLSearchParams(window.location.search).has('guide-editor')
            ? '/guide-editor'
            : 启动心法简写
              ? `/dps/${启动心法简写}`
              : '/',
      ]}
    >
      <Routes>
        <Route
          path='/guide-editor'
          element={
            <Suspense fallback={<FullLoading />}>
              <攻略编辑器 />
            </Suspense>
          }
        />
        <Route
          path='/guide-editor/preview'
          element={
            <Suspense fallback={<FullLoading />}>
              <攻略编辑预览 />
            </Suspense>
          }
        />
        <Route
          path='/help'
          element={
            <Suspense fallback={<FullLoading />}>
              <功能说明页 />
            </Suspense>
          }
        />
        <Route
          path='/'
          element={
            <Suspense fallback={<FullLoading />}>
              <登录 />
            </Suspense>
          }
        />
        <Route
          path='/dps/:xf'
          element={
            <Suspense fallback={<FullLoading />}>
              <计算器 />
            </Suspense>
          }
        />
        <Route
          path='/haste'
          element={
            <Suspense fallback={<FullLoading />}>
              <Haste />
            </Suspense>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </MemoryRouter>,
  )
} else {
  root.render(
    <BrowserRouter>
      <Routes>
        <Route
          path='/guide-editor'
          element={
            <Suspense fallback={<FullLoading />}>
              <攻略编辑器 />
            </Suspense>
          }
        />
        <Route
          path='/guide-editor/preview'
          element={
            <Suspense fallback={<FullLoading />}>
              <攻略编辑预览 />
            </Suspense>
          }
        />
        <Route
          path='/help'
          element={
            <Suspense fallback={<FullLoading />}>
              <功能说明页 />
            </Suspense>
          }
        />
        <Route
          path='/'
          element={
            <Suspense fallback={<FullLoading />}>
              <登录 />
            </Suspense>
          }
        />
        <Route
          path='/dps/:xf'
          element={
            <Suspense fallback={<FullLoading />}>
              <计算器 />
            </Suspense>
          }
        />
        <Route path='/dps' element={<旧Dps重定向 />} />
        <Route
          path='/haste'
          element={
            <Suspense fallback={<FullLoading />}>
              <Haste />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>,
  )
}
