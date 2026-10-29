import {
  加载心法内置背景图,
  读取心法背景图选择,
} from '@/功能模块/系统工具/网页设置/背景图设置/工具函数'
import { 是否为本地背景图 } from '@/工具函数/本地背景图'
import store from '@/store'
import { 加载当前角色 } from '@/store/data'
import { 重置背景图相关, 重新加载网页设置 } from '@/store/system'
import { 初始化心法数据 } from '@/数据/数据工具/获取当前数据'

const 预载图片 = (src: string) => {
  if (!src || 是否为本地背景图(src)) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

/** 首页切出时并行预热计算器 chunk、心法数据和背景图，便于放大动画结束后直接落地 */
export const 预加载计算器页 = async (心法名: string) => {
  const [, , 内置背景] = await Promise.all([
    import('@/页面/计算器/index'),
    import('@/页面/计算器/dps'),
    加载心法内置背景图(心法名),
    初始化心法数据(心法名),
  ])
  const 选择 = 读取心法背景图选择(心法名)
  const 预载列表 = (选择.length ? 选择 : 内置背景).filter(Boolean).slice(0, 4)
  await Promise.all(预载列表.map(预载图片))
  store.dispatch(加载当前角色())
  store.dispatch(重置背景图相关())
  store.dispatch(重新加载网页设置())
}
