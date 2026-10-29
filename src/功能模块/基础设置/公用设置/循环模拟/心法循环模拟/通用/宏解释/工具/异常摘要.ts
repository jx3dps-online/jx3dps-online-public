import type { 生成进度 } from '../生成/类型'
import type { 生成任务诊断 } from '../生成/任务协议'
import type { 回放比较, 回放信封 } from '../生成/结果校验'

export const 异常摘要字节上限 = 32 * 1024

// 只投影需要反馈的字段，绝不序列化完整轨迹、认证和候选集合。
export const 生成异常摘要 = (输入: {
  请求文本: string
  时间: string
  异常: { 类型: string; 说明: string }
  首次异常进度?: 生成进度
  当前进度?: 生成进度
  错误: string
  诊断?: 生成任务诊断
}) => {
  let 已截取 = false
  const 限制文本 = (值: string | undefined, 长度: number) => {
    if (值 === undefined) return undefined
    if (值.length <= 长度) return 值
    已截取 = true
    return 值.slice(0, 长度) + '…（已截取）'
  }
  const 比较摘要 = (比较?: 回放比较) =>
    比较 && {
      reproduced: 比较.reproduced,
      completed_full_replay: 比较.completed_full_replay,
      acceptance_prefix: 比较.acceptance_prefix,
      target_count: 比较.target_count,
      actual_count: 比较.actual_count,
      time_tolerance_seconds: 比较.time_tolerance_seconds,
      max_time_error_on_order_prefix: 比较.max_time_error_on_order_prefix,
      first_difference: 比较.first_difference && {
        index: 比较.first_difference.index,
        expected: 动作摘要(比较.first_difference.expected),
        actual: 动作摘要(比较.first_difference.actual),
      },
    }
  const 动作摘要 = (动作: NonNullable<回放比较['first_difference']>['actual']) =>
    动作 && {
      name: 限制文本(动作.name, 100),
      time: 动作.time,
      channel_ticks: 动作.channel_ticks,
      channel_duration: 动作.channel_duration,
    }
  const 进度摘要 = (进度?: 生成进度) =>
    进度 && {
      状态: 进度.状态,
      轮数: 进度.轮数,
      目标数: 进度.目标数,
      匹配数: 进度.匹配数,
      字符数: 进度.宏.length,
      说明: 限制文本(进度.说明, 500),
      首次分歧: 限制文本(进度.首次分歧, 500),
      已认证: 进度.已认证,
      最大偏差: 进度.最大偏差,
      容差: 进度.容差,
      压缩: 进度.压缩 && {
        初始字符: 进度.压缩.初始字符,
        最佳字符: 进度.压缩.最佳字符,
        试算次数: 进度.压缩.试算次数,
        接受次数: 进度.压缩.接受次数,
      },
      最近回放: 比较摘要(进度.最近回放?.比较),
    }
  const 请求 = JSON.parse(输入.请求文本)
  const 诊断 = 输入.诊断
  const 失败 = 诊断?.最后失败 ? 诊断.候选[诊断.最后失败] : undefined
  const 证据 = 失败?.证据 as 回放信封 | undefined
  const 内容 = {
    格式: 'macro-feedback-summary-v1',
    时间: 输入.时间,
    异常: { 类型: 输入.异常.类型, 说明: 限制文本(输入.异常.说明, 500) },
    请求: {
      心法: 请求.心法,
      加速值: 请求.参数?.加速值,
      网络延迟: 请求.参数?.网络延迟,
      大橙武模拟: 请求.参数?.大橙武模拟,
      奇穴: 限制文本(JSON.stringify(请求.参数?.奇穴), 1000),
      秘籍: 限制文本(JSON.stringify(请求.参数?.秘籍), 2000),
      起手Buff: 限制文本(JSON.stringify(请求.参数?.起手Buff配置), 1000),
      起手锐意: 请求.参数?.起手锐意,
      起手温寒: 请求.参数?.起手温寒,
      起手内力: 请求.参数?.起手内力,
      起手唤灵印数量: 请求.参数?.起手唤灵印数量,
      气血比例: 请求.气血比例,
      容差: 请求.容差,
      随机种子: 请求.随机种子,
      允许数字IDBuff: 请求.允许数字IDBuff === true,
      动作数: 请求.当前循环?.length,
      循环: 限制文本(请求.当前循环?.join(','), 4000),
    },
    首次异常进度: 进度摘要(输入.首次异常进度),
    当前进度: 进度摘要(输入.当前进度),
    当前宏: 限制文本(输入.当前进度?.宏, 2000),
    错误: 限制文本(输入.错误, 1000),
    任务: 诊断 && {
      id: 诊断.任务id,
      构建: 诊断.构建,
      结束原因: 诊断.结束原因,
      原始错误: 限制文本(诊断.原始错误, 1000),
      正在执行: 诊断.正在执行,
      历史最佳: 诊断.历史最佳,
      最后失败: 诊断.最后失败,
    },
    失败候选: 失败 && {
      id: 失败.记录.id,
      来源: 失败.记录.来源,
      轮数: 失败.记录.轮数,
      字符数: 失败.记录.UTF16字符,
      原文: 限制文本(失败.记录.文本, 2000),
      错误: 限制文本(失败.错误, 1000),
      比较: 比较摘要(证据?.comparison),
    },
    已截取: false,
  }
  内容.已截取 = 已截取
  let 文本 = ''
  for (const 字段上限 of [4000, 1000, 256, 64]) {
    文本 = JSON.stringify(
      内容,
      (_, 值) => (typeof 值 === 'string' ? 限制文本(值, 字段上限) : 值),
      2,
    )
    if (已截取 && !内容.已截取) {
      内容.已截取 = true
      continue
    }
    if (new TextEncoder().encode(文本).length <= 异常摘要字节上限) return 文本
    内容.已截取 = true
  }
  // 旧缓存中的诊断没有完整结构校验；极端异常数据只保留固定大小的定位信息。
  return JSON.stringify({
    格式: 'macro-feedback-summary-v1',
    已截取: true,
    说明: '反馈内容过大，仅保留定位信息。',
    错误: 限制文本(输入.错误, 256),
    最后失败: typeof 诊断?.最后失败 === 'string' ? 诊断.最后失败.slice(0, 64) : undefined,
    首次分歧: 限制文本(输入.当前进度?.首次分歧, 256),
  })
}
