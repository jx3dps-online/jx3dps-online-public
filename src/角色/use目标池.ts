import { useMemo, useSyncExternalStore } from 'react'
import { 创建目标池存储, 空目标池 } from './目标池'

/** 订阅某个心法的目标池（同心的所有角色共享），未指定心法时返回空池。 */
export const use目标池 = (心法?: string) => {
  const 存储 = useMemo(() => (心法 ? 创建目标池存储(心法) : null), [心法])
  const 订阅 = useMemo(() => (通知: () => void) => (存储 ? 存储.订阅(通知) : () => {}), [存储])
  const 读取 = useMemo(() => () => (存储 ? 存储.读取() : 空目标池), [存储])
  const 池 = useSyncExternalStore(订阅, 读取, () => 空目标池)
  return { 池, 存储, 读取错误: 存储?.读取错误() }
}
