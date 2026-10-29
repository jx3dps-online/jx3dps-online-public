import type { 生成任务, 生成进度 } from './类型'
import { 生成结果可应用 } from './结果校验'
import { 删除搜索存储 } from './原生生成/搜索存储'
import {
  候选文本哈希,
  序列化任务错误,
  获取认证冲突,
  type 生成任务快照,
  type 生成线程输入,
  type 生成线程输出,
  type 生成任务诊断,
} from './任务协议'

type 线程句柄 = Pick<
  Worker,
  'postMessage' | 'terminate' | 'onmessage' | 'onerror' | 'onmessageerror'
>

// 模拟与压缩共用一个 Worker；取消直接终止线程，不等待计算让出事件循环。
export const 创建生成任务 = (
  任务: 生成任务,
  通知: (快照: 生成任务快照) => void,
  依赖: { 创建线程?: () => 线程句柄 } = {},
) => {
  const 任务id = crypto.randomUUID()
  let 线程: 线程句柄 | undefined
  let 已结束 = false
  let 最后认证进度: 生成进度 | undefined
  const 已采纳进度 = new Map<string, 生成进度>()
  let 快照: 生成任务快照 = {
    完成: false,
    暂停状态: '运行',
    诊断: {
      格式: 'macro-task-evidence-v2',
      任务id,
      构建: process.env.REACT_APP_MACRO_BUILD_SHA || 'unknown',
      请求: 任务,
      候选: {},
      交接完整: true,
    },
  }
  const 发布 = () => 通知(快照)
  const 保留引用 = (诊断: 生成任务诊断) => {
    const 引用 = new Set([
      诊断.正在执行,
      诊断.历史最佳,
      诊断.最近回放,
      诊断.最后失败,
      诊断.最后认证,
      ...(诊断.已采纳 ?? []),
      ...(诊断.认证冲突 ?? []).map((项) => 项.候选.id),
    ])
    return {
      ...诊断,
      候选: Object.fromEntries(Object.entries(诊断.候选).filter(([id]) => 引用.has(id))),
    }
  }
  const 发送 = (消息: 生成线程输入) => 线程!.postMessage(消息)
  const 关闭 = () => {
    已结束 = true
    window.removeEventListener('pagehide', 取消)
    线程?.terminate()
    线程 = undefined
    void 删除搜索存储(任务id).catch((错误) => console.warn('宏搜索临时数据清理失败', 错误))
  }
  const 失败 = (错误: unknown) => {
    if (已结束) return
    const 信息 = 序列化任务错误(错误)
    const 原始错误 = 信息.消息
    const 保留进度 = 最后认证进度 ?? 快照.进度
    关闭()
    快照 = {
      ...快照,
      完成: true,
      暂停状态: '运行',
      错误: 原始错误,
      进度: 保留进度 && {
        ...保留进度,
        状态: 最后认证进度 ? '成功' : '错误',
        说明: 最后认证进度 ? '任务中断，保留最后已认证宏' : '生成失败',
      },
      诊断: {
        ...快照.诊断,
        原始错误,
        错误详情: 信息,
        最后失败: 快照.诊断.正在执行 ?? 快照.诊断.最后失败,
        结束原因:
          信息.类型 === 'resource_exhausted'
            ? 'resource_exhausted'
            : 信息.类型 === 'cancelled'
              ? 'cancelled'
              : 'fatal_error',
      },
    }
    发布()
  }
  const 接收 = async (消息: 生成线程输出) => {
    if (已结束 || 消息.任务id !== 任务id) return
    if (消息.类型 === '候选交接') {
      const { 候选, 证据, 错误 } = 消息.事件
      const 字节 = new TextEncoder().encode(候选.文本)
      const 实际哈希 = await 候选文本哈希(候选.文本)
      if (已结束) return
      if (
        候选.UTF16字符 !== 候选.文本.length ||
        候选.UTF8字节 !== 字节.length ||
        候选.行数 !== 候选.文本.split(/\r\n|\n|\r/).length ||
        实际哈希 !== 候选.id
      ) {
        快照 = {
          ...快照,
          诊断: {
            ...快照.诊断,
            交接完整: false,
            正在执行: undefined,
            最后失败: 实际哈希,
            候选: {
              ...快照.诊断.候选,
              [实际哈希]: {
                记录: { ...候选, id: 实际哈希 },
                证据: { 传输声明: 候选 },
                错误: '候选交接完整性校验失败',
              },
            },
          },
        }
        throw new Error('候选交接完整性校验失败')
      }
      const 已有 = 快照.诊断.候选[候选.id]
      const 诊断 = {
        ...快照.诊断,
        候选: {
          ...快照.诊断.候选,
          [候选.id]: {
            ...已有,
            记录: 候选,
            证据,
            错误,
            ...(['candidate_certified', 'candidate_accepted'].includes(消息.事件.类型)
              ? { 认证: { 记录: 候选, 证据 } }
              : {}),
          },
        },
      }
      if (消息.事件.类型 === 'candidate_started') 诊断.正在执行 = 候选.id
      else if (
        消息.事件.类型 === 'candidate_certified' ||
        消息.事件.类型 === 'candidate_accepted'
      ) {
        诊断.最后认证 = 候选.id
        if (消息.事件.类型 === 'candidate_accepted') {
          const 进度 = 消息.事件.进度
          if (
            !进度 ||
            !生成结果可应用(进度) ||
            进度.宏 !== 候选.文本 ||
            进度.认证!.期望.candidate_hash !== 候选.id ||
            进度.认证!.期望.contract_id !== 候选.上下文
          )
            throw new Error('已采纳候选缺少绑定当前原文与合同的完整认证')
          if (诊断.认证冲突?.some((项) => 项.候选.id === 候选.id && 项.候选.上下文 === 候选.上下文))
            throw new Error('同一任务内已被完整回放否定的候选不能重新采纳')
          已采纳进度.delete(候选.id)
          已采纳进度.set(候选.id, 进度)
          最后认证进度 = 进度
          诊断.已采纳 = [...已采纳进度.keys()]
        }
      } else if (消息.事件.类型 === 'candidate_revoked') {
        const 冲突 = 消息.事件.冲突
        if (
          !冲突 ||
          冲突.原证据.contract_id !== 候选.上下文 ||
          冲突.原证据.candidate_hash !== 候选.id ||
          获取认证冲突(冲突.原证据, 冲突.新证据) !== 冲突.原因
        )
          throw new Error('证书撤销缺少绑定当前候选的完整冲突证据')
        诊断.认证冲突 = [...(诊断.认证冲突 ?? []), { 候选, ...冲突 }]
        诊断.最后失败 = 候选.id
        const 已采纳 = 已采纳进度.get(候选.id)
        if (已采纳?.认证?.期望.contract_id === 候选.上下文) 已采纳进度.delete(候选.id)
        最后认证进度 = [...已采纳进度.values()].pop()
        诊断.已采纳 = [...已采纳进度.keys()]
        if (快照.进度?.宏 === 候选.文本 && 快照.进度.认证?.期望.contract_id === 候选.上下文)
          快照 = { ...快照, 进度: 最后认证进度 ?? { ...快照.进度, 已认证: false, 认证: undefined } }
      } else {
        诊断.最近回放 = 候选.id
        const 比较 = (证据 as { comparison?: { reproduced?: boolean } } | undefined)?.comparison
        if (错误 || 比较?.reproduced === false) 诊断.最后失败 = 候选.id
        if (诊断.正在执行 === 候选.id) 诊断.正在执行 = undefined
      }
      快照 = { ...快照, 诊断: 保留引用(诊断), 进度: 消息.事件.进度 ?? 快照.进度 }
      // 全文已经归主线程持有且经过哈希检查，再确认允许 Worker 继续。
      发布()
      发送({ 类型: '交接确认', 任务id, 请求id: 消息.请求id })
      return
    }
    if (消息.类型 === '暂停状态') {
      快照 = { ...快照, 暂停状态: 消息.已暂停 ? '已暂停' : '运行' }
      发布()
      return
    }
    for (const 项 of 消息.日志 ?? []) console.info('[宏生成日志]', JSON.stringify(项))
    if (消息.进度) {
      const 最佳 = Object.values(快照.诊断.候选).find((项) => 项.记录.文本 === 消息.进度!.宏)
      快照 = {
        ...快照,
        进度: 消息.进度,
        诊断: 保留引用({ ...快照.诊断, 历史最佳: 最佳?.记录.id ?? 快照.诊断.历史最佳 }),
      }
    }
    if (消息.错误) return 失败(Object.assign(new Error(消息.错误.消息), 消息.错误))
    if (消息.完成) {
      const 结束事实 = 快照.进度?.结束事实
      const 停止 = 结束事实?.压缩停止 ?? 结束事实?.状态
      const 最终校验 = 结束事实?.最终校验
      const 结束原因: 生成任务诊断['结束原因'] =
        停止 === 'resource_exhausted' || 最终校验 === 'resource_exhausted'
          ? 'resource_exhausted'
          : 停止 === 'cancelled' || 最终校验 === 'cancelled'
            ? 'cancelled'
            : 停止 === 'error' || 停止 === 'fatal_error' || 最终校验 === 'fatal_error'
              ? 'fatal_error'
              : 停止 === 'budget_exhausted' ||
                  (结束事实 &&
                    (!快照.进度 || !生成结果可应用(快照.进度) || (最终校验 && 最终校验 !== 'ok')))
                ? 'incomplete'
                : 'completed'
      if (最后认证进度 && (!快照.进度 || !生成结果可应用(快照.进度)))
        快照 = {
          ...快照,
          进度: {
            ...最后认证进度,
            状态: '成功',
            结束事实,
            说明:
              '任务结束，保留最后未被否定的已采纳宏' + (结束事实?.原因 ? '：' + 结束事实.原因 : ''),
          },
        }
      关闭()
      快照 = {
        ...快照,
        完成: true,
        暂停状态: '运行',
        诊断: {
          ...快照.诊断,
          结束原因,
          结束事实,
          原始错误:
            结束原因 === 'fatal_error' || 结束原因 === 'resource_exhausted'
              ? 结束事实?.原因
              : 快照.诊断.原始错误,
          正在执行: undefined,
        },
      }
    }
    发布()
  }
  const 取消 = () => {
    if (已结束) return
    const 保留进度 = 最后认证进度 ?? 快照.进度
    关闭()
    快照 = {
      ...快照,
      完成: true,
      暂停状态: '运行',
      进度: 保留进度 && {
        ...保留进度,
        状态: 最后认证进度 ? '成功' : '未完成',
        说明: 最后认证进度 ? '已取消，保留最后已认证宏' : '已取消，保留当前候选',
      },
      诊断: { ...快照.诊断, 结束原因: 'cancelled' },
    }
    发布()
  }
  try {
    线程 = 依赖.创建线程?.() ?? new Worker(new URL('./工作线程.ts', import.meta.url))
    线程.onmessage = (事件: MessageEvent<生成线程输出>) => {
      void 接收(事件.data).catch(失败)
    }
    线程.onerror = (事件) => {
      失败(事件.message || '生成 Worker 执行失败')
    }
    线程.onmessageerror = () => {
      快照 = { ...快照, 诊断: { ...快照.诊断, 交接完整: false } }
      失败('无法完整接收生成 Worker 消息')
    }
    发送({ 类型: '开始', 任务id, 任务 })
  } catch (错误) {
    失败(错误)
  }
  if (!已结束) window.addEventListener('pagehide', 取消, { once: true })
  return {
    获取快照: () => 快照,
    暂停: () => {
      if (已结束) return
      快照 = { ...快照, 暂停状态: '等待暂停边界' }
      发布()
      try {
        发送({ 类型: '控制', 任务id, 控制: '暂停' })
      } catch (错误) {
        失败(错误)
      }
    },
    继续: () => {
      if (已结束) return
      try {
        发送({ 类型: '控制', 任务id, 控制: '继续' })
      } catch (错误) {
        失败(错误)
      }
    },
    取消,
  }
}
