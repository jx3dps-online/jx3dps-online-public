import { 精确生成 } from './精确生成'
import { 加载器灵运行时 } from './运行时'
import { 执行任务 } from '../工具/执行任务'
import type { 宏任务, 宏任务回复 } from '../类型'
import type { 生成日志, 生成进度, 生成任务 } from './类型'
import type { 候选交接, 生成线程输入, 生成线程输出 } from './任务协议'
import { 序列化任务错误 } from './任务协议'
import { 搜索存储 } from './原生生成/搜索存储'

let 任务id: string | undefined
let 暂停 = false
let 继续任务: (() => void) | undefined
let 上次让出 = performance.now()
let 请求序号 = 0
const 待回复 = new Map<number, { 解决: () => void; 拒绝: (错误: Error) => void }>()
const 发送 = (消息: 生成线程输出) => self.postMessage(消息)
const 等待继续 = async () => {
  const 起点 = performance.now()
  if (performance.now() - 上次让出 >= 16) {
    await new Promise((解决) => setTimeout(解决, 0))
    上次让出 = performance.now()
  }
  if (暂停) {
    发送({ 类型: '暂停状态', 任务id: 任务id!, 已暂停: true })
    await new Promise<void>((解决) => {
      继续任务 = 解决
    })
  }
  return (performance.now() - 起点) / 1000
}
const 交接 = (事件: 候选交接) => {
  const 请求id = ++请求序号
  return new Promise<void>((解决, 拒绝) => {
    待回复.set(请求id, { 解决, 拒绝 })
    try {
      发送({ 类型: '候选交接', 事件, 任务id: 任务id!, 请求id })
    } catch (错误) {
      待回复.delete(请求id)
      拒绝(错误 instanceof Error ? 错误 : new Error(String(错误)))
    }
  })
}
const 回放 = async (任务: 宏任务): Promise<Extract<宏任务回复, { 成功: true }>> => {
  await 等待继续()
  const 起点 = performance.now()
  const 回复 = await 执行任务(
    {
      ...任务,
      参数: structuredClone(任务.参数),
      当前循环: 任务.当前循环?.slice(),
    },
    等待继续,
  )
  if (!回复.成功) throw Object.assign(new Error(回复.错误), 回复)
  if (回复.耗时) {
    回复.耗时.线程启动毫秒 = 0
    回复.耗时.传输及调度毫秒 = 0
    回复.耗时.总耗时毫秒 = performance.now() - 起点
  }
  await 等待继续()
  return 回复
}
const 开始 = async (任务: 生成任务) => {
  const 存储 = new 搜索存储(任务id!)
  const 起点 = performance.now()
  const 日志: 生成日志[] = []
  const 记录 =
    process.env.NODE_ENV === 'development'
      ? (消息: Record<string, unknown>) => 日志.push({ 耗时毫秒: performance.now() - 起点, 消息 })
      : undefined
  const 发布 = (进度: 生成进度, 完成 = false) =>
    发送({ 类型: '进度', 任务id: 任务id!, 完成, 进度, 日志: 日志.splice(0) })
  try {
    发布({
      状态: '准备',
      轮数: 任务.起点?.轮数 ?? 0,
      目标数: 任务.请求.当前循环.length,
      匹配数: 0,
      宏: '',
      说明: '加载生成工具',
    })
    const 环境 = 加载器灵运行时(记录)
    const 结果 = await 精确生成(
      任务.请求,
      回放,
      发布,
      环境,
      等待继续,
      记录,
      () => false,
      任务.起点,
      交接,
      存储,
    )
    发布(结果, true)
  } catch (错误) {
    发送({
      类型: '进度',
      任务id: 任务id!,
      完成: true,
      错误: 序列化任务错误(错误),
      日志: 日志.splice(0),
    })
  } finally {
    await 存储.关闭()
  }
}

self.onmessage = (事件: MessageEvent<生成线程输入>) => {
  const 消息 = 事件.data
  if (消息.类型 === '开始') {
    if (任务id !== undefined) return
    任务id = 消息.任务id
    void 开始(消息.任务)
    return
  }
  if (消息.任务id !== 任务id) return
  if (消息.类型 === '控制') {
    暂停 = 消息.控制 === '暂停'
    if (!暂停) {
      继续任务?.()
      继续任务 = undefined
      发送({ 类型: '暂停状态', 任务id: 任务id!, 已暂停: false })
    }
    return
  }
  const 等待 = 待回复.get(消息.请求id)
  if (!等待) return
  待回复.delete(消息.请求id)
  if (消息.错误) 等待.拒绝(new Error(消息.错误))
  else 等待.解决()
}
