import type { 数据模块类型 } from '@/store/data'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import type { 秒伤计算任务 } from './模拟退火'
import { 创建时间片让出器 } from '@/工具函数/help'

export interface 寻优计算上下文 {
  心法名称: string
  数据: 数据模块类型
  循环覆盖?: 计算循环覆盖类型
}

type 线程任务 = { 类型: '初始化'; 上下文: 寻优计算上下文 } | { 类型: '计算'; 任务: 秒伤计算任务[] }

export type 线程请求 = 线程任务 & { 序号: number }

export interface 线程响应 {
  序号: number
  秒伤?: number[]
  错误?: string
}

export const 获取计算线程数 = (
  比例: number,
  硬件线程数 = typeof navigator === 'undefined' ? 1 : navigator.hardwareConcurrency,
) => {
  if (比例 === 0) return 0
  const 可用 = Number.isFinite(硬件线程数) && 硬件线程数 > 0 ? Math.floor(硬件线程数) : 1
  return Math.min(可用, Math.max(1, Math.floor((可用 * 比例) / 100)))
}

export const 创建计算线程池 = (
  线程数: number,
  上下文: 寻优计算上下文,
  计算秒伤: (任务: 秒伤计算任务) => number,
  降级提示: (原因: string) => void,
) => {
  const 线程: Worker[] = []
  const 待响应 = new Map<
    number,
    {
      完成: (秒伤: number[]) => void
      失败: (原因: Error) => void
      定时器: ReturnType<typeof setTimeout>
    }
  >()
  let 序号 = 0
  let 初始化: Promise<void> | undefined
  let 已关闭 = false
  let 已降级 = false
  let 线程错误: Error | undefined
  const 让出主线程 = 创建时间片让出器()

  const 主线程计算 = async (任务: 秒伤计算任务[]) => {
    const 结果: number[] = []
    for (let i = 0; i < 任务.length; i++) {
      if (已关闭) throw new Error('计算线程池已关闭')
      结果.push(计算秒伤(任务[i]))
      if ((i + 1) % 16 === 0) await 让出主线程()
    }
    return 结果
  }

  const 清理 = () => {
    线程.forEach((项) => 项.terminate())
    线程.length = 0
    待响应.forEach(({ 失败, 定时器 }) => {
      clearTimeout(定时器)
      失败(new Error('计算线程已关闭'))
    })
    待响应.clear()
  }

  const 发送 = (项: Worker, 请求: 线程任务) =>
    new Promise<number[]>((完成, 失败) => {
      if (线程错误) {
        失败(线程错误)
        return
      }
      const 本次序号 = ++序号
      const 定时器 = setTimeout(() => {
        待响应.delete(本次序号)
        失败(new Error('计算线程响应超时'))
      }, 30000)
      待响应.set(本次序号, { 完成, 失败, 定时器 })
      项.postMessage({ ...请求, 序号: 本次序号 })
    })

  const 启动 = () => {
    初始化 ??= (async () => {
      for (let i = 0; i < 线程数; i++) {
        const 项 = new Worker(new URL('./计算worker.ts', import.meta.url))
        项.onmessage = ({ data }: MessageEvent<线程响应>) => {
          const 回调 = 待响应.get(data.序号)
          if (!回调) return
          待响应.delete(data.序号)
          clearTimeout(回调.定时器)
          if (data.错误) 回调.失败(new Error(data.错误))
          else if (Array.isArray(data.秒伤) && data.秒伤.every(Number.isFinite))
            回调.完成(data.秒伤)
          else 回调.失败(new Error('计算线程返回了无效结果'))
        }
        const 处理异常 = () => {
          线程错误 = new Error('计算线程执行失败')
          待响应.forEach(({ 失败, 定时器 }) => {
            clearTimeout(定时器)
            失败(线程错误!)
          })
          待响应.clear()
        }
        项.onerror = 处理异常
        项.onmessageerror = 处理异常
        线程.push(项)
      }
      await Promise.all(线程.map((项) => 发送(项, { 类型: '初始化', 上下文 })))
    })()
    return 初始化
  }

  return {
    批量计算秒伤: async (任务: 秒伤计算任务[]) => {
      if (已关闭) throw new Error('计算线程池已关闭')
      if (!线程数 || 已降级 || 任务.length < 16) return 主线程计算(任务)
      try {
        await 启动()
        const 每批数量 = Math.ceil(任务.length / 线程.length)
        const 批次: Promise<number[]>[] = []
        for (let i = 0; i < 线程.length && i * 每批数量 < 任务.length; i++) {
          const 本批 = 任务.slice(i * 每批数量, (i + 1) * 每批数量)
          批次.push(
            发送(线程[i], { 类型: '计算', 任务: 本批 }).then((结果) => {
              if (结果.length !== 本批.length) throw new Error('计算线程返回数量不符')
              return 结果
            }),
          )
        }
        return (await Promise.all(批次)).flat()
      } catch (错误) {
        清理()
        if (已关闭) throw 错误
        已降级 = true
        降级提示(错误 instanceof Error ? 错误.message : String(错误))
        return 主线程计算(任务)
      }
    },
    关闭: () => {
      已关闭 = true
      清理()
    },
  }
}
