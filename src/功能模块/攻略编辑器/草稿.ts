import { useCallback, useEffect, useRef, useState } from 'react'
import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 导入文档, 新建文档 } from './文档'
import type { 攻略文档 } from './类型'

export const 草稿键 = 获取缓存映射('凌海诀').攻略编辑器草稿
export const 布局键 = 获取缓存映射('凌海诀').攻略编辑器布局

export function use攻略草稿(心法: string) {
  const [初值] = useState(() => {
    try {
      const 原文 = localStorage.getItem(草稿键)
      return { 文档: 原文 ? 导入文档(原文, true) : 新建文档(心法), 原文, 错误: '' }
    } catch (错误) {
      return {
        文档: 新建文档(心法),
        原文: null,
        错误: `草稿未恢复：${(错误 as Error).message}。原数据已保留，请先下载备份再保存新稿。`,
      }
    }
  })
  const [文档, 设置文档] = useState(初值.文档)
  const [保存状态, 设置保存状态] = useState('已就绪')
  const [错误, 设置错误] = useState(初值.错误)
  const [历史版本, 更新历史] = useState(0)
  const 历史 = useRef({ 过去: [] as 攻略文档[], 未来: [] as 攻略文档[], 时间: 0 })
  const 当前 = useRef(文档)
  const 最后原文 = useRef(初值.原文)
  const 待保存 = useRef(false)
  const 暂停保存 = useRef(!!初值.错误)
  当前.current = 文档

  const 修改 = useCallback((更新: 攻略文档 | ((旧: 攻略文档) => 攻略文档), 独立 = true) => {
    const 新值 = typeof 更新 === 'function' ? 更新(当前.current) : 更新
    if (JSON.stringify(新值) === JSON.stringify(当前.current)) return
    const 现在 = Date.now()
    if (独立 || 现在 - 历史.current.时间 > 500) {
      历史.current.过去.push(当前.current)
      if (历史.current.过去.length > 40) 历史.current.过去.shift()
    }
    历史.current.未来 = []
    历史.current.时间 = 独立 ? 0 : 现在
    当前.current = 新值
    待保存.current = true
    设置保存状态('尚未保存')
    设置文档(新值)
    更新历史((值) => 值 + 1)
  }, [])

  const 撤销重做 = useCallback((重做 = false) => {
    const 来源 = 重做 ? 历史.current.未来 : 历史.current.过去
    const 目标 = 重做 ? 历史.current.过去 : 历史.current.未来
    const 值 = 来源.pop()
    if (!值) return
    目标.push(当前.current)
    当前.current = 值
    历史.current.时间 = 0
    待保存.current = true
    设置文档(值)
    设置保存状态('尚未保存')
    更新历史((值) => 值 + 1)
  }, [])

  const 保存 = useCallback((允许覆盖 = false) => {
    if (暂停保存.current && !允许覆盖) return
    try {
      const 已存 = localStorage.getItem(草稿键)
      if (!允许覆盖 && 已存 !== 最后原文.current)
        throw new Error('另一页面已修改草稿，请下载本页稿件或确认覆盖后再保存')
      const 原文 = JSON.stringify(当前.current)
      if (new Blob([原文]).size > 2 * 1024 * 1024) throw new Error('草稿超过 2 MiB，请精简后保存')
      localStorage.setItem(草稿键, 原文)
      最后原文.current = 原文
      待保存.current = false
      暂停保存.current = false
      设置错误('')
      设置保存状态('已保存到此浏览器')
    } catch (异常) {
      暂停保存.current = true
      设置错误(`未保存：${(异常 as Error).message}`)
      设置保存状态('保存失败')
    }
  }, [])

  useEffect(() => {
    if (!待保存.current) return
    const 定时 = window.setTimeout(() => 保存(), 600)
    return () => window.clearTimeout(定时)
  }, [文档, 保存])
  useEffect(() => {
    const 离开 = (事件: BeforeUnloadEvent) => {
      if (待保存.current) {
        事件.preventDefault()
        事件.returnValue = ''
      }
    }
    const 跨页 = (事件: StorageEvent) => {
      if (事件.key === 草稿键 || 事件.key === null) {
        暂停保存.current = true
        设置错误('另一页面的草稿发生变化。请先下载本页稿件，再选择重新加载或覆盖保存。')
      }
    }
    window.addEventListener('beforeunload', 离开)
    window.addEventListener('storage', 跨页)
    return () => {
      window.removeEventListener('beforeunload', 离开)
      window.removeEventListener('storage', 跨页)
    }
  }, [])
  return {
    文档,
    修改,
    保存,
    保存状态,
    错误,
    撤销重做,
    可撤销: !!历史.current.过去.length,
    可重做: !!历史.current.未来.length,
    历史版本,
  }
}
