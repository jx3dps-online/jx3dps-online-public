import { useEffect, useSyncExternalStore } from 'react'

const 初始状态 = {
  技能详情打开: false,
  心法阈值打开: false,
  登阶显示: false,
  目标管理打开: false,
  目标命名打开: false,
  可沿用目标: '',
  模拟器打开: false,
  桌宠挂载: false,
  桌宠可用: false,
  桌宠显示: false,
  桌宠问题状态: '关闭' as '关闭' | '问题列表' | '答案',
  角色保存: { id: '', 次数: 0 },
  目标保存: { id: '', 次数: 0 },
}

export type 引导界面状态 = typeof 初始状态
let 当前状态 = 初始状态
const 订阅者 = new Set<() => void>()

function 更新状态<K extends keyof 引导界面状态>(键: K, 值: 引导界面状态[K]) {
  if (Object.is(当前状态[键], 值)) return
  当前状态 = { ...当前状态, [键]: 值 }
  订阅者.forEach((通知) => 通知())
}

export function use报告引导界面<K extends keyof 引导界面状态>(键: K, 值: 引导界面状态[K]) {
  useEffect(() => 更新状态(键, 值), [键, 值])
  useEffect(() => () => 更新状态(键, 初始状态[键]), [键])
}

export function 通知引导保存(类型: '角色保存' | '目标保存', id: string) {
  更新状态(类型, { id, 次数: 当前状态[类型].次数 + 1 })
}

const 订阅 = (通知: () => void) => {
  订阅者.add(通知)
  return () => {
    订阅者.delete(通知)
  }
}
const 获取状态 = () => 当前状态

export function use引导界面() {
  return useSyncExternalStore(订阅, 获取状态)
}
