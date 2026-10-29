import { 宏任务, 宏任务回复 } from '../类型'

export const 创建宏任务 = (任务: 宏任务, 超时 = 60000) => {
  const 起点 = performance.now()
  const 工作线程 = new Worker(new URL('../工作线程.ts', import.meta.url))
  let 已结束 = false
  let 拒绝任务: (错误: Error) => void
  let 定时器: ReturnType<typeof setTimeout> | undefined
  const 完成 = () => {
    已结束 = true
    clearTimeout(定时器)
    工作线程.terminate()
  }
  const 结果 = new Promise<Extract<宏任务回复, { 成功: true }>>((解决, 拒绝) => {
    拒绝任务 = 拒绝
    if (超时 > 0)
      定时器 = setTimeout(() => {
        完成()
        拒绝(
          Object.assign(new Error('宏任务超过 ' + 超时 / 1000 + ' 秒，已停止'), {
            类型: 'resource_exhausted',
            原因: '回放超时',
          }),
        )
      }, 超时)
    工作线程.onmessage = (事件: MessageEvent<宏任务回复 | { 类型: '就绪' }>) => {
      if ('类型' in 事件.data && 事件.data.类型 === '就绪') return
      const 回复 = 事件.data as 宏任务回复
      if (process.env.NODE_ENV === 'development')
        console.debug(
          '[宏任务耗时]',
          JSON.stringify({
            类型: 任务.类型,
            心法: 任务.心法,
            总耗时毫秒: performance.now() - 起点,
            回放耗时毫秒: 回复.成功 ? 回复.结果?.用时毫秒 : undefined,
            记录数: 回复.成功 ? 回复.结果?.轨迹.length : undefined,
          }),
        )
      完成()
      if (回复.成功) 解决(回复)
      else 拒绝(Object.assign(new Error(回复.错误), 回复))
    }
    工作线程.onerror = (事件) => {
      完成()
      拒绝(new Error(事件.message || '宏运行 Worker 执行失败'))
    }
    工作线程.onmessageerror = () => {
      完成()
      拒绝(new Error('宏回放消息无法完整接收'))
    }
    try {
      工作线程.postMessage(任务)
    } catch (错误) {
      完成()
      拒绝(错误 instanceof Error ? 错误 : new Error(String(错误)))
    }
  })
  return {
    结果,
    取消: () => {
      if (已结束) return
      完成()
      拒绝任务(Object.assign(new Error('任务已取消'), { 类型: 'cancelled' }))
    },
  }
}
