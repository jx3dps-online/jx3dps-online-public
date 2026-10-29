import React, { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FullLoading from '@/组件/FullLoading'
import 切心法Loading from '@/组件/切心法Loading'
import { 心法Provider } from '@/心法模块/心法上下文'
import { 简写转心法名 } from '@/心法模块/模块工具/获取心法数据'
import store from '@/store'
import { 加载当前角色 } from '@/store/data'
import { 重置背景图相关, 重新加载网页设置 } from '@/store/system'
import 获取当前数据, { 初始化心法数据, 获取当前心法名 } from '@/数据/数据工具/获取当前数据'
import type { 数据类型 } from '@/@types/数据'

const Dps = lazy(() => import('./dps'))

const 解析心法名 = (xf?: string) => {
  if (!xf || xf === 'undefined') return ''
  return 简写转心法名(xf) || ''
}

const 读取预加载心法 = (xf?: string): 数据类型 | null => {
  const 心法名 = 解析心法名(xf)
  if (!心法名) return null
  const 数据 = 获取当前数据(心法名)
  if (数据?.名称 === 心法名 && 获取当前心法名() === 心法名) return 数据
  return null
}

// 主页面：path 路由 /dps/:xf，SPA 切心法（不刷新）+ 心法上下文注入
// web 与本地打包（build:localWindows）共用，本地打包用 MemoryRouter 提供相同 path 路由。
function Web主页面() {
  const { xf } = useParams()
  const navigate = useNavigate()
  const 预加载数据 = 读取预加载心法(xf)
  const [心法数据, 设置心法数据] = useState<数据类型 | null>(预加载数据)
  const [加载中, 设置加载中] = useState(!预加载数据)
  const [目标心法名, 设置目标心法名] = useState<string>(解析心法名(xf))

  useEffect(() => {
    const 心法名 = 解析心法名(xf)
    if (!xf || !心法名) {
      设置加载中(false)
      设置心法数据(null)
      navigate('/')
      return
    }
    localStorage.setItem('最后访问心法', xf)

    设置目标心法名(心法名)

    // 首页切出已预加载完成：直接落地，不再走全屏 / 切心法 loading
    const 已预加载 = 读取预加载心法(xf)
    if (已预加载) {
      设置心法数据(已预加载)
      设置加载中(false)
      return
    }

    设置加载中(true)
    初始化心法数据(心法名)
      .then((数据) => {
        设置心法数据(数据)
        store.dispatch(加载当前角色())
        store.dispatch(重置背景图相关())
        store.dispatch(重新加载网页设置())
        设置加载中(false)
      })
      .catch((错误) => {
        console.error('初始化心法数据失败', 错误)
        navigate('/')
      })
  }, [xf])

  // 首屏首次加载：全屏 loading
  if (!心法数据) {
    return <FullLoading />
  }

  return (
    <心法Provider value={心法数据}>
      <Suspense fallback={<FullLoading />}>
        <Dps />
      </Suspense>
      {/* 切心法过渡：半透明遮罩 + 扫光条，保留旧心法页面在底下 */}
      {加载中 && <切心法Loading 目标心法名={目标心法名} />}
    </心法Provider>
  )
}

export default Web主页面
