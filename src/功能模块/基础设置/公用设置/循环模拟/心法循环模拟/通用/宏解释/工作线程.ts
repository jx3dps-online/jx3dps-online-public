import type { 宏任务 } from './类型'
import { 执行任务 } from './工具/执行任务'
export { 执行任务 } from './工具/执行任务'

self.onmessage = async (事件: MessageEvent<宏任务>) => {
  self.onmessage = null
  self.postMessage(await 执行任务(事件.data))
}
self.postMessage({ 类型: '就绪' })
