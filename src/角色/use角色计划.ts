import { useMemo, useSyncExternalStore } from 'react'
import { 创建角色计划存储, 空计划 } from './计划'

/** 订阅某个角色的计划（目标/聚焦/历史/踏天），未指定角色时返回空计划。 */
export const use角色计划 = (角色id?: string) => {
  const 存储 = useMemo(() => (角色id ? 创建角色计划存储(角色id) : null), [角色id])
  const 订阅 = useMemo(() => (通知: () => void) => (存储 ? 存储.订阅(通知) : () => {}), [存储])
  const 读取 = useMemo(() => () => (存储 ? 存储.读取() : 空计划), [存储])
  const 计划 = useSyncExternalStore(订阅, 读取, () => 空计划)
  return { 计划, 存储, 读取错误: 存储?.读取错误() }
}
